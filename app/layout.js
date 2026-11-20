import { Inter, Sora } from "next/font/google";
import { shop } from "../data/shop";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: {
    default: `${shop.name} · Football jerseys`,
    template: `%s · ${shop.name}`,
  },
  description: "Football jerseys from the clubs you love. Check your size online. Order on WhatsApp.",
  appleWebApp: {
    capable: true,
    title: shop.name,
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
