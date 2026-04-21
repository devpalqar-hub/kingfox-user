"use client";

import Link from "next/link";
import { useEffect } from "react";

type ProductErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ProductError({ error, reset }: ProductErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      style={{
        display: "grid",
        gap: "1rem",
        justifyItems: "start",
        margin: "0 auto",
        maxWidth: "720px",
        padding: "5rem 1.5rem",
      }}
    >
      <p style={{ fontSize: "0.875rem", letterSpacing: "0.18em" }}>PRODUCT ERROR</p>
      <h1 style={{ fontSize: "2.5rem", margin: 0 }}>We couldn&apos;t load this product</h1>
      <p style={{ color: "#555", lineHeight: 1.7, margin: 0 }}>
        Please try again. If the issue continues, you can head back to the catalog.
      </p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          onClick={() => reset()}
          style={{
            background: "#111",
            border: "1px solid #111",
            color: "#fff",
            cursor: "pointer",
            padding: "0.9rem 1.3rem",
          }}
        >
          Try again
        </button>
        <Link
          href="/products"
          style={{
            border: "1px solid #111",
            color: "#111",
            padding: "0.9rem 1.3rem",
            textDecoration: "none",
          }}
        >
          Back to products
        </Link>
      </div>
    </section>
  );
}
