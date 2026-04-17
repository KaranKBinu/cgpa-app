"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ChevronRight } from 'lucide-react';
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
  const [search, setSearch] = useState('');

  const filteredPrograms = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
          <Search className="h-5 w-5 text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search your program (e.g. Computer Science)"
          className="w-full h-14 bg-card/60 backdrop-blur-xl border border-emerald-500/30 rounded-2xl pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground shadow-[0_0_40px_rgba(16,185,129,0.28)] ring-1 ring-white/5"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredPrograms.map((program, index) => {
            const isUserProgram = program.id === userProgramId;
            return (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                <Link
                  href={`/calculate/${program.code}`}
                  className={cn(
                    "flex items-center justify-between p-4 bg-card/50 hover:bg-card/80 border transition-all group hover:scale-[1.01] rounded-xl",
                    isUserProgram
                      ? "border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                      : "border-border/50 hover:border-emerald-500/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-10 w-10 flex items-center justify-center rounded-lg transition-all",
                      isUserProgram ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-primary-foreground"
                    )}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={cn("font-bold lg:font-black text-foreground transition-colors", isUserProgram ? "text-emerald-500" : "group-hover:text-emerald-500")}>{program.name}</h3>
                        {isUserProgram && (
                          <span className="text-[10px] font-black bg-emerald-500 text-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">{program.code} • Revision 2021</p>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-5 w-5 transition-all group-hover:translate-x-1", isUserProgram ? "text-emerald-500" : "text-muted-foreground group-hover:text-emerald-500")} />
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredPrograms.length === 0 && (
          <div className="py-12 text-center text-muted-foreground italic">
            No programs found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
