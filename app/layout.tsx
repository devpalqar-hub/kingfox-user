import "./globals.css";
import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";

import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { ToastProvider } from "@/context/ToastContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300","400","500","600","700","800"],
  variable: "--font-jakarta",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  variable: "--font-space",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${space.variable}`}>

        {/* ✅ FIX: Wrap with AuthProvider */}
        <AuthProvider>
          <ToastProvider>
            <Header />
            {children}
            <Footer />
          </ToastProvider>
        </AuthProvider>

      </body>
    </html>
  );
}