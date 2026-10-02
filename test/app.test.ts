import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createApp } from "../src/app.ts";
import { InMemoryStore } from "../src/store/memory.ts";
import type { Item } from "../src/routes/items.ts";

describe("HTTP", () => {
  const store = new InMemoryStore<Item>();
  let server: Server;
  let baseUrl = "";

  before(async () => {
    const app = createApp({
      itemStore: store,
      config: { name: "test-app", description: "<b>desc</b>", liveUrl: "" },
    });
    await new Promise<void>((resolve) => {
      server = app.listen(0, "127.0.0.1", () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === "string") throw new Error("expected TCP address");
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it("GET /health returns {status:'ok'}", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { status: "ok" });
  });

  it("GET / serves minimal HTML with the theme slot link and escaped config", async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get("content-type") ?? "", /text\/html/);
    const html = await res.text();
    assert.match(html, /<h1>test-app<\/h1>/);
    assert.match(html, /&lt;b&gt;desc&lt;\/b&gt;/);
    assert.match(html, /href="https:\/\/cromservices\.github\.io\/crom-shared\/theme\.css"/);
    assert.equal((html.match(/rel="stylesheet"/g) ?? []).length, 1);
    assert.doesNotMatch(html, /<style/);
  });

  it("POST /items validates (400) and creates (201)", async () => {
    await store.clear();
    const bad = await fetch(`${baseUrl}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "" }),
    });
    assert.equal(bad.status, 400);
    assert.ok(((await bad.json()) as { error: string }).error);

    const good = await fetch(`${baseUrl}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "  Alpha  " }),
    });
    assert.equal(good.status, 201);
    const body = (await good.json()) as { item: Item };
    assert.equal(body.item.name, "Alpha");
    assert.equal(body.item.id, "1");
  });

  it("GET /items and /items/:id read from the store; DELETE removes", async () => {
    await store.clear();
    await store.create({ name: "Beta", createdAt: new Date().toISOString() });
    const list = (await (await fetch(`${baseUrl}/items`)).json()) as { items: Item[] };
    assert.equal(list.items.length, 1);
    assert.equal((await fetch(`${baseUrl}/items/1`)).status, 200);
    assert.equal((await fetch(`${baseUrl}/items/99`)).status, 404);
    assert.equal((await fetch(`${baseUrl}/items/1`, { method: "DELETE" })).status, 204);
    assert.equal((await fetch(`${baseUrl}/items/1`)).status, 404);
  });

  it("malformed JSON returns 400 JSON, unknown route returns 404 JSON", async () => {
    const bad = await fetch(`${baseUrl}/items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{not json",
    });
    assert.equal(bad.status, 400);
    assert.deepEqual(await bad.json(), { error: "bad request" });
    const missing = await fetch(`${baseUrl}/nope`);
    assert.equal(missing.status, 404);
    assert.deepEqual(await missing.json(), { error: "not found" });
  });
});
