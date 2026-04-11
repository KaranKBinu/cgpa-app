import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { Home, History } from "lucide-react";
import "./globals.css";
import React from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "PolyCGPA - Premium Diploma CGPA Calculator",
  description: "Calculate your Kerala Polytechnic CGPA with precision using the latest REV2021 syllabus data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-inter min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden`}>
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-black to-black opacity-70"></div>
        <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        
        <header className="fixed top-0 left-0 right-0 z-[60] p-4 lg:p-6">
          <nav className="mx-auto max-w-7xl px-4 lg:px-8 h-16 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] border border-standard bg-black/40 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group transition-all active:scale-95">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 font-extrabold text-black shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                P
              </div>
              <div className="flex flex-col">
                <span className="text-base lg:text-lg font-black tracking-tight text-white leading-none">PolyCGPA</span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">REV2021 Data</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-1 lg:gap-4 font-bold text-xs lg:text-sm text-muted">
              <Link href="/" className="px-4 py-2 rounded-xl hover:text-primary hover:bg-emerald-500/5 transition-all flex items-center gap-2">
                <Home className="h-4 w-4 lg:hidden sm:block" />
                <span className="hidden sm:inline">Calculators</span>
              </Link>
              <Link href="/history" className="px-4 py-2 rounded-xl hover:text-primary hover:bg-emerald-500/5 transition-all flex items-center gap-2">
                <History className="h-4 w-4 lg:hidden sm:block" />
                <span className="hidden sm:inline">Records</span>
              </Link>
              <div className="ml-2 hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">v2.1 Stable</span>
              </div>
            </div>
          </nav>
        </header>

        <main className="pt-24 lg:pt-32 pb-12 lg:pb-20">
          {children}
        </main>

        <footer className="mt-20 border-t border-white/5 bg-black/40 py-10 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-sm text-white/40">© 2026 PolyCGPA. Built for Kerala Polytechnic Students.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
