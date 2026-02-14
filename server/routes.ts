import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import {
  defaultDesignParams,
  designParamsPatchSchema,
  designParamsSchema,
  gemShapeValues,
  ringEngravingValues,
  ringFinishValues,
  ringProfileValues,
  type DesignParams,
} from "@shared/schema";
import { z } from "zod";

const GROQ_API_BASE = process.env.GROQ_API_BASE || "https://api.groq.com/openai/v1";
const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || "llama-3.1-8b-instant";

type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    type?: string;
    code?: string;
  };
};

class GroqApiError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly providerType?: string,
    readonly providerCode?: string,
  ) {
    super(message);
    this.name = "GroqApiError";
  }
}

function getGroqApiKey(): string {
  const rawKey = process.env.groq_api ?? process.env.GROQ_API_KEY;
  const key = rawKey?.trim().replace(/^['"]|['"]$/g, "");

  if (!key) {
    throw new Error("Missing Groq API key. Set GROQ_API_KEY in your .env file.");
  }

  return key;
}

function fallbackDesignParams(): DesignParams {
  return { ...defaultDesignParams };
}

function normalizeDesignParams(input: unknown): DesignParams {
  const partial = designParamsPatchSchema.safeParse(input);
  if (!partial.success) return fallbackDesignParams();

  const merged = {
    ...defaultDesignParams,
    ...partial.data,
  };
  const validated = designParamsSchema.safeParse(merged);
  return validated.success ? validated.data : fallbackDesignParams();
}

function cleanSymbols(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const result: string[] = [];
  const seen = new Set<string>();

  for (const item of input) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const normalized = trimmed.toLowerCase();
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(trimmed.slice(0, 32));

    if (result.length >= 5) break;
  }

  return result;
}

async function groqChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
): Promise<string> {
  const response = await fetch(
    `${GROQ_API_BASE}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getGroqApiKey()}`,
      },
      body: JSON.stringify({
        model: GROQ_TEXT_MODEL,
        messages,
        temperature: 0,
        response_format: { type: "json_object" },
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    let message = details;
    let providerType: string | undefined;
    let providerCode: string | undefined;

    try {
      const parsed = JSON.parse(details) as {
        error?: {
          message?: string;
          type?: string;
          code?: string;
        };
      };

      if (parsed.error?.message) {
        message = parsed.error.message;
      }
      providerType = parsed.error?.type;
      providerCode = parsed.error?.code;
    } catch {
      // Keep raw text message when provider response is not JSON.
    }

    throw new GroqApiError(
      message,
      response.status,
      providerType,
      providerCode,
    );
  }

  const payload = (await response.json()) as GroqChatResponse;
  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    const message = payload.error?.message || "Groq returned an empty response.";
    throw new GroqApiError(
      message,
      502,
      payload.error?.type,
      payload.error?.code,
    );
  }
  return content;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post(api.designs.create.path, async (req, res) => {
    try {
      const input = api.designs.create.input.parse(req.body);
      const prompt = input.prompt;

      // 1) extract symbols + generate parametric ring controls with Groq
      const conceptPrompt = [
        "You are a jewelry design assistant.",
        "Return ONLY valid JSON with this shape:",
        '{"symbols":["Rose","Chessboard","Diamond"],"designParams":{"bandRadius":1.0,"bandThickness":0.1,"bandWidth":0.2,"gemCount":1,"gemSize":0.18,"gemHeight":0.02,"finish":"yellow_gold","profile":"comfort","engraving":"line","gemShape":"round","twist":0.35}}',
        "Rules:",
        "- symbols: 3-5 short visual keywords.",
        "- finish must be one of: " + ringFinishValues.join(", "),
        "- profile must be one of: " + ringProfileValues.join(", "),
        "- engraving must be one of: " + ringEngravingValues.join(", "),
        "- gemShape must be one of: " + gemShapeValues.join(", "),
        "- bandRadius range: 0.7 to 1.6",
        "- bandThickness range: 0.05 to 0.22",
        "- bandWidth range: 0.08 to 0.45",
        "- gemCount range: integer 0 to 7",
        "- gemSize range: 0.05 to 0.25",
        "- gemHeight range: 0 to 0.22",
        "- twist range: 0 to 1",
        "Do not include markdown.",
        `Story: ${prompt}`,
      ].join("\n");

      const conceptContent = await groqChatCompletion([
        {
          role: "system",
          content:
            "Return only valid JSON and never include markdown formatting.",
        },
        { role: "user", content: conceptPrompt },
      ]);

      let symbols: string[] = ["Abstract", "Organic", "Balance"];
      let designParams: DesignParams = fallbackDesignParams();
      try {
        const content = conceptContent || '{"symbols":[],"designParams":{}}';
        const parsed = JSON.parse(content);

        const candidateSymbols = Array.isArray(parsed)
          ? cleanSymbols(parsed)
          : cleanSymbols(parsed?.symbols);
        if (candidateSymbols.length > 0) {
          symbols = candidateSymbols;
        }

        const rawDesignParams =
          parsed?.designParams ?? (Array.isArray(parsed) ? undefined : parsed);
        designParams = normalizeDesignParams(rawDesignParams);
      } catch (e) {
        console.error("Failed to parse Groq concept payload:", e);
      }

      // 2) Save concept only (image/model generation disabled)
      const design = await storage.createDesign({
        prompt: input.prompt,
        imageUrl: undefined,
        symbols: symbols,
        modelUrl: undefined,
        designParams,
      });

      res.status(201).json(design);

    } catch (err) {
      console.error("Design generation error:", err);
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else if (err instanceof GroqApiError) {
        const message = `Groq request failed (${err.statusCode}): ${err.message}`;
        res.status(502).json({ message });
      } else {
        res.status(500).json({ message: "Failed to generate design" });
      }
    }
  });

  app.patch(api.designs.updateParams.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        return res.status(400).json({ message: "Invalid design id", field: "id" });
      }

      const designParams = api.designs.updateParams.input.parse(req.body);
      const updated = await storage.updateDesignParams(id, designParams);
      if (!updated) {
        return res.status(404).json({ message: "Design not found" });
      }

      return res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }

      console.error("Design params update error:", err);
      return res.status(500).json({ message: "Failed to update design params" });
    }
  });

  app.get(api.designs.get.path, async (req, res) => {
    const design = await storage.getDesign(Number(req.params.id));
    if (!design) {
      return res.status(404).json({ message: 'Design not found' });
    }
    res.json(design);
  });

  app.get(api.designs.list.path, async (req, res) => {
    const designs = await storage.getAllDesigns();
    res.json(designs);
  });

  return httpServer;
}
