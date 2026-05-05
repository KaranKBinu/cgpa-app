"use client";

import { useState } from "react";
import { User, Mail, GraduationCap, Check, Loader2, Save, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/app/actions";
import { cn } from "@/lib/utils";

export default function ProfileClient({ user, programs }: { user: any, programs: any[] }) {
  const [name, setName] = useState(user.name || "");
  const [department, setDepartment] = useState(user.department || "");
  const [isLET, setIsLET] = useState(user.isLET || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("department", department);
    formData.append("isLET", isLET.toString());

    const result = await updateProfile(formData);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || "Failed to update profile");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <User className="h-6 w-6 text-black" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Your Profile</h1>
          <p className="text-muted-foreground font-medium">Manage your academic identity and preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-card/50 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 opacity-60 cursor-not-allowed">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email (Locked)</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-background border border-border rounded-2xl py-4 pl-12 pr-4 text-muted-foreground font-medium italic"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Department / Program</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDept(!openDept)}
                className="w-full bg-card/50 border border-border rounded-2xl py-4 px-6 text-foreground focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium text-left flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                  <span className={department ? "text-foreground" : "text-muted-foreground"}>
                    {department || "Select Department"}
                  </span>
                </div>
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
                    className="absolute left-0 right-0 top-full mt-2 z-50 bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-3xl"
                  >
                    <div className="p-2 border-b border-border/50">
                      <input 
                        type="text"
                        placeholder="Search program..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar p-1">
                      {filteredPrograms.length > 0 ? (
                        filteredPrograms.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setDepartment(p.name);
                              setOpenDept(false);
                              setSearchTerm("");
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group",
                              department === p.name
                                ? "bg-emerald-500 text-black font-black" 
                                : "text-muted-foreground hover:bg-emerald-500/10 hover:text-foreground"
                            )}
                          >
                            <div className="flex flex-col">
                              <span className="text-[11px] uppercase tracking-tighter">{p.name}</span>
                              <span className="text-[8px] opacity-60 font-medium tracking-widest">{p.code}</span>
                            </div>
                            {department === p.name && <Check className="h-4 w-4" />}
                          </button>
                        ))
                      ) : (
                        <p className="text-[10px] font-bold text-muted-foreground/50 text-center py-8 uppercase tracking-widest">No matching program</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div 
            className={cn(
               "flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all cursor-pointer group",
               isLET 
                ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5" 
                : "bg-background border-border/50 hover:border-emerald-500/30"
            )}
            onClick={() => setIsLET(!isLET)}
          >
            <div className={cn(
              "h-8 w-8 rounded-xl border-2 flex items-center justify-center transition-all",
              isLET ? "bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/40" : "border-emerald-500/30 group-hover:border-emerald-500/50 bg-background/50"
            )}>
              {isLET && <Check className="h-5 w-5 text-black" strokeWidth={4} />}
            </div>
            <div>
              <p className="text-base font-black text-foreground">Lateral Entry Student</p>
              <p className="text-xs font-medium text-muted-foreground">Skip Semester 1 & 2 in total calculations automatically.</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-16 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl",
                success 
                  ? "bg-emerald-500 text-black" 
                  : "bg-emerald-600 hover:bg-emerald-500 text-black shadow-emerald-500/20"
              )}
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : success ? (
                <>
                  <Check className="h-6 w-6" />
                  Successfully Updated
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  Save Changes
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-xs font-bold text-center mt-4 uppercase tracking-widest">{error}</p>}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
