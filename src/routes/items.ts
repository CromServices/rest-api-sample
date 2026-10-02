// EXAMPLE RESOURCE: shows validation + Store<T> wired into a router.
// Rename or delete it when you reuse the template (and its test).
import { Router } from "express";
import type { Store } from "../store/store.ts";
import { fail, isPlainObject, ok, requireString, validateBody, type Result } from "../lib/validate.ts";

export type Item = { id: string; name: string; createdAt: string };

export type CreateItemInput = { name: string };

export function validateCreateItem(input: unknown): Result<CreateItemInput> {
  if (!isPlainObject(input)) return fail("Body must be a JSON object");
  const name = requireString(input, "name", { min: 1, max: 80 });
  if (!name.ok) return name;
  return ok({ name: name.value });
}

export function itemsRouter(store: Store<Item>): Router {
  const router = Router();

  router.get("/", async (_req, res) => {
    res.status(200).json({ items: await store.list() });
  });

  router.get("/:id", async (req, res) => {
    const item = await store.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.status(200).json({ item });
  });

  router.post("/", validateBody(validateCreateItem), async (_req, res) => {
    const input = res.locals.body as CreateItemInput;
    const item = await store.create({ name: input.name, createdAt: new Date().toISOString() });
    res.status(201).json({ item });
  });

  router.delete("/:id", async (req, res) => {
    const removed = await store.delete(req.params.id);
    res.status(removed ? 204 : 404).end();
  });

  return router;
}
