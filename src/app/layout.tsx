import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { Home, History, LogOut, LayoutDashboard } from "lucide-react";
import "./globals.css";
import React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth, signOut } from "@/lib/auth";
import { getSettings } from "./actions";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: `${config.appName} - Premium Diploma CGPA Calculator`,
    description: `Calculate your Kerala Polytechnic CGPA with precision using the latest ${config.revision} syllabus data.`,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [session, config] = await Promise.all([auth(), getSettings()]);
  const user = session?.user;
  const isAdmin = (user as any)?.role === "TEACHER" || (user as any)?.role === "SUPERUSER";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-inter min-h-screen bg-background text-foreground selection:bg-emerald-500/30 overflow-x-hidden`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SessionProvider>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background opacity-70"></div>
          <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          
          <header className="absolute top-0 left-0 right-0 z-[60] p-4 lg:p-6 text-foreground">
            <nav className="mx-auto max-w-7xl px-4 lg:px-8 h-16 lg:h-20 rounded-[1.5rem] lg:rounded-[2rem] border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group transition-all active:scale-95">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 font-extrabold text-black shadow-xl shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                  {config.appName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-base lg:text-lg font-black tracking-tight text-foreground leading-none">{config.appName}</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">{config.revision}</span>
                </div>
              </Link>
              
              <div className="flex items-center gap-1 lg:gap-3 font-bold text-xs lg:text-sm text-muted-foreground">
                <Link href="/" className="px-3 py-2 rounded-xl hover:text-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Home</span>
                </Link>
                <Link href="/history" className="px-3 py-2 rounded-xl hover:text-emerald-500 hover:bg-emerald-500/5 transition-all flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden md:inline">History</span>
                </Link>

                {isAdmin && (
                  <Link href="/admin" className="px-3 py-2 rounded-xl text-amber-500 hover:bg-amber-500/5 transition-all flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>
                
                <ThemeToggle />

                <div className="w-px h-6 bg-border mx-2 hidden sm:block"></div>

                {user ? (
                  <div className="flex items-center gap-2 lg:gap-4">
                    <div className="hidden lg:flex flex-col items-end mr-2">
                      <span className="text-foreground text-[11px] leading-tight font-black uppercase tracking-tighter">{user.name}</span>
                      <span className="text-emerald-500 text-[9px] leading-tight font-bold uppercase tracking-widest">{(user as any).role}</span>
                    </div>
                    <form action={async () => {
                      "use server";
                      await signOut();
                    }}>
                      <button type="submit" className="p-2 lg:px-4 lg:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex items-center gap-2 group">
                        <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="hidden md:inline">Sign Out</span>
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login" className="px-4 py-2 rounded-xl hover:text-foreground transition-all font-black uppercase tracking-widest text-[10px]">
                      Login
                    </Link>
                    <Link href="/auth/register" className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all">
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </header>

          <main className="pt-24 lg:pt-32 pb-12 lg:pb-20">
            {children}
          </main>

          <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
