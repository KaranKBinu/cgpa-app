"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message }: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/60 backdrop-blur-md"
        >
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse"></div>
            
            {/* Triple orbit loader */}
            <div className="relative h-20 w-20">
              <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-[spin_1.5s_linear_infinite]"></div>
              <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500/60 animate-[spin_2s_linear_infinite_reverse]"></div>
              <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500/30 animate-[spin_2.5s_linear_infinite]"></div>
              
              {/* Central pulse dot */}
              <div className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
            </div>
          </div>
          
          {message && (
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 flex flex-col items-center"
            >
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                {message}
              </h2>
              <div className="mt-2 flex gap-1">
                <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce"></div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
