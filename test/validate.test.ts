import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isPlainObject, requireString } from "../src/lib/validate.ts";
import { validateCreateItem } from "../src/routes/items.ts";

describe("validate helpers", () => {
  it("isPlainObject rejects arrays, null and primitives", () => {
    assert.equal(isPlainObject({}), true);
    assert.equal(isPlainObject([]), false);
    assert.equal(isPlainObject(null), false);
    assert.equal(isPlainObject("x"), false);
  });

  it("requireString trims and enforces bounds", () => {
    const good = requireString({ name: "  Widget  " }, "name", { max: 10 });
    assert.deepEqual(good, { ok: true, value: "Widget" });
    assert.equal(requireString({ name: "   " }, "name").ok, false);
    assert.equal(requireString({ name: "x".repeat(11) }, "name", { max: 10 }).ok, false);
    assert.equal(requireString({ name: 5 }, "name").ok, false);
  });

  it("validateCreateItem rejects non-object bodies", () => {
    assert.equal(validateCreateItem("nope").ok, false);
    assert.equal(validateCreateItem([]).ok, false);
  });
});
