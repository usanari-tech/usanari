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

const METADATA_BASE_URL = "https://gov.moguruu.com";

export const metadata: Metadata = {
  metadataBase: new URL(METADATA_BASE_URL),
  title: {
    default: "売るとき相場チェッカー | 電話なし・登録不要で不動産の過去相場を確認",
    template: "%s | 売るとき相場チェッカー",
  },
  description: "国土交通省の公式データに基づき、あなたの街の不動産取引相場を匿名でチェック。しつこい営業電話を気にせず、賢く売却の検討を始めましょう。",
  openGraph: {
    title: "売るとき相場チェッカー",
    description: "国土交通省の公式データに基づき、あなたの街の不動産取引相場を匿名でチェック。しつこい営業電話を気にせず、賢く売却の検討を始めましょう。",
    url: METADATA_BASE_URL,
    siteName: "売るとき相場チェッカー",
    locale: "ja_JP",
    type: "website",
    images: [{ url: "/ogp.png", width: 1200, height: 630, alt: "売るとき相場チェッカー" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "売るとき相場チェッカー",
    description: "しつこい営業電話を気にせず、あなたの街の不動産取引相場を匿名でチェック。",
    images: ["/ogp.png"],
  },
  alternates: {
    canonical: METADATA_BASE_URL,
  },
  verification: {
    google: "L2mGWw-L-L1LieIxVmLpH2mR52WeF2F8jBEQS9B_pS0",
  },
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
