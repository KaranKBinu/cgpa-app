"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCcw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 gradient-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-md w-full p-10 text-center relative overflow-hidden"
      >
        {/* Animated Background Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <h1 className="text-3xl font-black mb-4 tracking-tight">Oops! Something went wrong</h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            We encountered an unexpected error while loading this page. Our team has been notified.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => reset()}
              className="btn-primary group !bg-red-500 !border-red-400/50 !shadow-red-500/20"
            >
              <RefreshCcw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
            <Link href="/" className="btn-secondary group">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Go Home
            </Link>
          </div>
          
          {error.digest && (
            <p className="mt-8 text-[10px] text-muted-foreground/50 font-mono uppercase tracking-widest">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
