import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sevakarsa Backend",
  description: "Private backend API for Sevakarsa with Supabase and Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
