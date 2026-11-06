import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AUU AHH Cafe | Menu & Pesanan",
  description: "Lihat menu AUU AHH Cafe, pilih pesananmu, dan siapkan ringkasan untuk ditunjukkan ke kasir.",
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#f6f3ec" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
