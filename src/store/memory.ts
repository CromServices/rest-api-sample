import type { Entity, Store } from "./store.ts";

/** In-memory Store<T>. Data is lost on restart: fine for demos and tests. */
export class InMemoryStore<T extends Entity> implements Store<T> {
  private rows = new Map<string, T>();
  private seq = 0;

  async list(): Promise<T[]> {
    return [...this.rows.values()].sort((a, b) => Number(a.id) - Number(b.id));
  }

  async get(id: string): Promise<T | undefined> {
    return this.rows.get(id);
  }

  async create(data: Omit<T, "id">): Promise<T> {
    this.seq += 1;
    const row = { ...data, id: String(this.seq) } as T;
    this.rows.set(row.id, row);
    return row;
  }

  async update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | undefined> {
    const current = this.rows.get(id);
    if (!current) return undefined;
    const next = { ...current, ...patch, id } as T;
    this.rows.set(id, next);
    return next;
  }

  async delete(id: string): Promise<boolean> {
    return this.rows.delete(id);
  }

  async clear(): Promise<void> {
    this.rows.clear();
    this.seq = 0;
  }
}
