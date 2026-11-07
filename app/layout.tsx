import "./globals.css";
import React from "react";
<<<<<<< HEAD
import { Plus_Jakarta_Sans, Space_Grotesk, Geist } from "next/font/google";
=======
import { Geist, Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
>>>>>>> origin/production
import { Bebas_Neue, Inter } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import WhatsappButton from "@/components/whatsappButton/whatsappButton";
import { cn } from "@/lib/utils";
<<<<<<< HEAD

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
=======
import MetaPixel from "@/components/MetaPixel";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });
>>>>>>> origin/production

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
<<<<<<< HEAD
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
=======
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

>>>>>>> origin/production
      </head>
      <body
        className={`${jakarta.variable} ${space.variable} ${bebas.variable} ${inter.variable}`}
      >
        <MetaPixel />
        <AppShell>
          {children}
          <WhatsappButton />
        </AppShell>
      </body>
    </html>
  );
}
