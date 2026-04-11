'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'emerald' | 'standard';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  variant = 'standard',
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom': return 'top-[125%] left-1/2 -translate-x-1/2';
      case 'left': return 'right-[115%] top-1/2 -translate-y-1/2';
      case 'right': return 'left-[115%] top-1/2 -translate-y-1/2';
      default: return 'bottom-[125%] left-1/2 -translate-x-1/2';
    }
  };

  const getAnimationProps = () => {
    switch (position) {
      case 'bottom': return { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 } };
      case 'left': return { initial: { opacity: 0, x: 8 }, animate: { opacity: 1, x: 0 } };
      case 'right': return { initial: { opacity: 0, x: -8 }, animate: { opacity: 1, x: 0 } };
      default: return { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };
    }
  };

  return (
    <div 
      className={cn("relative inline-block w-full", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            {...getAnimationProps()}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.19, 1, 0.22, 1] }}
            className={cn(
              "absolute z-[100] px-4 py-2 font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap rounded-xl shadow-2xl backdrop-blur-xl border border-white/10 pointer-events-none",
              variant === 'emerald' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-[#0a0a0a]/95 text-white/90",
              getPositionClasses()
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
