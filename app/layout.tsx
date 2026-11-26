import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
import ImpactAnalytics from "@/components/ImpactAnalytics";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "BEES HUB FARMLAND — Pure Forest Honey, Cold-Pressed Oils, Superfood Powders & Private Label",
    template: "%s | BEES HUB FARMLAND",
  },
  description:
    "Direct farmgate producer in Kanyakumari, Western Ghats. Certified pure wild forest honey, wood cold-pressed virgin oils, dehydrated fruit powders (Nendran Banana, Sweet Potato), jumbo makhana, private label bottling, and bespoke event gift hampers.",
  keywords: [
    "BEES HUB FARMLAND PRIVATE LIMITED",
    "BeesHub Farmland",
    "Pure Wild Forest Honey",
    "Dehydrated Nendran Banana Powder",
    "Red Banana Powder Chevvazhai",
    "Sweet Potato Powder",
    "Cold Pressed Virgin Coconut Oil",
    "Cold Pressed Sesame Oil",
    "Jumbo Fox Nut Makhana",
    "Private Label Honey Packaging India",
    "Contract Bottling Tamil Nadu",
    "Wedding Return Gift Hampers",
    "Corporate Wellness Gifts",
    "Kanyakumari Western Ghats Farmgate",
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
    title: "BEES HUB FARMLAND — Pure Honey, Cold-Pressed Oils & Superfoods",
    description:
      "Direct farmgate pure wild forest honey, wood cold-pressed virgin oils, dehydrated superfood powders, private label contract manufacturing, and artisanal event gift hampers from Kanyakumari.",
    url: "https://beeshubfarmland.com",
    siteName: "BEES HUB FARMLAND PRIVATE LIMITED",
    images: [
      {
        url: "/images/beeshub-logo.png",
        width: 1137,
        height: 451,
        alt: "BEES HUB FARMLAND Official Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEES HUB FARMLAND — Pure Honey, Cold-Pressed Oils & Superfoods",
    description: "Pure wild forest honey, wood cold-pressed oils, dehydrated powders, and private label services.",
    images: ["/images/beeshub-logo.png"],
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
                  "alternateName": ["BeesHub Farmland", "BeesHub"],
                  "url": "https://beeshubfarmland.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://beeshubfarmland.com/images/beeshub-logo.png",
                    "caption": "BEES HUB FARMLAND Logo"
                  },
                  "image": "https://beeshubfarmland.com/images/beeshub-logo.png",
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
                    "addressCountry": "IN"
                  },
                  "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 8.1833,
                    "longitude": 77.4119
                  },
                  "areaServed": {
                    "@type": "Country",
                    "name": "India"
                  },
                  "sameAs": [
                    "https://www.facebook.com/Beeshubfarmland/",
                    "https://www.instagram.com/beeshubfarmland",
                    "https://www.youtube.com/@BeesHubFarmlandPvtLtd"
                  ],
                  "knowsAbout": [
                    "Apiculture",
                    "Pure Wild Forest Honey",
                    "Wood Cold-Pressed Virgin Oils",
                    "Dehydrated Nendran Banana Powder",
                    "Red Banana Powder",
                    "Sweet Potato Powder",
                    "Makhana Fox Nuts",
                    "Private Label Bottling",
                    "Wedding Return Gift Hampers"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://beeshubfarmland.com/#website",
                  "url": "https://beeshubfarmland.com",
                  "name": "BeesHub Farmland",
                  "description": "Pure wild forest honey, wood cold-pressed virgin oils, dehydrated fruit powders, and private label bottling from Kanyakumari.",
                  "publisher": {
                    "@id": "https://beeshubfarmland.com/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://beeshubfarmland.com/?search={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FFFCFB] text-[#163B5C] antialiased flex flex-col justify-between">
        <PostHogInit />
        <ImpactAnalytics />
        {children}
      </body>
    </html>
  );
}
