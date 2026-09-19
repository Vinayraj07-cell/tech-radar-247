import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Radar 24/7 | YouTube Shorts Channel Sentinel",
  description: "Autonomous 24/7 AI Technology Radar detecting viral YouTube Shorts opportunities with Gemini 2.5 Flash, RSS feeds, and Discord alerts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
