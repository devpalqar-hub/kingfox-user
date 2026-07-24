import "./globals.css";
import React from "react";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { Bebas_Neue, Inter } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import WhatsappButton from "@/components/whatsappButton/whatsappButton";

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
    <html lang="en">
      <body
        className={`${jakarta.variable} ${space.variable} ${bebas.variable} ${inter.variable}`}
      >
        <AppShell>
          {children}
          <WhatsappButton />
        </AppShell>
      </body>
    </html>
  );
}
