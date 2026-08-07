"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { getQRCouponDetails, claimQRCoupon } from "@/services/qrCoupon";
import { QRCouponClaimResponse } from "@/types/qrCoupon";
import CouponLoader from "@/components/coupons/CouponLoader";
import PrizePage from "@/components/coupons/PrizePage";
import ClaimForm from "@/components/coupons/ClaimForm";
import SuccessPage from "@/components/coupons/SuccessPage";
import TryHarderPage from "@/components/coupons/TryHarderPage";

type PageState =
  | "LOADING"
  | "CLAIMABLE"
  | "CLAIM_SUCCESS"
  | "INVALID_OR_CLAIMED"
  | "NETWORK_ERROR";

interface PageProps {
  params: Promise<{
    couponId: string;
  }>;
}

export default function QRCouponPage({ params }: PageProps) {
  // Unwrap params using React.use() or async resolution
  const resolvedParams = use(params);
  const rawCouponId = resolvedParams?.couponId || "";
  const couponId = decodeURIComponent(rawCouponId).trim();

  const [pageState, setPageState] = useState<PageState>("LOADING");
  const [isAlreadyClaimed, setIsAlreadyClaimed] = useState(false);
  const [networkErrorMsg, setNetworkErrorMsg] = useState("");

  // Claim Form state
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimErrorMessage, setClaimErrorMessage] = useState<string | null>(
    null,
  );

  // Success state
  const [claimData, setClaimData] = useState<QRCouponClaimResponse | null>(
    null,
  );

  // Fetch GET API details
  const fetchDetails = useCallback(async () => {
    if (!couponId) {
      setPageState("INVALID_OR_CLAIMED");
      setIsAlreadyClaimed(false);
      return;
    }

    setPageState("LOADING");
    setNetworkErrorMsg("");

    const res = await getQRCouponDetails(couponId);

    if (res.isNotFound) {
      setPageState("INVALID_OR_CLAIMED");
      setIsAlreadyClaimed(false);
      return;
    }

    if (res.error) {
      setPageState("NETWORK_ERROR");
      setNetworkErrorMsg(res.error);
      return;
    }

    if (res.data) {
      if (res.data.isClaimed) {
        setPageState("INVALID_OR_CLAIMED");
        setIsAlreadyClaimed(true);
      } else {
        setPageState("CLAIMABLE");
      }
    }
  }, [couponId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle POST Claim form submission
  const handleClaimSubmit = async (name: string, phone: string) => {
    setIsSubmitting(true);
    setClaimErrorMessage(null);

    const res = await claimQRCoupon({
      code: couponId,
      name,
      phone,
    });

    setIsSubmitting(false);

    if (res.error) {
      if (res.isAlreadyClaimed) {
        setShowClaimForm(false);
        setIsAlreadyClaimed(true);
        setPageState("INVALID_OR_CLAIMED");
      } else {
        setClaimErrorMessage(res.error);
      }
      return;
    }

    if (res.data) {
      setShowClaimForm(false);
      setClaimData(res.data);
      setPageState("CLAIM_SUCCESS");
    }
  };

  // 1. Loading State
  if (pageState === "LOADING") {
    return <CouponLoader />;
  }

  // 2. Network Error State
  if (pageState === "NETWORK_ERROR") {
    return (
      <div className="bg-kf-yellow min-h-screen font-inter flex flex-col items-center justify-center p-6 text-center text-kf-black">
        <div className="bg-white p-8 rounded-2xl border-4 border-kf-black shadow-[10px_10px_0px_#111] max-w-md w-full flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-red-600">
            wifi_off
          </span>
          <h2 className="font-anton text-3xl text-kf-black uppercase">
            CONNECTION ERROR
          </h2>
          <p className="font-inter text-sm font-semibold text-gray-700">
            {networkErrorMsg ||
              "Unable to connect to KingFox server. Please check your internet connection."}
          </p>
          <button
            onClick={fetchDetails}
            className="w-full py-4 bg-kf-black hover:bg-gray-900 text-kf-yellow font-anton text-xl uppercase rounded-xl border-2 border-kf-black shadow-[4px_4px_0px_#111] transition-all cursor-pointer mt-2"
          >
            🔄 RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  // 3. Invalid QR or Already Claimed State
  if (pageState === "INVALID_OR_CLAIMED") {
    return (
      <TryHarderPage
        isAlreadyClaimed={isAlreadyClaimed}
        couponCode={couponId}
      />
    );
  }

  // 4. Success State
  if (pageState === "CLAIM_SUCCESS" && claimData) {
    return <SuccessPage claimData={claimData} />;
  }

  // 5. Claimable State (Prize Page + Claim Form Modal)
  return (
    <>
      <PrizePage
        couponCode={couponId}
        onOpenClaimForm={() => {
          setClaimErrorMessage(null);
          setShowClaimForm(true);
        }}
      />

      <ClaimForm
        isOpen={showClaimForm}
        onClose={() => setShowClaimForm(false)}
        onSubmit={handleClaimSubmit}
        isSubmitting={isSubmitting}
        errorMessage={claimErrorMessage}
      />
    </>
  );
}
