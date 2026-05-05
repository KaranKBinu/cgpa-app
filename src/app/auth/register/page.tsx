"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight, Check, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { registerUser, getPrograms } from "@/app/actions";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [department, setDepartment] = useState("");
  const [isLET, setIsLET] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [departments, setDepartments] = useState<{name: string, code: string}[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    async function loadDepts() {
      const res = await getPrograms();
      if (res.success && res.programs) {
        setDepartments(res.programs.map(p => ({ name: p.name, code: p.code })));
      }
    }
    loadDepts();
  }, []);

  const filteredDepartments = departments
    .filter(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const term = searchTerm.toLowerCase();
      if (!term) return 0;

      const aCode = a.code.toLowerCase();
      const bCode = b.code.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      // 1. Exact code match
      if (aCode === term && bCode !== term) return -1;
      if (bCode === term && aCode !== term) return 1;

      // 2. Starts with code match
      if (aCode.startsWith(term) && !bCode.startsWith(term)) return -1;
      if (bCode.startsWith(term) && !aCode.startsWith(term)) return 1;

      // 3. Starts with name match
      if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
      if (bName.startsWith(term) && !aName.startsWith(term)) return 1;

      return 0;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

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
        setLoading(false);
      } else {
        router.push(`/auth/login?registered=true${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const isFormValid =
    name.length > 0 &&
    email.length > 0 &&
    password.length >= 6 &&
    password === confirmPassword &&
    department.length > 0;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-card/50 backdrop-blur-xl border border-border/50 p-8 rounded-[2rem] shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-black font-outfit text-foreground mb-2">Join PolyGrade</h1>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest">Create your student account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background/80 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-background/80 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background/80 border border-border rounded-2xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="Create a password"
                  required
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "w-full bg-background/80 border rounded-2xl py-4 pl-12 pr-12 text-foreground focus:outline-none focus:ring-4 transition-all font-medium",
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/10"
                      : confirmPassword && confirmPassword === password
                        ? "border-emerald-500/50 focus:border-emerald-500/50 focus:ring-emerald-500/10"
                        : "border-border focus:border-emerald-500/50 focus:ring-emerald-500/10"
                  )}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4">Passwords do not match</p>
              )}
            </div>

            {/* Department / Branch */}
            <div className="space-y-1.5 ">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Department / Branch</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenDept(!openDept)}
                  className="w-full bg-background/80 border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-left flex justify-between items-center"
                >
                  <span className={department ? "text-foreground" : "text-muted-foreground"}>
                    {department.length > 30 ? department.substring(0, 30) + "..." : (department || "Select Department")}
                  </span>
                  <motion.div
                    animate={{ rotate: openDept ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openDept && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-2 border-b border-border/50">
                        <input
                          type="text"
                          placeholder="Search department..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          autoFocus
                          className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500/50 transition-all font-outfit"
                        />
                      </div>
                      <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                        {filteredDepartments.length > 0 ? (
                          filteredDepartments.map((dept) => (
                            <button
                              key={dept.code}
                              type="button"
                              onClick={() => {
                                setDepartment(dept.name);
                                setOpenDept(false);
                                setSearchTerm("");
                              }}
                              className={cn(
                                "w-full text-left px-4 py-3 rounded-xl transition-all flex flex-col gap-0.5",
                                department === dept.name
                                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                                  : "text-muted-foreground hover:bg-emerald-500/10 hover:text-foreground"
                              )}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{dept.name}</span>
                              <span className={cn(
                                "text-[9px] font-bold uppercase tracking-[0.2em]",
                                department === dept.name ? "text-black/60" : "text-emerald-500/60"
                              )}>{dept.code}</span>
                            </button>
                          ))
                        ) : (
                          <p className="text-[10px] font-bold text-muted-foreground/50 text-center py-8 uppercase tracking-widest">No matching department</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* LET Toggle */}
            <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl cursor-pointer group hover:border-emerald-500/30 transition-all" onClick={() => setIsLET(!isLET)}>
              <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${isLET ? 'bg-emerald-500 border-emerald-500' : 'border-emerald-500/30 group-hover:border-emerald-500/50 bg-background/50'}`}>
                {isLET && <Check className="h-4 w-4 text-black" strokeWidth={4} />}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">LET Student</p>
                <p className="text-[10px] font-bold text-muted-foreground/60 uppercase">Joined from 3rd Semester (Lateral Entry)</p>
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 pt-8 border-t border-border/30 text-center">
            <p className="text-muted-foreground text-sm font-medium">
              Already have an account?{" "}
              <Link 
                href={`/auth/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`} 
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
