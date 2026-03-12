import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POS 인사이트 AI",
  description: "AI 기반 POS 데이터 분석 SaaS - 매출 예측, 재고 최적화, 경영 인사이트",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
