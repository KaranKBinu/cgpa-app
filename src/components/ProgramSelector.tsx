"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ChevronRight, X, Command, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Program {
  id: string;
  name: string;
  code: string;
}

export default function ProgramSelector({
  programs,
  userProgramId
}: {
  programs: Program[];
  userProgramId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent scroll when search is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-search-active', 'true');
      window.dispatchEvent(new CustomEvent('searchToggle', { detail: { isOpen: true } }));
    } else {
      document.body.removeAttribute('data-search-active');
      window.dispatchEvent(new CustomEvent('searchToggle', { detail: { isOpen: false } }));
    }

    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, isMobile]);

  const filteredPrograms = programs
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const term = search.toLowerCase();
      if (!term) return 0;

      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // 1. Exact code match
      if (aCode === term && bCode !== term) return -1;
      if (bCode === term && aCode !== term) return 1;

      // 2. Starts with code match
      if (aCode.startsWith(term) && !bCode.startsWith(term)) return -1;
      if (bCode.startsWith(term) && !aCode.startsWith(term)) return 1;

      // 3. Starts with name match
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;

      return 0;
    });

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredPrograms.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && filteredPrograms[selectedIndex]) {
        window.location.href = `/calculate/${filteredPrograms[selectedIndex].code}`;
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1);
      return;
    }

    if (search.trim()) {
      setSelectedIndex(0);
    } else if (userProgramId) {
      // Find index of user program if it exists in current filtered list
      const idx = filteredPrograms.findIndex(p => p.id === userProgramId);
      setSelectedIndex(idx >= 0 ? idx : -1);
    } else {
      setSelectedIndex(-1);
    }
  }, [search, userProgramId, isOpen, filteredPrograms.length]);

  return (
    <div 
      ref={containerRef} 
      className="w-full max-w-3xl mx-auto relative z-[30]"
    >

      {/* Search Trigger / Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-20">
          <Search className={cn(
            "h-5 w-5 sm:h-6 sm:w-6 transition-all duration-300",
            isOpen ? "text-emerald-500 scale-110" : "text-emerald-500/40 group-hover:text-emerald-500/70"
          )} />
        </div>
        
        <motion.div
           layout
           animate={isOpen ? {
             boxShadow: [
               "0 0 40px -10px rgba(16, 185, 129, 0.2)",
               "0 0 60px -5px rgba(16, 185, 129, 0.4)",
               "0 0 40px -10px rgba(16, 185, 129, 0.2)"
             ]
           } : {
             boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.3)"
           }}
           transition={isOpen ? {
             duration: 2,
             repeat: Infinity,
             ease: "easeInOut"
           } : {}}
           className="rounded-3xl sm:rounded-[2rem]"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={isMobile ? "Search department..." : "Select your program (e.g. Computer Science)"}
            className={cn(
              "w-full h-14 sm:h-20 bg-card/60 backdrop-blur-3xl border-2 pl-14 sm:pl-16 pr-14 sm:pr-16 text-base sm:text-xl font-black text-foreground focus:outline-none transition-all duration-500 rounded-3xl sm:rounded-[2rem] relative z-10",
              isOpen 
                ? "border-emerald-500/50 ring-8 ring-emerald-500/5 bg-card/80" 
                : "border-emerald-500/40 hover:border-emerald-500/60 hover:bg-card/80 shadow-none"
            )}
            value={search}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </motion.div>

        <div className="absolute inset-y-0 right-5 flex items-center gap-2">
            <AnimatePresence mode="wait">
                {search ? (
                    <motion.button
                        key="clear"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setSearch('')}
                        className="h-8 w-8 flex items-center justify-center rounded-xl bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </motion.button>
                ) : (
                    <motion.div
                        key="kbd"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/10 border border-border/50 text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest"
                    >
                        <Command className="h-3 w-3" />
                        <span>Search</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>

      {/* Results Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={isMobile ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            animate={isMobile ? { opacity: 1 } : { opacity: 1, y: 15, scale: 1 }}
            exit={isMobile ? { opacity: 0 } : { opacity: 0, y: 5, scale: 0.98 }}
            className={cn(
              "overflow-hidden bg-background/95 backdrop-blur-3xl border border-emerald-500/20 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.5)] z-[150] ring-1 ring-white/5",
              isMobile 
                ? "fixed inset-0 p-4 flex flex-col" 
                : "absolute left-0 right-0 mt-4 rounded-[2.5rem]"
            )}
          >
            {/* Mobile Header (Search Input + Close) */}
            {isMobile && (
               <div className="flex flex-col gap-4 mb-4">
                  <div className="flex items-center justify-between px-2 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Program Finder</span>
                        <h2 className="text-xl font-black text-foreground">Select Department</h2>
                    </div>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 active:scale-95 transition-all"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {/* Re-render input inside overlay for full screen experience */}
                  <div className="flex items-center gap-3 relative">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="h-14 w-14 flex items-center justify-center rounded-3xl bg-card border-2 border-emerald-500/20 text-emerald-500 active:scale-95 transition-all shrink-0 shadow-lg shadow-emerald-500/5 focus:ring-4 focus:ring-emerald-500/10"
                    >
                      <ArrowLeft className="h-6 w-6" />
                    </button>
                    <div className="relative flex-1">
                        <Search className="absolute left-6 inset-y-0 h-5 w-5 my-auto text-emerald-500" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Search department..."
                          className="w-full h-14 bg-card border-2 border-emerald-500/50 pl-16 pr-6 text-base font-black text-foreground focus:outline-none rounded-3xl ring-8 ring-emerald-500/5 shadow-lg shadow-emerald-500/5"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                    </div>
                  </div>
               </div>
            )}

            <div className={cn(
                "overflow-y-auto custom-scrollbar",
                isMobile ? "flex-1 px-1" : "max-h-[460px] p-3"
            )}>
              {filteredPrograms.length > 0 ? (
                <div className="grid grid-cols-1 gap-1">
                  {filteredPrograms.map((program, index) => {
                    const isUserProgram = program.id === userProgramId;
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <Link
                        key={program.id}
                        href={`/calculate/${program.code}`}
                        onClick={() => {
                          setIsOpen(false);
                          if (isMobile) document.body.style.overflow = 'unset';
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={cn(
                          "flex items-center justify-between p-4 transition-all duration-300 group rounded-2xl relative",
                          isSelected
                            ? "bg-emerald-500/10 border border-emerald-500/20 translate-x-1"
                            : "hover:bg-muted/5 border border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 flex items-center justify-center rounded-2xl transition-all duration-500",
                            isSelected || isUserProgram 
                                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 lg:rotate-3" 
                                : "bg-card border border-border/50 text-muted-foreground group-hover:text-emerald-500"
                          )}>
                            <GraduationCap className={cn("h-6 w-6", isSelected && "animate-pulse")} />
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className={cn(
                                "font-black text-base lg:text-lg tracking-tight transition-colors",
                                isSelected || isUserProgram ? "text-emerald-500" : "text-foreground group-hover:text-emerald-500"
                              )}>
                                {program.name}
                              </h3>
                              {isUserProgram && (
                                <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-lg uppercase tracking-widest">
                                  Identity Match
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-black text-muted-foreground/60 uppercase tracking-wider">{program.code}</span>
                                <div className="w-1 h-1 rounded-full bg-border" />
                                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.15em]">Scheme 2021 Core</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {isSelected && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="hidden sm:block text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/50"
                                >
                                    Select
                                </motion.span>
                            )}
                            <div className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-xl transition-all",
                                isSelected ? "bg-emerald-500/20 text-emerald-500" : "text-muted-foreground/30 group-hover:text-emerald-500"
                            )}>
                                <ChevronRight className={cn("h-5 w-5 transition-transform duration-300", isSelected && "translate-x-1 scale-110")} />
                            </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="py-20 text-center space-y-4">
                    <div className="h-16 w-16 bg-muted/10 rounded-3xl flex items-center justify-center mx-auto border border-border/50">
                        <Search className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                    <div>
                        <p className="text-lg font-black text-foreground">No matches found.</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Try searching with a code or department name.</p>
                    </div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-muted/5 border-t border-border/30 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-muted/20 border border-border/50 text-[10px] font-black">↑↓</kbd>
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Navigate</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <kbd className="px-1.5 py-0.5 rounded bg-muted/20 border border-border/50 text-[10px] font-black">Enter</kbd>
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Select</span>
                    </div>
                </div>
                <div className="text-[9px] font-black text-emerald-500/40 uppercase tracking-widest">
                    v2.1 Database
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

