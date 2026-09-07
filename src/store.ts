export type Item = {
  id: string;
  name: string;
  createdAt: string;
};

export type CreateItemInput = {
  name: string;
};

export class ItemStore {
  private items = new Map<string, Item>();
  private seq = 0;

  list(): Item[] {
    return [...this.items.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  create(input: CreateItemInput): Item {
    this.seq += 1;
    const item: Item = {
      id: String(this.seq),
      name: input.name,
      createdAt: new Date().toISOString(),
    };
    this.items.set(item.id, item);
    return item;
  }

  clear(): void {
    this.items.clear();
    this.seq = 0;
  }
}

export function validateCreateItem(body: unknown): { ok: true; value: CreateItemInput } | { ok: false; error: string } {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Body must be a JSON object' };
  }
  const name = (body as { name?: unknown }).name;
  if (typeof name !== 'string') {
    return { ok: false, error: 'name must be a string' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 80) {
    return { ok: false, error: 'name must be 1–80 characters after trim' };
  }
  return { ok: true, value: { name: trimmed } };
}
