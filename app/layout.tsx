import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
import ImpactAnalytics from "@/components/ImpactAnalytics";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Bees Hub Farmland | Pure Honey & Organic Products India",
    template: "%s | Bees Hub Farmland",
  },
  description:
    "Discover farm-sourced honey, superfood powders and cold-pressed oils from Bees Hub Farmland, Tamil Nadu. Explore quality agricultural products and wholesale supply solutions.",
  keywords: [
    "BEES HUB FARMLAND PRIVATE LIMITED",
    "Bees Hub Farmland",
    "Pure Forest Honey India",
    "Natural Honey Tamil Nadu",
    "Dehydrated Nendran Banana Powder",
    "Red Banana Powder",
    "Natural Dates Powder",
    "Cold Pressed Virgin Coconut Oil",
    "Cold Pressed Sesame Oil",
    "Superfood Powders India",
    "Wholesale Agricultural Ingredients",
    "Private Label Honey Bottling India",
    "Kanyakumari Farm Products",
  ],
  authors: [{ name: "BEES HUB FARMLAND PRIVATE LIMITED" }],
  creator: "BEES HUB FARMLAND PRIVATE LIMITED",
  publisher: "BEES HUB FARMLAND PRIVATE LIMITED",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Bees Hub Farmland | Pure Honey & Organic Products India",
    description:
      "Discover farm-sourced honey, superfood powders and cold-pressed oils from Bees Hub Farmland, Tamil Nadu. Explore quality agricultural products and wholesale supply solutions.",
    url: "https://beeshubfarmland.com",
    siteName: "BEES HUB FARMLAND PRIVATE LIMITED",
    images: [
      {
        url: "/images/beeshub-pure-forest-honey-spotlight.webp",
        width: 1200,
        height: 630,
        alt: "Bees Hub Farmland Pure Forest Honey and Agricultural Products",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bees Hub Farmland | Pure Honey & Organic Products India",
    description:
      "Farm-sourced honey, superfood powders, cold-pressed oils, and wholesale supply solutions from Kanyakumari, Tamil Nadu.",
    images: ["/images/beeshub-pure-forest-honey-spotlight.webp"],
  },
  metadataBase: new URL("https://beeshubfarmland.com"),
  alternates: {
    canonical: "https://beeshubfarmland.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["FoodManufacturingBusiness", "Store", "Organization"],
                  "@id": "https://beeshubfarmland.com/#organization",
                  "name": "BEES HUB FARMLAND PRIVATE LIMITED",
                  "legalName": "BEES HUB FARMLAND PRIVATE LIMITED",
                  "alternateName": ["Bees Hub Farmland", "BeesHub Farmland", "BeesHub"],
                  "url": "https://beeshubfarmland.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://beeshubfarmland.com/images/beeshub-logo.png",
                    "caption": "Bees Hub Farmland Logo",
                  },
                  "image": "https://beeshubfarmland.com/images/beeshub-pure-forest-honey-spotlight.webp",
                  "telephone": "+919578784431",
                  "email": "admin@beeshubfarmland.com",
                  "priceRange": "₹₹",
                  "taxID": "33AAOCB0453D1Z3",
                  "vatID": "33AAOCB0453D1Z3",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "Door No: 2/26-1, Muhilanvilai, Monikettipottal-Post",
                    "addressLocality": "Nagercoil, Kanyakumari District",
                    "addressRegion": "Tamil Nadu",
                    "postalCode": "629501",
                    "addressCountry": "IN",
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 8.1833,
                    "longitude": 77.4119,
                  },
                  "areaServed": {
                    "@type": "Country",
                    "name": "India",
                  },
                  "sameAs": [
                    "https://www.facebook.com/Beeshubfarmland/",
                    "https://www.instagram.com/beeshubfarmland",
                    "https://www.youtube.com/@BeesHubFarmlandPvtLtd",
                  ],
                  "knowsAbout": [
                    "Apiculture",
                    "Pure Wild Forest Honey",
                    "Wood Cold-Pressed Virgin Oils",
                    "Dehydrated Nendran Banana Powder",
                    "Red Banana Powder",
                    "Natural Dates Powder",
                    "Sweet Potato Powder",
                    "Makhana Fox Nuts",
                    "Private Label Bottling",
                    "Wholesale Agricultural Ingredients",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://beeshubfarmland.com/#website",
                  "url": "https://beeshubfarmland.com",
                  "name": "Bees Hub Farmland",
                  "description":
                    "Farm-sourced honey, superfood powders, cold-pressed oils, and wholesale supply solutions from Kanyakumari, Tamil Nadu.",
                  "publisher": {
                    "@id": "https://beeshubfarmland.com/#organization",
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://beeshubfarmland.com/shop?search={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-[#202820] font-sans antialiased flex flex-col justify-between">
        <PostHogInit />
        <ImpactAnalytics />
        {children}
      </body>
    </html>
  );
}
