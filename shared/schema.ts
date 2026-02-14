import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ringFinishValues = [
  "yellow_gold",
  "white_gold",
  "rose_gold",
  "silver",
  "platinum",
] as const;

export const ringProfileValues = ["classic", "comfort", "court"] as const;
export const ringEngravingValues = [
  "none",
  "line",
  "chevron",
  "dots",
  "twist",
] as const;
export const gemShapeValues = [
  "round",
  "princess",
  "oval",
  "marquise",
] as const;

export const designParamsSchema = z.object({
  bandRadius: z.coerce.number().min(0.7).max(1.6),
  bandThickness: z.coerce.number().min(0.05).max(0.22),
  bandWidth: z.coerce.number().min(0.08).max(0.45),
  gemCount: z.coerce.number().int().min(0).max(7),
  gemSize: z.coerce.number().min(0.05).max(0.25),
  gemHeight: z.coerce.number().min(0).max(0.22),
  finish: z.enum(ringFinishValues),
  profile: z.enum(ringProfileValues),
  engraving: z.enum(ringEngravingValues),
  gemShape: z.enum(gemShapeValues),
  twist: z.coerce.number().min(0).max(1),
});

export const designParamsPatchSchema = designParamsSchema.partial();

export type DesignParams = z.infer<typeof designParamsSchema>;

export const defaultDesignParams: DesignParams = {
  bandRadius: 1.0,
  bandThickness: 0.1,
  bandWidth: 0.2,
  gemCount: 1,
  gemSize: 0.18,
  gemHeight: 0.02,
  finish: "yellow_gold",
  profile: "comfort",
  engraving: "line",
  gemShape: "round",
  twist: 0.35,
};

export const designs = pgTable("designs", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"),
  modelUrl: text("model_url"),
  symbols: jsonb("symbols").$type<string[]>(),
  designParams: jsonb("design_params").$type<DesignParams>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDesignSchema = createInsertSchema(designs).omit({
  id: true,
  createdAt: true,
  imageUrl: true,
  modelUrl: true,
  symbols: true,
  designParams: true,
});

export type Design = typeof designs.$inferSelect;
export type InsertDesign = z.infer<typeof insertDesignSchema>;
