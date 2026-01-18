import type { Metadata } from "next";
import { Noto_Serif_JP, Manrope } from "next/font/google";
import "./globals.css";

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Affassion | High Fashion, Smart Price",
  description: "厳選された高見えファッションアイテムを紹介するキュレーションメディア",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${notoSerifJP.variable} ${manrope.variable} antialiased bg-background-light dark:bg-background-dark text-[#131516] dark:text-[#f5f2ef]`}
      >
        {children}
      </body>
    </html>
  );
}
