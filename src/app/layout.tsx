import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사랑과평안의교회 가정예배 체크앱",
  description: "가정예배 주간 실시일 체크 및 활동 기록 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}