"use client";

import {
    BarChart3,
    PieChart,
    LineChart,
    Download,
    Calendar,
    ArrowUpRight,
    Filter,
    TrendingUp,
    Target,
    Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function RelatoriosPage() {
    const [period, setPeriod] = useState("Mensal");

    return (
        <div className="p-4 lg:p-6 space-y-8 animate-in fade-in duration-700">
            {/* ── High-Realce Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mx-4 -mt-6 p-10 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b-2 border-[var(--border)] rounded-b-3xl shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-primary/10 blur-[150px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg border border-white/20 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <BarChart3 size={20} strokeWidth={3} />
                        </div>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">BUSINESS INTELLIGENCE</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase">
                        Relatórios <span className="text-primary">Analíticos</span>
                    </h1>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <button className="bg-[var(--card)] text-[var(--foreground)] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all border-2 border-[var(--border)] hover:border-primary/40 hover:bg-[var(--background)] active:scale-95 shadow-xl">
                        <Download size={20} strokeWidth={3} />
                        EXPORTAR PDF
                    </button>
                    <button className="bg-slate-900 dark:bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl hover:scale-[1.05] border border-white/10 active:scale-95 transition-all overflow-hidden relative group/btn">
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <Filter size={20} strokeWidth={3} className="relative z-10" />
                        <span className="relative z-10">REGRAS DE FILTRO</span>
                    </button>
                </div>
            </div>

            {/* ── High-Realce Period Selector ── */}
            <div className="flex justify-center -mt-8 relative z-20">
                <div className="flex bg-[var(--card)]/80 backdrop-blur-xl p-2 rounded-2xl border-2 border-[var(--border)] shadow-xl">
                    {["Diário", "Semanal", "Mensal", "Anual"].map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300",
                                period === p
                                    ? "bg-primary text-white shadow-lg scale-105 border border-white/10"
                                    : "text-[var(--muted)] hover:text-primary hover:bg-[var(--background)] opacity-60 hover:opacity-100"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Taxa de Conversão */}
                <div className="bg-primary/5 backdrop-blur-xl rounded-[2.5rem] border-2 border-primary/20 p-8 shadow-xl space-y-8 group hover:border-primary/50 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-primary text-white border-2 border-white/20 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all duration-500">
                            <TrendingUp size={28} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-white bg-emerald-500 px-4 py-1.5 rounded-xl border border-white/10 shadow-lg tracking-widest">+18.2%</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 opacity-70 leading-none">TAXA DE CONVERSÃO</p>
                        <h4 className="text-4xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">32.4%</h4>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--border)] shadow-inner relative">
                        <div className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.6)] transition-all duration-[2000ms] ease-out relative group-hover:opacity-80" style={{ width: '32.4%' }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Ticket Médio */}
                <div className="bg-indigo-500/5 backdrop-blur-xl rounded-[2.5rem] border-2 border-indigo-500/20 p-8 shadow-xl space-y-8 group hover:border-indigo-500/50 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-indigo-500 text-white border-2 border-white/20 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all duration-500">
                            <Target size={28} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-[var(--muted)] bg-[var(--card)] px-4 py-1.5 rounded-xl border-2 border-[var(--border)] shadow-lg opacity-60 uppercase tracking-widest leading-none">ESTÁVEL</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 opacity-70 leading-none">TICKET MÉDIO</p>
                        <h4 className="text-4xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">R$ 215<span className="text-2xl opacity-40">,80</span></h4>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--border)] shadow-inner relative">
                        <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] transition-all duration-[2000ms] ease-out relative group-hover:opacity-80" style={{ width: '65.8%' }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Lifetime Value */}
                <div className="bg-emerald-500/5 backdrop-blur-xl rounded-[2.5rem] border-2 border-emerald-500/20 p-8 shadow-xl space-y-8 group hover:border-emerald-500/50 transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start">
                        <div className="size-14 rounded-2xl bg-emerald-500 text-white border-2 border-white/20 flex items-center justify-center shadow-xl group-hover:rotate-12 transition-all duration-500">
                            <Users size={28} strokeWidth={3} />
                        </div>
                        <span className="text-[10px] font-black text-white bg-indigo-600 px-4 py-1.5 rounded-xl border border-white/10 shadow-lg tracking-widest">+12 NOVOS</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-4 opacity-70 leading-none">LIFETIME VALUE (LTV)</p>
                        <h4 className="text-4xl font-black tracking-tighter text-[var(--foreground)] uppercase leading-none">R$ 840<span className="text-2xl opacity-40">,00</span></h4>
                    </div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-[var(--border)] shadow-inner relative">
                        <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] transition-all duration-[2000ms] ease-out relative group-hover:opacity-80" style={{ width: '45.2%' }}>
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Volume de Vendas Chart */}
                <div className="bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] p-8 shadow-xl space-y-8 group hover:border-primary/40 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--foreground)] flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-lg">
                                    <BarChart3 size={18} strokeWidth={3} />
                                </div>
                                Volume Estratégico de Vendas
                            </h3>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-60">PROJEÇÃO E PERFORMANCE SAZONAL</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-[var(--border)] shadow-inner relative overflow-hidden group/chart group-hover:border-primary/20 transition-all">
                        <div className="absolute inset-0 bg-primary/2 flex items-end px-8 py-6 gap-3">
                            {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                                <div key={i} className="flex-1 bg-primary/10 rounded-t-lg group-hover/chart:bg-primary transition-all duration-700 shadow-premium-sm group-hover/chart:translate-y-[-5px]" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}>
                                    <div className="w-full h-full bg-white/10 opacity-0 group-hover/chart:opacity-100 transition-opacity animate-pulse" />
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <p className="text-[var(--muted)] text-[9px] font-black uppercase tracking-[0.3em] opacity-20 italic bg-[var(--card)] px-6 py-2 rounded-xl border border-[var(--border)] shadow-xl">Algoritmos de Alta Fidelidade</p>
                        </div>
                    </div>
                </div>

                {/* Distribuição por Produto Chart */}
                <div className="bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] p-8 shadow-xl space-y-8 group hover:border-indigo-500/40 transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] pointer-events-none" />
                    <div className="flex items-center justify-between relative z-10">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tighter text-[var(--foreground)] flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-lg">
                                    <PieChart size={18} strokeWidth={3} />
                                </div>
                                Composição de Carteira
                            </h3>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] opacity-60">DISTRIBUIÇÃO POR LINHA DE PRODUTOS</p>
                        </div>
                    </div>
                    <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-[var(--border)] shadow-inner relative overflow-hidden group/chart group-hover:border-indigo-500/20 transition-all">
                        <div className="absolute inset-0 flex items-center justify-center scale-100 group-hover/chart:scale-[1.1] transition-transform duration-1000">
                            <div className="size-48 rounded-full border-[24px] border-indigo-500/10 border-t-indigo-600 border-r-indigo-400 group-hover/chart:rotate-[360deg] transition-transform duration-[3000ms] shadow-2xl relative">
                                <div className="absolute inset-[-8px] rounded-full border-2 border-white/5 opacity-0 group-hover/chart:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <p className="text-[var(--muted)] text-[9px] font-black uppercase tracking-[0.3em] opacity-20 italic bg-[var(--card)] px-6 py-2 rounded-xl border border-[var(--border)] shadow-xl">Análise Multidimensional</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
