'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type QueueItem = { id: string; content: string };
let currentForceShow: QueueItem | null = null;
let forceShowQueue: QueueItem[] = [];
let listeners: (() => void)[] = [];
const notifyListeners = () => listeners.forEach(l => l());
let currentTimeout: ReturnType<typeof setTimeout> | null = null;

function requestForceShow(id: string, content: string) {
  // Prevent duplicate content from flooding the queue
  if (currentForceShow?.content === content) return;
  if (forceShowQueue.some(item => item.content === content)) return;

  if (currentForceShow === null) {
    currentForceShow = { id, content };
    notifyListeners();
    currentTimeout = setTimeout(() => releaseForceShow(id), 3000);
  } else {
    forceShowQueue.push({ id, content });
  }
}

function releaseForceShow(id: string) {
  if (currentForceShow?.id === id) {
    if (currentTimeout) clearTimeout(currentTimeout);
    currentForceShow = forceShowQueue.shift() || null;
    notifyListeners();
    if (currentForceShow) {
      currentTimeout = setTimeout(() => releaseForceShow(currentForceShow!.id), 3000);
    }
  } else {
    forceShowQueue = forceShowQueue.filter(item => item.id !== id);
  }
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'emerald' | 'standard';
  className?: string;
  forceShow?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  variant = 'standard',
  className,
  forceShow = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [isGlobalForceShow, setIsGlobalForceShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (forceShow) {
      // Check if the element is actually visible in the current layout (not hidden by CSS)
      const checkVisibility = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const style = window.getComputedStyle(containerRef.current);
          const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          
          if (isVisible) {
            requestForceShow(tooltipId, content);
            return true;
          }
        }
        return false;
      };

      // Try immediately
      if (!checkVisibility()) {
        // If not visible yet (e.g. mounting/rendering delay), try again after a frame
        const frame = requestAnimationFrame(checkVisibility);
        return () => cancelAnimationFrame(frame);
      }
    } else {
      releaseForceShow(tooltipId);
    }
  }, [forceShow, tooltipId, content]);

  useEffect(() => {
    const handleUpdate = () => setIsGlobalForceShow(currentForceShow?.id === tooltipId);
    listeners.push(handleUpdate);
    handleUpdate();
    return () => {
      listeners = listeners.filter(l => l !== handleUpdate);
      releaseForceShow(tooltipId);
    };
  }, [tooltipId]);

  const showTooltip = isVisible || isGlobalForceShow;

  useEffect(() => {
    if (showTooltip) {
      const timeoutId = setTimeout(() => {
        if (tooltipRef.current) {
          const rect = tooltipRef.current.getBoundingClientRect();
          let shiftX = 0;
          let shiftY = 0;
          const padding = 12;
          
          if (rect.right > window.innerWidth) {
            shiftX = window.innerWidth - rect.right - padding;
          } else if (rect.left < 0) {
            shiftX = -rect.left + padding;
          }
          
          if (rect.bottom > window.innerHeight) {
            shiftY = window.innerHeight - rect.bottom - padding;
          } else if (rect.top < 0) {
            shiftY = -rect.top + padding;
          }
          
          setShift({ x: shiftX, y: shiftY });
        }
      }, 10);
      return () => clearTimeout(timeoutId);
    } else {
      setShift({ x: 0, y: 0 });
    }
  }, [showTooltip, content, position]);

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
      ref={containerRef}
      className={cn("relative inline-flex w-fit", showTooltip ? "z-[999]" : "z-auto", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onTouchStart={(e) => {
        // e.preventDefault(); // Prevent ghost clicks
        setIsVisible(!isVisible);
      }}
    >
      {children}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            ref={tooltipRef}
            {...getAnimationProps()}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: [0.19, 1, 0.22, 1] }}
            style={{ marginLeft: shift.x, marginTop: shift.y }}
            className={cn(
              "absolute z-[9999] px-4 py-2 font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap rounded-xl shadow-2xl backdrop-blur-xl border border-border/50 pointer-events-none transition-[margin] duration-200",
              "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
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
