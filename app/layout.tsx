import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display, Roboto } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/contexts/CartContext"
import Script from "next/script"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-playfair" })
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-roboto" })

export const metadata: Metadata = {
  title: "Emilia - Artisan Cheesecakes | Lieferung in Zürich",
  description: "Die besten handgemachten Käsekuchen. Lieferung in Zürich und Umgebung.",
  generator: "v0.app",
  icons: {
    icon: "/Emilia (7).png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Analytics + Google Ads */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JL27DJQJKH"
          strategy="afterInteractive"
        />
        <Script id="google-analytics-ads" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JL27DJQJKH');
            gtag('config', 'AW-17759330762');
            gtag('config', 'AW-17552723888');
          `}
        </Script>
        {/* Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "v0ghuxofc9");
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${playfair.variable} ${roboto.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
          <Analytics />
        </CartProvider>
      </body>
    </html>
  )
}
