"use client";

import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import { getProfileAPI } from "@/services/profile.service";
import { pixelId } from "@/components/MetaPixel";

/**
 * Meta Pixel manual Advanced Matching.
 * Once a user is logged in, re-run fbq('init') with their email and phone.
 * The pixel hashes the values with SHA-256 itself. Renders nothing.
 */
export default function MetaPixelUserSync() {
  const { token, user } = useAuth();

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    const sync = async () => {
      let email = user?.email ?? "";
      let phone = "";

      try {
        const profile = await getProfileAPI();
        email = profile.email || email;
        phone = profile.phone || "";
      } catch {
        // fall back to whatever we already have in the stored user
      }
      if (cancelled) return;

      const advancedMatching: Record<string, string> = {};
      const em = email.trim().toLowerCase();
      // Meta expects digits only, including country code (no "+")
      const ph = phone.replace(/\D/g, "");
      if (em) advancedMatching.em = em;
      if (ph) advancedMatching.ph = ph;
      if (Object.keys(advancedMatching).length === 0) return;

      // fbq may not exist yet (script loads afterInteractive): wait briefly.
      let waited = 0;
      const attempt = () => {
        if (cancelled) return;
        if (window.fbq) {
          window.fbq("init", pixelId, advancedMatching);
        } else if ((waited += 250) <= 8000) {
          window.setTimeout(attempt, 250);
        }
      };
      attempt();
    };

    sync();
    return () => {
      cancelled = true;
    };
  }, [token, user?.email]);

  return null;
}
