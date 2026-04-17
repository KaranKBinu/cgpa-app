import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full py-12 px-6 border-t border-border/50 bg-card/30 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-black">G</div>
            <span className="font-black tracking-tighter text-xl">Poly<span className="text-primary italic">Grade</span></span>
          </div>
          <p className="text-muted-foreground text-sm font-medium text-center md:text-left max-w-xs">
            The definitive academic performance engine for Kerala Polytechnic students.
          </p>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center md:items-end gap-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Built with <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" /> by <a href="mailto:karankbinu799@gmail.com" className="text-primary hover:underline">Karan K Binu</a>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
              from GPTC Cherthala • © {new Date().getFullYear()} PolyGrade
            </p>
          </div>

          {/* <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Terms</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
