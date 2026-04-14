"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { registerUser } from "@/app/actions";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [isLET, setIsLET] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("department", department);
    formData.append("isLET", isLET.toString());

    try {
      const result = await registerUser(formData);

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    "Computer Engineering",
    "Electronics Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Automobile Engineering",
    "Architecture",
    "Biomedical Engineering",
    "Instrumentation Engineering",
    "Computer Application & Business Management",
  ];

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Join PolyCGPA</h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Create your student account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Department / Branch</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-background/80 border border-border/50 rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                required
              >
                <option value="" disabled>Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl cursor-pointer group hover:border-emerald-500/30 transition-all" onClick={() => setIsLET(!isLET)}>
              <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isLET ? 'bg-emerald-500 border-emerald-500' : 'border-border/50 group-hover:border-emerald-500/50'}`}>
                {isLET && <div className="h-3 w-3 bg-white rounded-sm" />}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">LET Student</p>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Joined from 3rd Semester (Lateral Entry)</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 text-black font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2 mt-6 uppercase tracking-widest"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Register
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-muted-foreground text-sm font-medium">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-emerald-500 hover:text-emerald-400 font-bold transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
