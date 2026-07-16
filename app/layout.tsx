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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "TrendProof | 股市預測準確度競賽平台",
  description: "分享股價趨勢預測房間，用實際市價驗證漲跌、買賣點、命中率與離散度。",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "TrendProof | 股市預測準確度競賽平台",
    description: "建立預測房間，邀請朋友或客戶一起比每日、每週、每月股市命中率。",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrendProof | 股市預測準確度競賽平台",
    description: "讓每一次漲跌判斷，都能被市價驗證。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
