import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { createApp } from '../src/app.ts';
import { ItemStore, validateCreateItem } from '../src/store.ts';

describe('validateCreateItem', () => {
  it('accepts a trimmed name', () => {
    const result = validateCreateItem({ name: '  Widget  ' });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.value.name, 'Widget');
  });

  it('rejects empty name', () => {
    const result = validateCreateItem({ name: '   ' });
    assert.equal(result.ok, false);
  });

  it('rejects non-object body', () => {
    const result = validateCreateItem('nope');
    assert.equal(result.ok, false);
  });
});

describe('HTTP /health and /items', () => {
  const store = new ItemStore();
  let server: Server;
  let baseUrl = '';

  before(async () => {
    const app = createApp(store);
    await new Promise<void>((resolve) => {
      server = app.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    if (!addr || typeof addr === 'string') throw new Error('expected TCP address');
    baseUrl = `http://127.0.0.1:${addr.port}`;
  });

  after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  });

  it('GET /health returns ok', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { ok: true });
  });

  it('POST /items validates and creates', async () => {
    store.clear();
    const bad = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: '' }),
    });
    assert.equal(bad.status, 400);

    const ok = await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Alpha' }),
    });
    assert.equal(ok.status, 201);
    const body = (await ok.json()) as { item: { id: string; name: string } };
    assert.equal(body.item.name, 'Alpha');
    assert.ok(body.item.id);
  });

  it('GET /items lists created rows', async () => {
    store.clear();
    await fetch(`${baseUrl}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: 'Beta' }),
    });
    const res = await fetch(`${baseUrl}/items`);
    assert.equal(res.status, 200);
    const body = (await res.json()) as { items: Array<{ name: string }> };
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].name, 'Beta');
  });
});
