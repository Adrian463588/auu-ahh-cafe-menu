import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("catalog, search, category and browser history", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByTestId("menu-item")).toHaveCount(32);
  await page.getByRole("button", { name: "Coffee Based", exact: true }).click();
  await expect(page.getByTestId("menu-item")).toHaveCount(10);
  await page.getByRole("button", { name: "Milk Based", exact: true }).click();
  await expect(page.getByTestId("menu-item")).toHaveCount(5);
  await page.goBack();
  await expect(page.getByRole("button", { name: "Coffee Based", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: /AUU AHH/ }).click();
  await expect(page.getByTestId("menu-item")).toHaveCount(32);
  await expect(page).not.toHaveURL(/kategori=/);
  await page.getByRole("searchbox", { name: "Cari menu" }).fill("tidak-ada-menu-ini");
  await expect(page.getByRole("heading", { name: "Belum ketemu yang dicari?" })).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan semua menu" }).click();
  await expect(page.getByTestId("menu-item")).toHaveCount(32);
  expect(errors).toEqual([]);
});

test("real catalog order, validation, persistence, ticket, keyboard, print and reset", async ({ page, context }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Varian Matcha Latte" }).selectOption("ice");
  await page.getByRole("button", { name: "Tambah Matcha Latte Ice", exact: true }).click();
  await page.getByRole("button", { name: "Tambah jumlah Matcha Latte Ice", exact: true }).click();
  await page.getByRole("button", { name: "Tambah Chicken Katsu", exact: true }).click();
  await expect(page.getByTestId("cart-total")).toContainText("85.000");
  await page.getByRole("button", { name: "Siapkan ringkasan" }).click();
  await expect(page.getByText("Isi nama pemesan sebelum menyiapkan ringkasan.")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Nama pemesan" })).toBeFocused();
  await page.getByRole("textbox", { name: "Nama pemesan" }).fill("Ayu");
  await page.getByRole("radio", { name: "Bawa pulang", exact: true }).check();
  await page.getByRole("textbox", { name: "Catatan opsional" }).fill("Tanpa es tambahan");
  await page.reload();
  await expect(page.getByTestId("cart-total")).toContainText("85.000");
  await expect(page.getByRole("textbox", { name: "Nama pemesan" })).toHaveValue("Ayu");
  const action = page.getByRole("button", { name: "Siapkan ringkasan" });
  await action.focus();
  await page.keyboard.press("Enter");
  const ticket = page.getByRole("dialog");
  await expect(ticket).toBeVisible();
  await expect(ticket).toContainText("85.000");
  await expect(ticket).toContainText("Bawa pulang");
  await expect(ticket).toContainText("belum dikirim");
  await expect(ticket).toContainText("Tanpa es tambahan");
  await page.keyboard.press("Escape");
  await expect(ticket).not.toBeVisible();
  await expect(action).toBeFocused();
  await page.keyboard.press("Enter");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Salin ringkasan", exact: true }).click();
  await expect(page.getByText("Ringkasan berhasil disalin.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("Ayu");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByRole("heading", { name: "Pilihanmu sudah siap." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Menu kami", exact: true })).not.toBeVisible();
  await page.emulateMedia({ media: "screen" });
  await page.getByRole("button", { name: "Pesanan baru", exact: true }).click();
  await expect(ticket).not.toBeVisible();
  await expect(page.getByTestId("cart-total")).toHaveText(/Rp\s*0/);
});

test("quantity reduction and removal", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Tambah French Fries", exact: true }).click();
  await page.getByRole("button", { name: "Tambah jumlah French Fries Reguler", exact: true }).click();
  await expect(page.getByTestId("cart-total")).toContainText("36.000");
  await page.getByRole("button", { name: "Kurangi French Fries Reguler", exact: true }).click();
  await expect(page.getByTestId("cart-total")).toContainText("18.000");
  await page.getByRole("button", { name: "Hapus French Fries Reguler", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Masih kosong, nih." })).toBeVisible();
});

test("corrupt storage recovers", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("auu-ahh-order-v1", "{broken"));
  await page.goto("/");
  await expect(page.getByText(/Pesanan tersimpan tidak bisa dibaca/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Tambah Espresso Hot", exact: true })).toBeEnabled();
});

test("unavailable storage still permits an order", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Tambah Espresso Hot", exact: true }).click();
  await expect(page.getByTestId("cart-total")).toContainText("23.000");
  await expect(page.getByText(/Penyimpanan perangkat tidak tersedia/)).toBeVisible();
});

test("loaded catalog and cashier ticket work offline", async ({ page, context }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Tambah Espresso Hot", exact: true })).toBeEnabled();
  await context.setOffline(true);
  await expect(page.getByText(/Kamu sedang offline/)).toBeVisible();
  await page.getByRole("button", { name: "Tambah Espresso Hot", exact: true }).click();
  await page.getByRole("textbox", { name: "Nama pemesan" }).fill("Bima");
  await page.getByRole("button", { name: "Siapkan ringkasan" }).click();
  await expect(page.getByRole("dialog")).toContainText("Bima");
  await context.setOffline(false);
});

test("clipboard failure gives a manual recovery", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText: async () => { throw new Error("Unavailable"); } } });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Tambah Espresso Hot", exact: true }).click();
  await page.getByRole("textbox", { name: "Nama pemesan" }).fill("Citra");
  await page.getByRole("button", { name: "Siapkan ringkasan" }).click();
  await page.getByRole("button", { name: "Salin ringkasan", exact: true }).click();
  await expect(page.getByText(/Salin otomatis tidak tersedia/)).toBeVisible();
  await page.getByText("Teks pesanan", { exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Teks ringkasan pesanan untuk disalin" })).toHaveValue(/Citra/);
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`layout and accessibility at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Tambah Espresso Hot", exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const smallTargets = await page.locator("button, a, input, select, textarea, summary").evaluateAll((elements) => elements.flatMap((element) => {
      const target = element.matches('input[type="radio"]') ? element.closest("label")! : element;
      const box = target.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && (box.width < 44 || box.height < 44) ? [`${element.tagName}: ${element.textContent?.trim() || element.getAttribute("aria-label")}`] : [];
    }));
    expect(smallTargets).toEqual([]);
    await expect(page.locator(".how-to p")).toHaveText(/menu\s+dikonfirmasi/);
    const audit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`menu-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Tambah Espresso Hot", exact: true }).click();
    await page.getByRole("textbox", { name: "Nama pemesan" }).fill("Pengunjung");
    await page.getByRole("button", { name: "Siapkan ringkasan" }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    const ticketAudit = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(ticketAudit.violations).toEqual([]);
    await page.screenshot({ path: testInfo.outputPath(`ticket-${width}.png`) });
  });
}
