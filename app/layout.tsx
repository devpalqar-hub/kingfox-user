import "./globals.css";
import React from "react";
import { Plus_Jakarta_Sans, Space_Grotesk, Geist } from "next/font/google";
import { Bebas_Neue, Inter } from "next/font/google";
import Script from "next/script"; // 1. Import the Next.js Script component
import AppShell from "@/components/layout/AppShell";
import WhatsappButton from "@/components/whatsappButton/whatsappButton";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-space",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link rel="preconnect" href="https://googleapis.com" />
        <link
          rel="preconnect"
          href="https://gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

        {/* 2. Place the Meta Pixel Tracking Script safely inside the head using strategy="afterInteractive" */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://facebook.net');
            fbq('init', '1266045331995359');
            fbq('track', 'PageView');
          `}
        </Script>
      </head>
      <body
        className={`${jakarta.variable} ${space.variable} ${bebas.variable} ${inter.variable}`}
      >
        {/* 3. The fallback noscript snippet is placed inside the body using React rules (style objects instead of strings) */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://facebook.com"
            alt=""
          />
        </noscript>

        <AppShell>
          {children}
          <WhatsappButton />
        </AppShell>
      </body>
    </html>
  );
}
