"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, GraduationCap, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Program {
  id: string;
  name: string;
  code: string;
}

export default function ProgramSelector({ programs }: { programs: Program[] }) {
  const [search, setSearch] = useState('');

  const filteredPrograms = programs.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search your program (e.g. Computer Science)"
          className="w-full h-14 bg-card/50 border border-border/50 rounded-2xl pl-12 pr-4 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {filteredPrograms.map((program, index) => (
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
                className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/80 border border-border/50 rounded-xl transition-all group hover:scale-[1.01] hover:border-emerald-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-primary-foreground transition-all">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-emerald-500 transition-colors">{program.name}</h3>
                    <p className="text-sm text-muted-foreground">{program.code} • Revision 2021</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
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
