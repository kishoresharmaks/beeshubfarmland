import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BeesHub Farmland Pvt - Farm Fresh & Natural Products",
  description: "Browse authentic farm fresh, organic, and natural handcrafted products directly from BeesHub Farmland Pvt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-[#FFFCFB] text-[#163B5C] antialiased flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
