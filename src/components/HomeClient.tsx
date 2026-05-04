"use client";

// Rebuild triggered to resolve module factory error

import React, { useState } from 'react';
import ProgramSelector from "@/components/ProgramSelector";
import RecentCalculatorLink from "@/components/RecentCalculatorLink";
import { Sparkles, ChevronDown, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomeClient({ 
  programs, 
  userProgramId, 
  recentCalculations,
  appName = "PolyGrade"
}: { 
  programs: any[], 
  userProgramId?: string, 
  recentCalculations: any[],
  appName?: string
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How does the PDF upload work?",
      a: "Our calculator scans your Kerala Polytechnic result PDF. It automatically finds your subjects, grades, and credits for the Revision 2021 syllabus in just a few seconds."
    },
    {
      q: "Is it updated for Revision 2021?",
      a: "Yes, this tool is specially made for the Revision 2021 syllabus. We have the correct data for all courses and electives under Kerala Polytechnic."
    },
    {
      q: "Can Lateral Entry (LET) students use this?",
      a: "Yes. We have a special 'LET Mode' for students who join directly in the 3rd semester, making sure your total score is calculated correctly."
    },
    {
      q: "Is my data safe?",
      a: "Your data is saved on your device so you don't lose your progress. If you log in, you can save your marks to the cloud and see them from any phone or computer."
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center px-6 py-20 relative overflow-hidden">
      {/* Decorative blobs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-[120px] -z-10"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-[150px] -z-10"
      ></motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center space-y-4 mb-12 max-w-4xl"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-primary text-[10px] font-black tracking-[0.3em] uppercase mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <Sparkles className="h-3 w-3" />
          The Best Way to Calculate GPA
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 text-foreground leading-[1.05] selection:bg-emerald-500 selection:text-black">
          GPA Calculator <span className="glare-text">for Kerala Polytechnic</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed font-medium max-w-2xl mx-auto">
          The most accurate calculator for Revision 2021 students. Easily track your marks, upload PDFs, and save your progress.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-3xl"
      >
        <ProgramSelector programs={programs} userProgramId={userProgramId} />
        <RecentCalculatorLink programs={programs} recentCalculations={recentCalculations} />
      </motion.div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {[
          {
            num: "01",
            title: "Quick PDF Upload",
            desc: "No need to type everything. Just upload your result PDF and the calculator will find your marks automatically. It's fast and easy.",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          },
          {
            num: "02",
            title: "LET Student Support",
            desc: "If you are a Lateral Entry student, we handle the calculation for you. The tool adjusts to your path, including elective subjects.",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          },
          {
            num: "03",
            title: "Save Your Progress",
            desc: "Start on your phone and finish on your computer. Your marks are saved automatically so you never lose your data.",
            icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 space-y-4 hover:border-emerald-500/30 transition-all hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-primary font-black uppercase text-[10px] tracking-widest opacity-60">Step {feature.num}</span>
              {feature.icon}
            </div>
            <h3 className="text-2xl font-black text-foreground group-hover:text-emerald-500 transition-colors">{feature.title}</h3>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-40 w-full max-w-3xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Common Questions</h2>
          <p className="text-muted-foreground font-medium">Everything you need to know about this calculator.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div 
              key={i}
              className="bg-card/30 border border-border/50 rounded-3xl overflow-hidden transition-all hover:border-emerald-500/20"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between text-left group"
              >
                <span className="text-lg font-bold group-hover:text-emerald-500 transition-colors">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-emerald-500' : 'text-muted-foreground'}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-8 pb-8 text-muted-foreground font-medium leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
