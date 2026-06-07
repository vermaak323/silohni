import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Silohni — Handcrafted Boutique, Textiles & Home Decor",
  description: "Explore Silohni's curated collections of premium handcrafted textiles, ceramics, home decor, and custom lifestyle apparel designed with organic warmth and rich design ethics.",
  keywords: ["Silohni", "boutique", "handcrafted", "ceramics", "textiles", "apparel", "home decor"],
  authors: [{ name: "Silohni Boutique" }],
  openGraph: {
    title: "Silohni — Handcrafted Boutique, Textiles & Home Decor",
    description: "Curated collections of premium handcrafted textiles, ceramics, home decor, and custom lifestyle apparel.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
      <body style={{ fontFamily: "var(--font-sans), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
