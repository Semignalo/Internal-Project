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
  title: "STARINC OS | Creative Operations",
  description: "Internal Agency Operating System",
};

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-brand-primary/20 text-gray-900 dark:text-gray-100`}>
        <div className="min-h-screen bg-transparent flex">
          <Sidebar />
          <div className="flex-1 md:ml-64 flex flex-col min-h-screen relative">
            <Topbar />
            <div className="p-8 max-w-7xl mx-auto w-full fade-in">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
