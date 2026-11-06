import assert from "node:assert/strict";
import { test } from "node:test";
import { menu } from "../lib/menu.ts";
import { cartLines, normalizeCart, orderText } from "../lib/order.ts";

test("the complete source catalog has unique IDs and the PDF prices", () => {
  assert.equal(menu.length, 32);
  assert.equal(new Set(menu.map((item) => item.id)).size, 32);
  const expected = [
    [23000, 25000], [23000, 25000], [23000, 25000], [23000, 25000], [23000, 25000],
    [25000], [25000], [15000], [18000], [25000], [25000],
    [30000], [30000], [35000], [47000], [35000], [35000], [25000],
    [25000], [25000], [25000], [25000],
    [23000, 25000], [25000, 27000], [23000, 25000], [25000, 28000],
    [28000], [28000], [27000], [27000], [27000], [27000],
  ];
  assert.deepEqual(menu.map((item) => item.variants.map((variant) => variant.price)), expected);
});

test("restore rejects unknown menu, unsupported variants and unsafe quantities", () => {
  assert.deepEqual(normalizeCart([
    { itemId: "matcha-latte", variantId: "ice", quantity: 2, price: 1 },
    { itemId: "unknown", variantId: "regular", quantity: 1 },
    { itemId: "espresso", variantId: "regular", quantity: 1 },
    ...[0, -1, 1.5, 100, Infinity, "2"].map((quantity) => ({ itemId: "espresso", variantId: "hot", quantity })),
    null,
  ]), [{ itemId: "matcha-latte", variantId: "ice", quantity: 2 }]);
  assert.deepEqual(normalizeCart({}), []);
  assert.deepEqual(normalizeCart(null), []);
});

test("duplicate cart entries merge without exceeding the 99 item limit", () => {
  assert.deepEqual(normalizeCart([
    { itemId: "espresso", variantId: "hot", quantity: 60 },
    { itemId: "espresso", variantId: "hot", quantity: 60 },
  ]), [{ itemId: "espresso", variantId: "hot", quantity: 99 }]);
});

test("totals and cashier ticket use canonical variant prices and preserve plain text", () => {
  const lines = cartLines([
    { itemId: "matcha-latte", variantId: "ice", quantity: 2 },
    { itemId: "chicken-katsu", variantId: "regular", quantity: 1 },
  ]);
  assert.equal(lines.reduce((sum, line) => sum + line.subtotal, 0), 85000);
  assert.equal(cartLines([{ itemId: "espresso", variantId: "fake", quantity: 1 }]).length, 0);
  const text = orderText(lines, { name: "Ayu", service: "takeaway", notes: "Tanpa es tambahan" });
  assert.match(text, /Matcha Latte \(Ice\)/);
  assert.match(text, /85[.\s]000/);
  assert.match(text, /Bawa pulang/);
  assert.match(text, /Tanpa es tambahan/);
  assert.match(text, /Tunjukkan.*kasir/);
});
