import { menu } from "./menu.ts";

export type CartEntry = { itemId: string; variantId: string; quantity: number };
export type Customer = { name: string; service: "dine-in" | "takeaway"; notes: string };
export type CartLine = CartEntry & { key: string; name: string; variant: string; price: number; subtotal: number };

export function normalizeCart(value: unknown): CartEntry[] {
  if (!Array.isArray(value)) return [];
  const entries = new Map<string, CartEntry>();
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const item = menu.find((candidate) => candidate.id === entry.itemId);
    if (!item?.variants.some((variant) => variant.id === entry.variantId)) continue;
    if (!Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 99) continue;
    const key = `${entry.itemId}:${entry.variantId}`;
    entries.set(key, {
      itemId: item.id,
      variantId: entry.variantId,
      quantity: Math.min(99, (entries.get(key)?.quantity ?? 0) + entry.quantity),
    });
  }
  return [...entries.values()];
}

export function cartLines(cart: CartEntry[]): CartLine[] {
  return normalizeCart(cart).flatMap((entry) => {
    const item = menu.find((candidate) => candidate.id === entry.itemId);
    const variant = item?.variants.find((candidate) => candidate.id === entry.variantId);
    if (!item || !variant) return [];
    return [{ ...entry, key: `${item.id}:${variant.id}`, name: item.name, variant: variant.name, price: variant.price, subtotal: variant.price * entry.quantity }];
  });
}

export const rupiah = (value: number) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(value);

export function orderText(lines: CartLine[], customer: Customer): string {
  return [
    "AUU AHH cafe", "RINGKASAN PESANAN", "",
    `Nama: ${customer.name}`,
    `Pilihan: ${customer.service === "dine-in" ? "Makan di tempat" : "Bawa pulang"}`,
    "",
    ...lines.map((line) => `${line.quantity} x ${line.name}${line.variantId === "regular" ? "" : ` (${line.variant})`} — ${rupiah(line.subtotal)}`),
    "", `Total menu: ${rupiah(lines.reduce((sum, line) => sum + line.subtotal, 0))}`,
    ...(customer.notes ? [`Catatan: ${customer.notes}`] : []),
    "", "Tunjukkan ringkasan ini ke kasir untuk memesan.",
    "Pesanan belum dikirim atau dikonfirmasi oleh kafe.",
  ].join("\n");
}
