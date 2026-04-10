"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function FixRedirect() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const orderId =
      params.get("orderId") || params.get("orderid");

    if (orderId) {
      router.replace(`/orderplaced?orderId=${orderId}`);
    } else {
      router.replace("/");
    }
  }, []);

  return <p>Redirecting...</p>;
}