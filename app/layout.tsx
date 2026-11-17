import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import PostHogInit from "@/components/PostHogInit";
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
    "Beeshub",
    "Pure Organic Honey",
    "Farm Fresh Honey Kanyakumari",
    "Organic Spices Tamil Nadu",
    "Natural Honey Online Store",
    "Kanyakumari Farmlands",
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
    title: "BEES HUB FARMLAND PRIVATE LIMITED — Pure & Fresh Organic Produce",
    description:
      "Handpicked pure honey, organic spices, and farm-fresh harvest delivered directly from Kanyakumari farmlands to your home.",
    url: "https://beeshubfarmland.com",
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
        <link rel="icon" href="/logo.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": ["Store", "Organization"],
                  "@id": "https://beeshubfarmland.com/#organization",
                  "name": "BEES HUB FARMLAND PRIVATE LIMITED",
                  "legalName": "BEES HUB FARMLAND PRIVATE LIMITED",
                  "alternateName": "BeesHub Farmland",
                  "url": "https://beeshubfarmland.com",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://beeshubfarmland.com/logo.jpg",
                    "caption": "BEES HUB FARMLAND PRIVATE LIMITED Logo"
                  },
                  "image": "https://beeshubfarmland.com/logo.jpg",
                  "telephone": "+919578784431",
                  "priceRange": "₹₹",
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "2/26-1, Muhilanvilai, Monikettipottal, nagercoil",
                    "addressLocality": "Kanyakumari District",
                    "addressRegion": "Tamil Nadu",
                    "postalCode": "629501",
                    "addressCountry": "IN"
                  },
                  "areaServed": {
                    "@type": "Country",
                    "name": "India"
                  },
                  "sameAs": [
                    "https://www.facebook.com/Beeshubfarmland/",
                    "https://www.instagram.com/beeshubfarmland",
                    "https://www.youtube.com/@BeesHubFarmlandPvtLtd"
                  ]
                },
                {
                  "@type": "WebSite",
                  "@id": "https://beeshubfarmland.com/#website",
                  "url": "https://beeshubfarmland.com",
                  "name": "BeesHub Farmland",
                  "description": "Pure honey, natural spices and organic farm produce delivered directly from Kanyakumari farmlands.",
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
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `(function(i,m,p,a,c,t){c.ire_o=p;c[p]=c[p]||function(){(c[p].a=c[p].a||[]).push(arguments)};t=a.createElement(m);var z=a.getElementsByTagName(m)[0];t.async=1;t.src=i;z.parentNode.insertBefore(t,z)})('https://utt.impactcdn.com/P-A7805805-7b0f-4744-b530-9e416581216c1.js','script','impactStat',document,window);impactStat('transformLinks');impactStat('trackImpression');`,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#FFFCFB] text-[#163B5C] antialiased flex flex-col justify-between">
        <PostHogInit />
        {children}
      </body>
    </html>
  );
}
