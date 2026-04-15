import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl animate-pulse"></div>
        
        {/* Triple orbit loader */}
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 animate-[spin_1.5s_linear_infinite]"></div>
          <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500/60 animate-[spin_2s_linear_infinite_reverse]"></div>
          <div className="absolute inset-4 rounded-full border-b-2 border-emerald-500/30 animate-[spin_2.5s_linear_infinite]"></div>
          
          {/* Central pulse dot */}
          <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center">
        <h2 className="text-xl font-black uppercase tracking-[0.2em] text-foreground animate-pulse">
          Loading
        </h2>
        <div className="mt-2 flex gap-1">
          <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-1 w-1 rounded-full bg-emerald-500/40 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}
