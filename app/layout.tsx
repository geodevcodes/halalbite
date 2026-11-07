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
  title: "HalalBite POS - Offline Restaurant Management System",
  description: "High-speed offline-first Restaurant POS Management System for touch terminals and desktops.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#121212] text-white selection:bg-orange-500 selection:text-white">
        <div className="desktop-app">{children}</div>
        <section
          className="desktop-only-notice"
          aria-labelledby="desktop-only-title"
        >
          <div className="desktop-only-notice__content">
            <p className="desktop-only-notice__brand">HalalBite</p>
            <h1 id="desktop-only-title">Desktop screen required</h1>
            <p>
              This app is available on desktop devices. Please open HalalBite on a desktop screen to continue.
            </p>
          </div>
        </section>
      </body>
    </html>
  );
}
