import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryStore } from "../src/store/memory.ts";
import type { Store } from "../src/store/store.ts";

type Note = { id: string; text: string };

describe("InMemoryStore", () => {
  it("implements create/get/list/update/delete/clear", async () => {
    const store: Store<Note> = new InMemoryStore<Note>();
    const a = await store.create({ text: "a" });
    const b = await store.create({ text: "b" });
    assert.equal(a.id, "1");
    assert.equal(b.id, "2");
    assert.deepEqual(await store.get("1"), { id: "1", text: "a" });
    assert.equal((await store.list()).length, 2);

    assert.deepEqual(await store.update("2", { text: "B" }), { id: "2", text: "B" });
    assert.equal(await store.update("99", { text: "x" }), undefined);

    assert.equal(await store.delete("1"), true);
    assert.equal(await store.delete("1"), false);
    assert.deepEqual(await store.list(), [{ id: "2", text: "B" }]);

    await store.clear();
    assert.deepEqual(await store.list(), []);
    assert.equal((await store.create({ text: "c" })).id, "1");
  });
});
