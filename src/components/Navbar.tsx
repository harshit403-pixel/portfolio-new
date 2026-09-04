"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="nav">
      <div className="nav-logo">
        <Link href="/" className="no-underline">
          <div
            className="text-2xl md:text-3xl tracking-tighter"
            style={{
              fontFamily: "Boldonse, sans-serif",
            }}
          >
            harshit
          </div>
        </Link>
      </div>
    </div>
  );
}