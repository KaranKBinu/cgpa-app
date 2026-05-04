"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, History, User as UserIcon, MessageSquare, LogOut, Menu, X, Sparkles, ShieldAlert, ChevronDown, LayoutDashboard, BookOpen, Users, Settings, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { signOut } from 'next-auth/react';
import { Tooltip } from './Tooltip';

interface NavbarProps {
    user: any;
    config: {
        appName: string;
        revision: string;
    };
}

export default function Navbar({ user, config }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();

    const navLinks = [
        { href: '/', label: 'Home', icon: Home },
        ...(user ? [{ href: '/history', label: 'History', icon: History }] : []),
        { href: '/feedback', label: 'Feedback', icon: MessageSquare },
        ...(user ? [{ href: '/profile', label: 'Profile', icon: UserIcon }] : []),
    ];

    const adminLinks = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/programs', label: 'Programs', icon: BookOpen },
        ...(user?.role === 'SUPERUSER' || user?.role === 'TEACHER' ? [
            { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
        ] : []),
        ...(user?.role === 'SUPERUSER' ? [
            { href: '/admin/users', label: 'Users', icon: Users },
            { href: '/admin/settings', label: 'Settings', icon: Settings },
        ] : []),
    ];

    const isAdmin = user && (user.role === 'TEACHER' || user.role === 'SUPERUSER');

    const isCalculatorPage = pathname.startsWith('/calculate');

    return (
        <header className={cn(
            "left-0 right-0 z-[100] p-4 lg:p-6 pointer-events-none",
            isCalculatorPage ? "absolute" : "fixed top-0"
        )}>
            <nav className="mx-auto max-w-7xl pointer-events-auto">
                <div className="h-16 lg:h-20 px-4 lg:px-8 rounded-2xl lg:rounded-[2.5rem] border border-border/50 bg-background/80 backdrop-blur-2xl shadow-2xl flex items-center justify-between transition-all animate-navbar-gradient">
                    {/* Brand */}
                    <Tooltip content="Home" position="bottom" className="w-auto">
                        <Link href="/" className="flex items-center gap-2 group transition-all active:scale-95 shrink-0 cursor-pointer">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-black shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform border border-white/20">
                                <Sparkles className="h-5 w-5 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-black tracking-tight text-foreground leading-none">{config.appName}</span>
                                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-1 hidden sm:block">{config.revision}</span>
                            </div>
                        </Link>
                    </Tooltip>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-2">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm group",
                                        isActive
                                            ? "text-emerald-500 bg-emerald-500/10"
                                            : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                    )}
                                >
                                    <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive && "scale-110")} />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}

                        {/* Admin Dropdown */}
                        {isAdmin && (
                            <div className="relative" onMouseEnter={() => setIsAdminOpen(true)} onMouseLeave={() => setIsAdminOpen(false)}>
                                <Tooltip content="Admin Panel" position="bottom" className="w-auto">
                                    <button
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm group mr-1 cursor-pointer active:scale-95",
                                            pathname.startsWith('/admin')
                                                ? "text-emerald-500 bg-emerald-500/10"
                                                : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                        )}
                                    >
                                        <ShieldAlert className={cn("h-4 w-4 transition-transform group-hover:scale-110", pathname.startsWith('/admin') && "scale-110")} />
                                        <span>Admin Panel</span>
                                        <ChevronDown className={cn("h-3 w-3 transition-transform", isAdminOpen && "rotate-180")} />
                                    </button>
                                </Tooltip>

                                <AnimatePresence>
                                    {isAdminOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full left-0 mt-2 w-56 p-2 rounded-2xl border border-border/50 bg-background/90 backdrop-blur-3xl shadow-2xl z-[120]"
                                        >
                                            {adminLinks.map((link) => {
                                                const Icon = link.icon;
                                                const isActive = pathname === link.href;
                                                return (
                                                    <Link
                                                        key={link.href}
                                                        href={link.href}
                                                        className={cn(
                                                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm group",
                                                            isActive
                                                                ? "text-emerald-500 bg-emerald-500/10"
                                                                : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                                        )}
                                                    >
                                                        <div className={cn("p-1.5 rounded-lg bg-card/50 transition-colors group-hover:bg-emerald-500/10", isActive && "bg-emerald-500/10 text-emerald-500")}>
                                                            <Icon className="h-4 w-4" />
                                                        </div>
                                                        <span>{link.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <div className="w-px h-6 bg-border mx-2" />
                        <Tooltip content="Toggle Theme" position="bottom" className="w-auto">
                            <ThemeToggle />
                        </Tooltip>
                        <div className="w-px h-6 bg-border mx-2" />

                        {!user && (
                            <div className="flex items-center gap-2.5">
                                <Link
                                    href={`/auth/login${pathname !== '/' ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`}
                                    className="px-5 py-2 rounded-xl border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 transition-all font-black uppercase tracking-widest text-[10px]"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={`/auth/register${pathname !== '/' ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`}
                                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all border-t border-white/20"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                        {user && (
                            <button
                                onClick={async () => {
                                    setIsLoggingOut(true);
                                    await signOut();
                                }}
                                disabled={isLoggingOut}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-bold text-sm group cursor-pointer active:scale-95 disabled:opacity-50"
                            >
                                {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                                <span>Sign Out</span>
                            </button>
                        )}
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 transition-all active:scale-90"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="absolute top-24 left-4 right-4 p-4 rounded-3xl border border-border/50 bg-background/90 backdrop-blur-3xl shadow-2xl md:hidden z-[110]"
                        >
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold",
                                                isActive
                                                    ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                                                    : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                            )}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{link.label}</span>
                                        </Link>
                                    );
                                })}

                                {isAdmin && (
                                    <>
                                        <div className="h-px bg-border my-2" />
                                        <p className="px-4 text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Administrative</p>
                                        {adminLinks.map((link) => {
                                            const Icon = link.icon;
                                            const isActive = pathname === link.href;
                                            return (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl transition-all font-bold",
                                                        isActive
                                                            ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                                                            : "text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/5"
                                                    )}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span>{link.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </>
                                )}

                                <div className="h-px bg-border my-2" />

                                {user ? (
                                    <button
                                        onClick={async () => {
                                            setIsLoggingOut(true);
                                            await signOut();
                                            setIsOpen(false);
                                        }}
                                        disabled={isLoggingOut}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 transition-all font-bold w-full disabled:opacity-50"
                                    >
                                        {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
                                        <span>Sign Out</span>
                                    </button>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href={`/auth/login${pathname !== '/' ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center p-4 rounded-2xl border border-emerald-500/20 text-emerald-500 font-black uppercase tracking-widest text-xs transition-all w-full"
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            href={`/auth/register${pathname !== '/' ? `?callbackUrl=${encodeURIComponent(pathname)}` : ''}`}
                                            onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-center p-4 rounded-2xl bg-emerald-500 text-black font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/10 transition-all w-full"
                                        >
                                            Join PolyGrade
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
}
