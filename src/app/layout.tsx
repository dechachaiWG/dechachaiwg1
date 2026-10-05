import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ReserveSpace — ระบบจองห้องประชุมและจัดคิวออนไลน์",
  description: "ระบบจองห้องประชุมและจัดคิวออนไลน์ ตรวจเช็กคิวไม่ให้ซ้อนทับ ใช้งานง่ายบนมือถือและคอมพิวเตอร์",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
