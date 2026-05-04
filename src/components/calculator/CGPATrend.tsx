"use client";

import React from 'react';
import { motion } from 'framer-motion';

import { SemResult } from '@/types/calculator';

export function CGPATrend({ semResults }: { semResults: SemResult[] }) {
  const validResults = semResults.filter(r => r.sgpa > 0).sort((a, b) => a.number - b.number);
  
  if (validResults.length < 2) return null;

  const maxSgpa = 10;
  const height = 100;
  const width = 300;
  
  const points = validResults.map((res, i) => {
    const x = (i / (validResults.length - 1)) * width;
    const y = height - (res.sgpa / maxSgpa) * height;
    return { x, y, res };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  return (
    <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-primary">Marks Over Time</h3>
        <div className="text-[10px] font-bold text-muted-foreground">SGPA per Semester</div>
      </div>

      <div className="relative h-[120px] w-full flex items-end">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[0, 2.5, 5, 7.5, 10].map((val) => (
            <line 
              key={val}
              x1="0" y1={height - (val / 10) * height} 
              x2={width} y2={height - (val / 10) * height} 
              stroke="currentColor" 
              className="text-border/20" 
              strokeWidth="1"
            />
          ))}

          {/* Path */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={pathD}
            fill="none"
            stroke="rgb(16, 185, 129)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              cx={p.x} cy={p.y} r="4"
              className="fill-emerald-500 stroke-background stroke-2"
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between px-1">
        {validResults.map((res, i) => (
          <div key={i} className="text-[10px] font-black text-muted-foreground uppercase">
            S{res.number}
          </div>
        ))}
      </div>
    </div>
  );
}
