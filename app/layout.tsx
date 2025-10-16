import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Market Vision - Bullish or Bearish Day Predictor",
  description: "Advanced algorithmic market analysis tool for predicting bullish or bearish trends using candlestick patterns and technical indicators",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
