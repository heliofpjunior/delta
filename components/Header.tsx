"use client";

import { cn } from "@/lib/utils";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import {
    Award,
    Search,
    Wallet,
    Plus,
    Bell,
    LogOut,
    Plus as PlusIcon,
    Search as SearchIcon
} from "lucide-react";

import ThemeToggle from "./ThemeToggle";

export default function Header({ onOpenJourney }: { onOpenJourney?: () => void }) {
    const { currentUser, logout } = useSimulation();
    const { data: financialData } = useSWR(currentUser?.id ? `/api/financials?userId=${currentUser.id}` : null, fetcher);
    const availableBalance = financialData?.available ?? currentUser.balance_available ?? 0;

    return (
        <header className="sticky top-0 z-40 bg-[var(--card)]/90 backdrop-blur-md px-4 py-1 border-b border-[var(--border)] shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 h-full">
                {/* Compact Search */}
                <div className="flex-1 w-full max-w-[280px] relative group">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 size-5 bg-[var(--background)] rounded-md flex items-center justify-center text-[var(--muted)] group-focus-within:text-primary transition-all border border-[var(--border)] shadow-sm opacity-50">
                        <Search size={12} strokeWidth={2} />
                    </div>
                    <input
                        type="text"
                        placeholder="BUSCAR CLIENTE, PEDIDO..."
                        className="w-full bg-[var(--background)] border border-[var(--border)] pl-8 pr-3 h-7 rounded-lg text-[10px] focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-bold uppercase tracking-tight placeholder:text-[var(--muted)]/30 placeholder:text-[10px]"
                    />
                </div>

                <div className="flex items-center gap-4">
                    {/* XP / Level Strip */}
                    <div className="hidden lg:flex items-center gap-2 bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-sm hover:border-primary/20 transition-all group/xp">
                        <div className="flex flex-col items-end leading-none">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none mb-0.5">LEVEL {currentUser.level}</span>
                            <span className="text-xs font-bold text-[var(--foreground)] leading-none tracking-tight group-hover/xp:scale-105 transition-transform">{currentUser.xp.toLocaleString()} XP</span>
                        </div>
                        <div className="size-5 rounded-md bg-primary text-white flex items-center justify-center border border-white/10 font-bold shadow-sm text-[10px]">
                            {currentUser.level?.charAt(0)}
                        </div>
                    </div>

                    {/* Dynamic Balance Hub */}
                    <div
                        className="flex items-center gap-2 bg-emerald-600 text-white px-3.5 h-7 rounded-lg shadow-md border border-white/10 active:scale-95 transition-all cursor-pointer group/wallet"
                        onClick={() => window.location.href = '/financeiro'}
                    >
                        <Wallet size={12} className="group-hover/wallet:rotate-12 transition-transform" />
                        <span className="text-xs font-bold tracking-tight leading-none">{availableBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        <div className="size-3.5 bg-white/20 rounded-full flex items-center justify-center group-hover/wallet:bg-white group-hover/wallet:text-emerald-600 transition-colors">
                            <Plus size={7} strokeWidth={3} />
                        </div>
                    </div>

                    {/* Primary Action */}
                    <button
                        onClick={onOpenJourney}
                        className="bg-primary text-white px-3 h-7 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-md hover:bg-primary/90 active:scale-95 hidden lg:flex border border-white/10 transition-all"
                    >
                        <PlusIcon size={12} strokeWidth={2.5} />
                        NOVO PEDIDO
                    </button>

                    <div className="h-10 w-1 bg-[var(--border)] rounded-full opacity-50" />

                    <div className="flex items-center gap-2.5">
                        <ThemeToggle className="size-7 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-primary transition-all shadow-sm" />

                        <button className="size-7 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-primary transition-all shadow-sm relative group/bell">
                            <Bell size={12} className="group-hover/bell:scale-110 transition-transform" />
                            <span className="absolute top-0.5 right-0.5 size-1.5 bg-rose-500 rounded-full border border-[var(--card)] shadow-sm" />
                        </button>

                        <div className="flex items-center gap-2 pl-1.5 group cursor-pointer relative">
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-xs font-bold text-[var(--foreground)] tracking-tight uppercase mb-0.5">{currentUser.name.split(' ')[0]}</span>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest opacity-80">{currentUser.role === 'admin' ? 'DIRETOR' : 'AGENTE'}</span>
                            </div>
                            <div className="size-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] border border-white dark:border-[var(--border)] shadow-md group-hover:scale-105 transition-all overflow-hidden relative">
                                {currentUser.avatar ? <img src={currentUser.avatar} className="size-full object-cover" /> : currentUser.name.charAt(0).toUpperCase()}
                                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Tactical Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-4 w-64 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-500 z-50 overflow-hidden">
                                <div className="p-6 border-b-2 border-[var(--border)] bg-[var(--background)]/50">
                                    <p className="text-xs font-black text-[var(--foreground)] truncate uppercase tracking-widest mb-1">{currentUser.name}</p>
                                    <p className="text-[10px] text-[var(--muted)] font-black truncate uppercase tracking-tighter opacity-60 italic">{currentUser.email}</p>
                                </div>
                                <div className="p-3 space-y-1.5 bg-[var(--card)]">
                                    <button
                                        onClick={() => window.location.href = '/configuracoes'}
                                        className="w-full flex items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-[var(--muted)] hover:bg-primary/5 hover:text-primary rounded-xl transition-all border border-transparent hover:border-primary/10"
                                    >
                                        <Award size={16} strokeWidth={2.5} />
                                        PERFIL / DASH
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm("Deseja realmente sair?")) logout();
                                        }}
                                        className="w-full flex items-center gap-4 px-4 py-3 text-xs font-black uppercase tracking-[0.15em] text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all border border-transparent hover:border-rose-500/10"
                                    >
                                        <LogOut size={16} strokeWidth={2.5} />
                                        LOGOUT SEGURO
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
