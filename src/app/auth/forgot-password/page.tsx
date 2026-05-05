"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch (err) {
      setError("Failed to send reset link");
      setLoading(false);
    }
  };

  const isFormValid = email.length > 0 && email.includes("@");

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Check Your Email</h1>
          <p className="text-muted-foreground font-medium mb-8">
            If an account exists for <span className="text-foreground font-bold">{email}</span>, we've sent instructions to reset your password.
          </p>
          <Link 
            href="/auth/login"
            className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
          >
            Back to Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Forgot Password</h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Enter your email to reset</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !isFormValid}
              animate={isFormValid ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`
                w-full font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-widest
                ${isFormValid 
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-black shadow-xl shadow-emerald-500/40 hover:scale-[1.02] active:scale-95 border-t border-white/20" 
                  : "bg-emerald-500/10 text-emerald-500/40 border border-emerald-500/20 cursor-not-allowed opacity-70 shadow-inner shadow-black/10"
                }
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sending link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/30 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Remember your password?{" "}
              <Link 
                href="/auth/login" 
                className="text-emerald-500 hover:text-emerald-400 font-black transition-all hover:underline decoration-2 underline-offset-4"
              >
                Login instead
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
