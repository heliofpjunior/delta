"use client";

import {
    TrendingUp,
    FileCheck,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Plus,
    Zap,
    Wallet,
    Award,
    Flame,
    Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

export default function Dashboard() {
    const { currentUser } = useSimulation();

    const { data: qCertificates } = useSWR(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`, fetcher);
    const { data: qCustomers } = useSWR(`/api/customers?userId=${currentUser.id}&role=${currentUser.role}`, fetcher);
    const { data: financialData } = useSWR(currentUser?.id ? `/api/financials?userId=${currentUser.id}` : null, fetcher);
    const availableBalance = financialData?.available || 0;

    const certCount = qCertificates?.length || 0;
    const custCount = qCustomers?.length || 0;

    const xpGoal = currentUser.level === "Bronze" ? 1000 : currentUser.level === "Prata" ? 2500 : 5000;
    const xpProgress = Math.min((currentUser.xp / xpGoal) * 100, 100);

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-12">

            {/* ── High-Realce Hero ── */}
            <section className="relative overflow-hidden bg-[var(--background)] -mx-8 -mt-8 p-10 rounded-b-[3rem] border-b-4 border-x-2 border-[var(--border)] transition-all duration-700 shadow-xl dark:shadow-none">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px] pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

                <div className="relative z-10 px-4">
                    <div className="flex flex-wrap items-center justify-between gap-8 mb-12">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 border-2 border-white/20">
                                    <Zap size={16} strokeWidth={3} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary opacity-80">Painel de Performance</p>
                            </div>
                            <h1 className="text-5xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase">
                                Olá, <span className="text-primary">{currentUser.name.split(' ')[0]}</span>
                            </h1>
                            <p className="text-sm font-bold text-[var(--muted)] opacity-60 uppercase tracking-tight">Status da operação: <span className="text-[var(--foreground)] opacity-100">Otimizada e Segura</span></p>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-6 bg-[var(--card)] border-2 border-[var(--border)] px-8 py-4 rounded-2xl shadow-xl">
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] leading-none mb-2">RANQUEAMENTO</span>
                                    <div className={cn(
                                        "px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border-2 shadow-sm flex items-center gap-2",
                                        currentUser.level?.toLowerCase() === 'ouro' ? "bg-amber-500 text-white border-white/20" :
                                            currentUser.level?.toLowerCase() === 'prata' ? "bg-slate-500 text-white border-white/20" :
                                                "bg-primary text-white border-white/20"
                                    )}>
                                        <Award size={12} strokeWidth={3} /> {currentUser.level}
                                    </div>
                                </div>
                                <div className="h-10 w-0.5 bg-[var(--border)] rounded-full opacity-50" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] leading-none mb-2">OFENSIVA</span>
                                    <span className="flex items-center gap-2 text-rose-600 font-black uppercase tracking-[0.1em] text-xs">
                                        <Flame size={16} strokeWidth={3} className="animate-bounce fill-rose-600/20" />
                                        05 DIAS
                                    </span>
                                </div>
                            </div>

                            <button className="bg-slate-900 dark:bg-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all flex items-center gap-4 active:scale-95 border-2 border-white/10">
                                <Plus size={20} strokeWidth={4} />
                                Nova Emissão
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                        <div className="lg:col-span-12 xl:col-span-8">
                            <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-[2rem] p-10 relative group overflow-hidden shadow-xl h-full">
                                <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:rotate-12">
                                    <Zap size={240} strokeWidth={1} className="text-primary" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex flex-wrap items-start justify-between gap-8 mb-12">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 w-fit">
                                                <Target size={16} className="text-primary" />
                                                <h2 className="text-sm font-black text-primary tracking-widest uppercase">Meta de Expansão</h2>
                                            </div>
                                            <p className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-tight opacity-70">
                                                ALCANCE <span className="text-[var(--foreground)] opacity-100 font-black">{xpGoal - currentUser.xp} XP</span> ADICIONAIS PARA SUBIR DE NÍVEL.
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-5xl font-black text-primary tracking-tighter leading-none">{currentUser.xp}</p>
                                            <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.4em] mt-3 opacity-60">PONTOS DE PRESTÍGIO</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">PROGRESSO ATUAL</p>
                                                <p className="text-2xl font-black text-[var(--foreground)] tracking-tighter">{xpProgress.toFixed(0)}% <span className="text-[var(--muted)] opacity-30">/ 100%</span></p>
                                            </div>
                                            <div className="text-right space-y-1">
                                                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">RECOMPENSA</p>
                                                <p className="text-sm font-black text-emerald-600 uppercase tracking-widest italic">+1.5% COMISSÃO</p>
                                            </div>
                                        </div>
                                        <div className="relative pt-1">
                                            <div className="overflow-hidden h-8 text-xs flex rounded-[1rem] bg-[var(--background)] shadow-inner border-2 border-[var(--border)]">
                                                <div
                                                    style={{ width: `${xpProgress}%` }}
                                                    className="shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)] flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000 relative"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-[shimmer_2.5s_infinite]" />
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-[11px] font-black text-[var(--muted)] mt-6 uppercase tracking-[0.5em]">
                                                <div className="text-primary flex items-center gap-2"><div className="size-2 rounded-full bg-primary" /> {currentUser.level}</div>
                                                <div className="flex items-center gap-2">{currentUser.level?.toLowerCase() === 'bronze' ? 'Prata' : currentUser.level?.toLowerCase() === 'prata' ? 'Ouro' : 'Mestre'} <div className="size-2 rounded-full bg-[var(--border)]" /></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-12 xl:col-span-4 grid grid-cols-1 gap-6 h-full">
                            <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-8 shadow-xl flex items-center gap-6 group hover:border-amber-500/30 transition-all cursor-pointer">
                                <div className="size-16 rounded-xl bg-amber-500 text-white flex items-center justify-center border-2 border-white/20 group-hover:scale-110 transition-all shadow-lg shadow-amber-500/30">
                                    <Award size={32} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.3em] opacity-60">BADGE EQUIPADO</p>
                                    <p className="text-xl font-black text-[var(--foreground)] tracking-tight leading-none uppercase italic underline decoration-primary decoration-2 underline-offset-4">
                                        {currentUser.equippedBadge ? `${currentUser.equippedBadge}` : 'NENHUM'}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl p-8 shadow-xl flex items-center gap-6 group hover:border-emerald-500/30 transition-all cursor-pointer">
                                <div className="size-16 rounded-xl bg-emerald-600 text-white flex items-center justify-center border-2 border-white/20 group-hover:scale-110 transition-all shadow-lg shadow-emerald-600/30">
                                    <Zap size={32} strokeWidth={2.5} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.3em] opacity-60">MISSÕES HUB</p>
                                    <p className="text-xl font-black text-emerald-600 tracking-tight leading-none uppercase">02 / 03 ATIVAS</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KPI Power Grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-10">
                <div className="col-span-2 lg:col-span-3">
                    <StatCard
                        title="Vendas Brutas (Mês)"
                        value={currentUser.sales_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        change="+12.5% MÊS"
                        isPositive={true}
                        icon={TrendingUp}
                        color="primary"
                        isLarge
                    />
                </div>
                <div className="col-span-2 lg:col-span-3">
                    <div className="grid grid-cols-2 gap-8 h-full">
                        <StatCard
                            title="Saldo Disponível"
                            value={availableBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            change="+R$ 0,00 HOJE"
                            isPositive={true}
                            icon={Wallet}
                            color="emerald"
                        />
                        <StatCard
                            title="Certificados Emitidos"
                            value={certCount.toString().padStart(2, '0')}
                            change={`${custCount} BASE`}
                            isPositive={true}
                            icon={FileCheck}
                            color="indigo"
                        />
                    </div>
                </div>
            </div>

            {/* ── Bottom Tactical Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Missions — High Focus */}
                <div className="lg:col-span-2 bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] p-10 shadow-xl">
                    <div className="flex items-center justify-between mb-10">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black tracking-tight text-[var(--foreground)] leading-none uppercase tracking-wider">Missões Estratégicas</h3>
                            <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em] opacity-80">DESBLOQUEIE BÔNUS DE PONTUAÇÃO</p>
                        </div>
                        <span className="px-6 py-2 bg-primary text-white text-[10px] font-black rounded-xl border-2 border-white/20 uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                            01 / 03 COMPLETAS
                        </span>
                    </div>

                    <div className="space-y-6">
                        <MissionItem title="Sequência Ininterrupta" desc="Mantenha sua ofensiva ativa por mais 24 horas." progress={100} xp={50} completed />
                        <MissionItem title="Expansão Empresarial" desc="Emita 3 certificados PJ de alta validade." progress={66} xp={150} />
                        <MissionItem title="Networking Delta" desc="Indique um novo contador parceiro." progress={0} xp={500} />
                    </div>
                </div>

                {/* Seals Panel */}
                <div className="bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] shadow-xl flex flex-col overflow-hidden">
                    <div className="px-10 pt-10 pb-6 border-b-2 border-[var(--border)] bg-[var(--background)]/30">
                        <h3 className="text-[var(--foreground)] text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-4">
                            <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center border-2 border-white/20 shadow-lg">
                                <Award size={16} strokeWidth={3} />
                            </div>
                            Selos de Poder
                        </h3>
                    </div>

                    <div className="p-8 space-y-8 flex-1">
                        {/* Active seal */}
                        <div className="p-8 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center gap-6 relative group hover:border-primary/50 transition-all cursor-pointer shadow-inner">
                            <div className={cn(
                                "size-16 rounded-xl flex items-center justify-center shrink-0 border-2 shadow-xl transition-all group-hover:scale-110",
                                currentUser.level?.toLowerCase() === 'ouro' ? "bg-amber-500 text-white border-white/20" :
                                    currentUser.level?.toLowerCase() === 'prata' ? "bg-slate-500 text-white border-white/20" :
                                        "bg-primary text-white border-white/20"
                            )}>
                                <Zap size={32} strokeWidth={2.5} className="fill-white/20" />
                            </div>
                            <div className="min-w-0 space-y-1">
                                <p className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.1em]">TITULAR {currentUser.level}</p>
                                <div className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest opacity-80 italic flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ativo Agora
                                </div>
                            </div>
                            <div className="absolute top-6 right-6 size-4 bg-emerald-500 rounded-full border-2 border-[var(--card)] shadow-lg animate-pulse" />
                        </div>

                        {/* Quick metrics grid */}
                        <div className="pt-8 border-t-2 border-[var(--border)] grid grid-cols-2 gap-8 mt-auto">
                            <div className="text-center group cursor-help p-4 bg-[var(--background)]/50 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all">
                                <p className="text-3xl font-black text-[var(--foreground)] tracking-tighter group-hover:text-primary transition-colors">{currentUser.xp.toLocaleString()}</p>
                                <p className="text-3xl font-black text-[var(--foreground)] tracking-tighter group-hover:text-primary transition-colors">{custCount}</p>
                                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.3em] mt-2">CLIENTES</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MissionItem({ title, desc, progress, xp, completed }: any) {
    return (
        <div className={cn(
            "px-8 py-6 rounded-[2rem] border-4 transition-all flex items-center gap-6 group cursor-pointer",
            completed
                ? "bg-emerald-500/5 border-emerald-500/20 shadow-inner"
                : "bg-[var(--background)] border-[var(--border)] hover:border-primary/30 hover:bg-[var(--card)] shadow-md hover:shadow-xl"
        )}>
            <div className={cn(
                "size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all border-2",
                completed
                    ? "bg-emerald-500 text-white border-white/20 shadow-lg shadow-emerald-500/30"
                    : "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] group-hover:text-primary group-hover:border-primary/30 group-hover:scale-110"
            )}>
                {completed ? <FileCheck size={24} strokeWidth={3} /> : <Clock size={24} strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-3">
                    <p className="font-black text-lg tracking-tight text-[var(--foreground)] truncate uppercase">{title}</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl border-2 border-primary/20 shadow-sm">
                        <Zap size={12} strokeWidth={3} className="text-primary fill-primary" />
                        <p className="text-[10px] font-black text-primary uppercase">+{xp} XP</p>
                    </div>
                </div>
                <p className="text-sm text-[var(--muted)] mb-5 leading-relaxed font-bold opacity-70 uppercase tracking-tight">{desc}</p>
                <div className="h-3 w-full bg-[var(--background)] rounded-full overflow-hidden border-2 border-[var(--border)] p-0.5">
                    <div
                        className={cn("h-full rounded-full transition-all duration-1000 relative", completed ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]")}
                        style={{ width: `${progress}%` }}
                    >
                        {!completed && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]" />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, change, isPositive, icon: Icon, color, isLarge }: any) {
    const colorMap: any = {
        primary: { bg: "bg-primary", text: "text-white", border: "border-white/20", fill: "fill-white/20", shadow: "shadow-primary/30" },
        emerald: { bg: "bg-emerald-600", text: "text-white", border: "border-white/20", fill: "fill-white/20", shadow: "shadow-emerald-600/30" },
        amber: { bg: "bg-amber-500", text: "text-white", border: "border-white/20", fill: "fill-white/20", shadow: "shadow-amber-500/30" },
        indigo: { bg: "bg-indigo-600", text: "text-white", border: "border-white/20", fill: "fill-white/20", shadow: "shadow-indigo-600/30" },
    };
    const c = colorMap[color] || colorMap.primary;

    return (
        <div className={cn(
            "bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] flex flex-col justify-between overflow-hidden shadow-xl group hover:border-primary/40 transition-all duration-500",
            isLarge ? "p-10" : "p-8"
        )}>
            <div className="flex items-start justify-between mb-8">
                <div className={cn("size-16 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 border-2 shadow-lg", c.bg, c.text, c.border, c.shadow)}>
                    <Icon size={isLarge ? 32 : 24} strokeWidth={2.5} className={c.fill} />
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all shadow-md",
                    isPositive
                        ? "bg-emerald-600 text-white border-white/20 shadow-emerald-600/20"
                        : "bg-rose-600 text-white border-white/20 shadow-rose-600/20"
                )}>
                    {isPositive ? <ArrowUpRight size={14} strokeWidth={4} /> : <ArrowDownRight size={14} strokeWidth={4} />}
                    {change}
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.4em] opacity-60">{title}</p>
                <h4 className={cn("font-black text-[var(--foreground)] tracking-tighter leading-none uppercase", isLarge ? "text-5xl" : "text-3xl")}>{value}</h4>

                {/* Tactical Sparkline */}
                <div className="mt-8 h-12 w-full opacity-10 group-hover:opacity-40 transition-all duration-1000 group-hover:scale-y-105">
                    <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="none">
                        <path
                            d="M0 15 Q 10 5, 20 12 T 40 8 T 60 14 T 80 6 T 100 10"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className={cn(color === 'primary' ? 'text-primary' : color === 'emerald' ? 'text-emerald-600' : 'text-primary')}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
}
