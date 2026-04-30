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
import { auth } from "@/lib/auth";
import { getSettings } from "./actions";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
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
    verification: {
      google: "8SJoGMMdd3XdLruA-G40XClvchRq0VUKF3_712sMwyg",
    },
    openGraph: {
      title: `${config.appName} - Polytechnic GPA Engine`,
      description: `The definitive GPA calculation engine for Kerala Polytechnic students. Track your progress with precision.`,
      url: 'https://poly-cgpa.vercel.app',
      siteName: config.appName,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: `${config.appName} Preview`,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${config.appName} - Kerala Polytechnic GPA`,
      description: 'Calculate and track your Kerala Polytechnic GPA with ease.',
      images: ['/og-image.png'],
    },
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
          
          <Navbar user={user} config={config} />

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
