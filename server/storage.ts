import { type Design, type DesignParams, type InsertDesign } from "@shared/schema";

export interface IStorage {
  createDesign(design: InsertDesign & { imageUrl?: string, modelUrl?: string, symbols?: string[], designParams?: DesignParams }): Promise<Design>;
  getDesign(id: number): Promise<Design | undefined>;
  getAllDesigns(): Promise<Design[]>;
  updateDesignParams(id: number, designParams: DesignParams): Promise<Design | undefined>;
}

export class InMemoryStorage implements IStorage {
  private designs: Design[] = [];
  private nextId = 1;

  async createDesign(insertDesign: InsertDesign & { imageUrl?: string, modelUrl?: string, symbols?: string[], designParams?: DesignParams }): Promise<Design> {
    const design: Design = {
      id: this.nextId++,
      prompt: insertDesign.prompt,
      imageUrl: insertDesign.imageUrl ?? null,
      modelUrl: insertDesign.modelUrl ?? null,
      symbols: insertDesign.symbols ?? null,
      designParams: insertDesign.designParams ?? null,
      createdAt: new Date(),
    };

    this.designs.push(design);
    return design;
  }

  async getDesign(id: number): Promise<Design | undefined> {
    return this.designs.find((design) => design.id === id);
  }

  async getAllDesigns(): Promise<Design[]> {
    return [...this.designs].sort((a, b) => {
      const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return right - left;
    });
  }

  async updateDesignParams(id: number, designParams: DesignParams): Promise<Design | undefined> {
    const index = this.designs.findIndex((design) => design.id === id);
    if (index < 0) return undefined;

    const current = this.designs[index];
    const updated: Design = {
      ...current,
      designParams,
    };
    this.designs[index] = updated;

    return updated;
  }
}

export const storage = new InMemoryStorage();
