import Link from "next/link";

export default function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/products">Products</Link>
        <Link href="/new-arrivals">New Arrivals</Link>
        <Link href="/about">About Us</Link>
        <Link href="/contact">Contact Us</Link>
      </nav>
    </header>
  );
}