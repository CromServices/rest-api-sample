/** Anything kept in a Store has a string id assigned by the store. */
export type Entity = { id: string };

/**
 * Storage port. Routes depend on this interface only, so the in-memory
 * implementation can be swapped for a database adapter without route changes.
 * Methods are async so real backends fit the same shape.
 */
export interface Store<T extends Entity> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | undefined>;
  create(data: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | undefined>;
  delete(id: string): Promise<boolean>;
  clear(): Promise<void>;
}
