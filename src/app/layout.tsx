import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harshit | Creative software developer",
  description: "Harshit's animated portfolio",
  icons: {
    icon: "https://cdn.prod.website-files.com/683703490bc01e1b8c052e06/68381362603d6402ee03c00e_favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
