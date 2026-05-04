import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 border-t border-border/50 bg-card/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-black">
              <Sparkles className="h-4 w-4 fill-current" />
            </div>
            <span className="font-black tracking-tighter text-xl">Poly<span className="text-primary italic">Grade</span></span>
          </div>
          <p className="text-muted-foreground text-sm font-medium text-center md:text-left max-w-xs">
            The best GPA calculator for Kerala Polytechnic students.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6">
          <div className="flex items-center gap-3">
            <Link href="/feedback" className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">Feedback</Link>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">Revision 2021</span>
            <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-[9px] font-black uppercase tracking-widest border border-border/50">Kerala Polytechnic</span>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Built with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by <a href="mailto:karankbinu799@gmail.com" className="text-primary hover:underline">Karan K Binu</a>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              2024 Batch CHE Student • GPTC Cherthala
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
