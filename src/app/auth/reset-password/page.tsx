"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setVerifying(false);
        setIsValid(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        if (response.ok) {
          setIsValid(true);
        } else {
          setIsValid(false);
        }
      } catch (err) {
        setIsValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = password.length >= 8 && password === confirmPassword;

  if (verifying) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
        <p className="text-muted-foreground font-medium animate-pulse">Verifying reset link...</p>
      </div>
    );
  }

  if (success) {
    return (
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
        <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Password Reset</h1>
        <p className="text-muted-foreground font-medium mb-8">
          Your password has been successfully reset. Redirecting you to login...
        </p>
        <Link 
          href="/auth/login"
          className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
        >
          Login Now
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  if (!isValid) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Invalid Link</h1>
        <p className="text-muted-foreground font-medium mb-8">
          This password reset link is invalid or has expired.
        </p>
        <Link 
          href="/auth/forgot-password"
          className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold transition-colors"
        >
          Request New Link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Set New Password</h1>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Create a strong password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">New Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                placeholder="New password"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                placeholder="Confirm new password"
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
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Reset Password
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-emerald-500" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
