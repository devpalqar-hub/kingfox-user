import Link from "next/link";

export default function ProductNotFound() {
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
      <p style={{ fontSize: "0.875rem", letterSpacing: "0.18em" }}>404</p>
      <h1 style={{ fontSize: "2.5rem", margin: 0 }}>Product not found</h1>
      <p style={{ color: "#555", lineHeight: 1.7, margin: 0 }}>
        The product link may be outdated, or this item is no longer available in the store.
      </p>
      <Link
        href="/products"
        style={{
          border: "1px solid #111",
          color: "#111",
          padding: "0.9rem 1.3rem",
          textDecoration: "none",
        }}
      >
        Browse all products
      </Link>
    </section>
  );
}
