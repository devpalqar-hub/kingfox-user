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
  const isCouponPage = pathname?.startsWith("/coupons");
  // The design studio workspace is a full-screen tool: no site chrome around it.
  const isStudioWorkspace = pathname?.startsWith("/design-studio/workspace");
  const hideFooter = isStudioWorkspace || isCouponPage;
  const hideHeader = isStudioWorkspace || isCouponPage;
  const hideBottomNav = isStudioWorkspace || isCouponPage;

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          {!hideHeader && <Header />}
          {children}
          {!hideFooter && <Footer />}
          {!hideBottomNav && <BottomNav />}
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
