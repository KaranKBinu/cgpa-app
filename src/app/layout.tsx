import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Link from "next/link";
import { Home, History, LogOut, LayoutDashboard, User as UserIcon } from "lucide-react";
import "./globals.css";
import React from "react";
import { PageTransition } from "@/components/PageTransition";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { auth, signOut } from "@/lib/auth";
import { getSettings } from "./actions";
import Footer from "@/components/Footer";
import { TopProgressBar } from "@/components/TopProgressBar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#10b981" },
    { media: "(prefers-color-scheme: dark)", color: "#064e3b" },
  ],
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSettings();
  return {
    title: `${config.appName} - Polytechnic GPA Engine`,
    description: `The definitive GPA calculation engine for Kerala Polytechnic students. Track your progress with precision using the latest ${config.revision} syllabus.`,
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
      apple: '/favicon.svg',
    },
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
          <SessionProvider session={session}>
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/10 via-background to-background opacity-70"></div>
          <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          
          <header className="absolute top-0 left-0 right-0 z-[60] p-2 sm:p-4 lg:p-6 text-foreground">
            <nav className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 h-14 lg:h-20 rounded-2xl lg:rounded-[2rem] border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 group transition-all active:scale-95 shrink-0">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 font-extrabold text-black shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform shrink-0">
                  G
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm sm:text-lg font-black tracking-tight text-foreground leading-none truncate">{config.appName}</span>
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5 hidden sm:block">{config.revision}</span>
                </div>
              </Link>
              
              <div className="flex items-center gap-1 sm:gap-3 font-bold text-xs lg:text-sm text-muted-foreground mr-1 lg:mr-0">
                <Link href="/" className="flex items-center gap-2 p-2 rounded-xl hover:text-emerald-500 hover:bg-emerald-500/5 transition-all group">
                  <Home className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
                <Link href="/history" className="flex items-center gap-2 p-2 rounded-xl hover:text-emerald-500 hover:bg-emerald-500/5 transition-all group">
                  <History className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">History</span>
                </Link>
                {user && (
                  <Link href="/profile" className="flex items-center gap-2 p-2 rounded-xl hover:text-emerald-500 hover:bg-emerald-500/5 transition-all group">
                    <UserIcon className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                )}

                <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>
                
                <ThemeToggle />

                <div className="w-px h-6 bg-border mx-1 hidden sm:block"></div>

                {user ? (
                  <form action={async () => {
                    "use server";
                    await signOut();
                  }}>
                    <button type="submit" className="flex items-center gap-2 p-2 sm:px-4 sm:py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all group">
                      <LogOut className="h-4 w-4 lg:h-5 lg:w-5 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link href="/auth/login" className="px-3 py-2 rounded-xl hover:text-foreground transition-all font-black uppercase tracking-widest text-[10px]">
                      Login
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </header>

          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>

          <main className="pt-24 lg:pt-32 pb-12 lg:pb-20">
            <PageTransition>
              {children}
            </PageTransition>
          </main>

          <Footer />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
