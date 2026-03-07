import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
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
  title: "売るとき相場チェッカー | 電話なし・登録不要で不動産の過去相場を確認",
  description: "国土交通省の公式データに基づき、あなたの街の不動産取引相場を匿名でチェック。しつこい営業電話を気にせず、賢く売却の検討を始めましょう。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
