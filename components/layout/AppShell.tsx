"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import BottomNav from "@/components/BottomNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/design-studio/workspace");

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          <Header />
          {children}
          {!hideFooter && <Footer />}
          <BottomNav />
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
