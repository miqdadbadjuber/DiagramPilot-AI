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
  title: "DiagramPilot AI",
  description: "AI-powered architecture and diagram generation tool",
  icons: {
    icon: "/logo_diagrampilot.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-hidden`}
    >
      <body className="h-screen w-full flex flex-col bg-[#0A0A0A] text-zinc-200 overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
