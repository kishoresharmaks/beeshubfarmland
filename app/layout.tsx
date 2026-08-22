import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BEES HUB FARMLAND PRIVATE LIMITED — Pure Honey & Organic Farm Produce",
  description:
    "Buy 100% pure organic honey, natural spices, and farm produce directly from BEES HUB FARMLAND PRIVATE LIMITED, Kanyakumari. Fast nationwide delivery, GST-compliant billing, Instant UPI & COD.",
  keywords: [
    "BEES HUB FARMLAND PRIVATE LIMITED",
    "BeesHub Farmland",
    "Pure Organic Honey",
    "Farm Fresh Honey Kanyakumari",
    "Organic Produce Tamil Nadu",
    "Natural Honey Online Store",
    "Unified UPI E-Commerce",
  ],
  authors: [{ name: "BEES HUB FARMLAND PRIVATE LIMITED" }],
  creator: "BEES HUB FARMLAND PRIVATE LIMITED",
  publisher: "BEES HUB FARMLAND PRIVATE LIMITED",
  icons: {
    icon: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "BEES HUB FARMLAND PRIVATE LIMITED — Pure & Fresh Organic Produce",
    description:
      "Handpicked pure honey, organic spices, and farm-fresh harvest delivered directly from Kanyakumari farmlands to your home.",
    url: "https://beeshubfarmland.onrender.com",
    siteName: "BEES HUB FARMLAND PRIVATE LIMITED",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "BEES HUB FARMLAND PRIVATE LIMITED Official Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEES HUB FARMLAND PRIVATE LIMITED",
    description: "Pure honey & organic farm produce delivered direct from farmlands.",
    images: ["/logo.jpg"],
  },
  metadataBase: new URL("https://beeshubfarmland.onrender.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
      </head>
      <body className="min-h-screen bg-[#FFFCFB] text-[#163B5C] antialiased flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
