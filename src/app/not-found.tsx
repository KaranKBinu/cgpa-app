"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 gradient-bg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card max-w-md w-full p-10 text-center relative overflow-hidden"
      >
        {/* Animated Background Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center relative">
              <Search className="w-10 h-10 text-primary" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 rounded-3xl"
              />
            </div>
          </div>

          <h1 className="text-7xl font-black mb-2 glare-text tracking-tighter">404</h1>
          <h2 className="text-2xl font-bold mb-4 tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved to a new location.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="btn-primary group">
              <Home className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Go Home
            </Link>
            <button 
              onClick={() => window.history.back()} 
              className="btn-secondary group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
