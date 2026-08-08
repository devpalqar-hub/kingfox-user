"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import BottomNav from "@/components/BottomNav";

import CouponAnnouncementBanner from "@/components/coupons/CouponAnnouncementBanner";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCouponPage = pathname?.startsWith("/coupons");
  const hideFooter = pathname?.startsWith("/design-studio/workspace") || isCouponPage;
  const hideHeader = isCouponPage;
  const hideBottomNav = isCouponPage;

  return (
    <ToastProvider>
      <ConfirmProvider>
        <AuthProvider>
          {isCouponPage && <CouponAnnouncementBanner />}
          {!hideHeader && <Header />}
          <div className={isCouponPage ? "pt-0" : ""}>
            {children}
          </div>
          {!hideFooter && <Footer />}
          {!hideBottomNav && <BottomNav />}
        </AuthProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}
