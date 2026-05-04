"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Mail, User, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitFeedback } from '@/app/actions';
import { useSession } from 'next-auth/react';

export default function FeedbackPage() {
    const { data: session } = useSession();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Feedback',
        message: ''
    });

    // Pre-fill user data if logged in
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                name: session.user?.name || prev.name,
                email: session.user?.email || prev.email
            }));
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        const res = await submitFeedback(formData);

        if (res.success) {
            setStatus('success');
            setFormData(prev => ({ 
                ...prev, 
                subject: 'General Feedback', 
                message: '' 
            }));
        } else {
            setStatus('error');
        }
    };

    const isFormValid = formData.name.length > 0 && formData.email.length > 0 && formData.message.length > 0;

    return (
        <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase mb-6"
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Share Your Thoughts
                </motion.div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground mb-4">
                    Send <span className="gradient-text">Feedback.</span>
                </h1>
                <p className="text-muted-foreground font-medium text-lg max-w-xl mx-auto text-pretty">
                    Have an idea or found a bug? We'd love to hear from you. This page is open to everyone.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                {/* Left: Info Cards */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="p-6 rounded-3xl bg-card/40 border border-border/50 backdrop-blur-xl">
                        <h3 className="text-sm font-black uppercase tracking-widest text-emerald-500 mb-4">Quick Links</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Direct Contact</p>
                                    <a href="mailto:karankbinu799@gmail.com" className="text-sm font-bold text-foreground hover:text-primary transition-colors">
                                        karankbinu799@gmail.com
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Developer</p>
                                    <p className="text-sm font-bold text-foreground">Karan K Binu • GPTC Cherthala</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-xl">
                        <p className="text-xs font-medium text-emerald-500/80 leading-relaxed italic">
                            "Your feedback helps us make PolyGrade better for all Kerala Polytechnic students."
                        </p>
                    </div>
                </div>

                {/* Right: Feedback Form */}
                <div className="lg:col-span-3">
                    <div className="relative p-1 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 via-border to-emerald-500/10">
                        <div className="bg-card/80 backdrop-blur-2xl rounded-[1.8rem] p-8 shadow-2xl">
                            <AnimatePresence mode="wait">
                                {status === 'success' ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="py-12 text-center space-y-4"
                                    >
                                        <div className="h-20 w-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                                            <CheckCircle2 className="h-10 w-10" />
                                        </div>
                                        <h2 className="text-2xl font-black text-foreground">Feedback Received!</h2>
                                        <p className="text-muted-foreground font-medium">Thank you for your message. We'll look into it right away.</p>
                                        <button
                                            onClick={() => setStatus('idle')}
                                            className="mt-6 px-6 py-2 rounded-xl border border-border hover:bg-emerald-500/5 hover:border-emerald-500/50 transition-all font-black uppercase text-[10px] tracking-widest"
                                        >
                                            Send Another
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.form
                                        key="form"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Name</label>
                                                <div className="relative group">
                                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        required
                                                        type="text"
                                                        placeholder="Your Name"
                                                        className="w-full h-12 bg-background/50 border border-border/50 rounded-xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        value={formData.name}
                                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Email</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                    <input
                                                        required
                                                        type="email"
                                                        placeholder="email@example.com"
                                                        className="w-full h-12 bg-background/50 border border-border/50 rounded-xl pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                        value={formData.email}
                                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Topic</label>
                                            <select
                                                className="w-full h-12 bg-background/50 border border-border/50 rounded-xl px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                                                value={formData.subject}
                                                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            >
                                                <option>General Feedback</option>
                                                <option>Bug Report</option>
                                                <option>Feature Request</option>
                                                <option>Curriculum Error</option>
                                                <option>Other</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                placeholder="Tell us more..."
                                                className="w-full bg-background/50 border border-border/50 rounded-xl p-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                            />
                                        </div>

                                        <motion.button
                                            disabled={status === 'loading' || !isFormValid}
                                            type="submit"
                                            animate={isFormValid ? { scale: [1, 1.01, 1] } : {}}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className={cn(
                                                "w-full h-14 font-black uppercase tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 group",
                                                isFormValid
                                                    ? "bg-gradient-to-r from-emerald-400 to-emerald-600 text-black shadow-lg shadow-emerald-500/40 active:scale-[0.98] border-t border-white/20"
                                                    : "bg-emerald-950/20 text-emerald-900/50 border border-emerald-900/10 cursor-not-allowed"
                                            )}
                                        >
                                            {status === 'loading' ? (
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                            ) : (
                                                <>
                                                    Send Feedback
                                                    <Send className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                </>
                                            )}
                                        </motion.button>
                                    </motion.form>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
