import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "사랑과 평안의 교회 | 가정예배 기록",
  description: "가족과 함께하는 은혜로운 예배 소중한 기록을 남겨보세요.",
  openGraph: {
    title: "사랑과 평안의 교회 | 가정예배 기록",
    description: "가족과 함께하는 은혜로운 예배 소중한 기록을 남겨보세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "사랑과 평안의 교회 가정예배",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "사랑과 평안의 교회 | 가정예배 기록",
    description: "가족과 함께하는 은혜로운 예배 소중한 기록을 남겨보세요.",
    images: ["/og-image.png"],
  },
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