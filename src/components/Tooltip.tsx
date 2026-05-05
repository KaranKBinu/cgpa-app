'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type QueueItem = { id: string; content: React.ReactNode };
let currentForceShow: QueueItem | null = null;
let forceShowQueue: QueueItem[] = [];
let listeners: (() => void)[] = [];
const notifyListeners = () => listeners.forEach(l => l());
let currentTimeout: ReturnType<typeof setTimeout> | null = null;

function requestForceShow(id: string, content: React.ReactNode) {
  // Prevent duplicate content from flooding the queue
  const contentString = typeof content === 'string' ? content : '';
  if (currentForceShow?.id === id) return;
  if (forceShowQueue.some(item => item.id === id)) return;

  if (currentForceShow === null) {
    currentForceShow = { id, content };
    notifyListeners();
    currentTimeout = setTimeout(() => releaseForceShow(id), 5000); // Increased to 5s for tutorial
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
      currentTimeout = setTimeout(() => releaseForceShow(currentForceShow!.id), 5000);
    }
  } else {
    forceShowQueue = forceShowQueue.filter(item => item.id !== id);
  }
}

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  variant?: 'emerald' | 'standard' | 'tutorial';
  className?: string;
  forceShow?: boolean;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  position = 'top', 
  variant = 'standard',
  className,
  forceShow = false,
  delay = 0
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [isGlobalForceShow, setIsGlobalForceShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const touchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTouchingRef = useRef(false);
  const [shift, setShift] = useState({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    isTouchingRef.current = true;
    // Start long press timer
    touchTimeoutRef.current = setTimeout(() => {
      if (isTouchingRef.current) {
        setIsVisible(true);
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try { navigator.vibrate(10); } catch (e) {}
        }
      }
    }, 500); // Standard Android long press duration
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
    // Only hide if it's not a tutorial (those might need to stay or have their own logic)
    if (variant !== 'tutorial') {
      setIsVisible(false);
    }
  };

  const handleTouchMove = () => {
    // If the user scrolls or moves significantly, cancel the long press
    if (!isVisible && touchTimeoutRef.current) {
      isTouchingRef.current = false;
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (forceShow) {
      const checkVisibility = () => {
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const style = window.getComputedStyle(containerRef.current);
          const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          
          if (isVisible) {
            timeoutId = setTimeout(() => {
              requestForceShow(tooltipId, content);
            }, delay);
            return true;
          }
        }
        return false;
      };

      if (!checkVisibility()) {
        const frame = requestAnimationFrame(checkVisibility);
        return () => cancelAnimationFrame(frame);
      }
    } else {
      releaseForceShow(tooltipId);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [forceShow, tooltipId, content, delay]);

  useEffect(() => {
    const handleUpdate = () => setIsGlobalForceShow(currentForceShow?.id === tooltipId);
    listeners.push(handleUpdate);
    handleUpdate();
    return () => {
      listeners = listeners.filter(l => l !== handleUpdate);
      // Only release if we're unmounting, not just re-rendering
      // releaseForceShow(tooltipId); // Handled by the other useEffect cleanup or dependency
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
      case 'bottom': return 'top-[calc(100%+12px)] left-1/2 -translate-x-1/2';
      case 'left': return 'right-[calc(100%+12px)] top-1/2 -translate-y-1/2';
      case 'right': return 'left-[calc(100%+12px)] top-1/2 -translate-y-1/2';
      default: return 'bottom-[calc(100%+12px)] left-1/2 -translate-x-1/2';
    }
  };

  const getAnimationProps = () => {
    switch (position) {
      case 'bottom': return { initial: { opacity: 0, y: -8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } };
      case 'left': return { initial: { opacity: 0, x: 8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } };
      case 'right': return { initial: { opacity: 0, x: -8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } };
      default: return { initial: { opacity: 0, y: 8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'tutorial':
        return "bg-background/95 text-foreground border-primary/30 shadow-2xl shadow-primary/20 p-0 overflow-hidden min-w-[280px] pointer-events-auto";
      case 'emerald':
      case 'standard':
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn("relative inline-flex w-fit select-none", showTooltip ? "z-[999]" : "z-auto", className)}
      style={{ WebkitTouchCallout: 'none' }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      onContextMenu={(e) => {
        if (window.matchMedia('(pointer: coarse)').matches) {
          e.preventDefault();
        }
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
              "absolute z-[9999] rounded-xl shadow-2xl backdrop-blur-xl border transition-[margin] duration-200",
              variant !== 'tutorial' ? "px-4 py-2 font-black text-[10px] uppercase tracking-[0.15em] whitespace-nowrap pointer-events-none" : "pointer-events-auto",
              getPositionClasses(),
              getVariantClasses()
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
