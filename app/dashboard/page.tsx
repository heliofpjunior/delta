"use client";

import { useState } from "react";
import {
    PlusCircle,
    Users,
    ArrowDownCircle,
    ShoppingBag,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Award,
    ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string; bg: string }> = {
    Pendente: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/5", label: "Pendente" },
    Pago: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/5", label: "Pago" },
    Emitido: { icon: CheckCircle2, color: "text-primary", bg: "bg-primary/5", label: "Emitido" },
    Cancelado: { icon: XCircle, color: "text-rose-500", bg: "bg-rose-500/5", label: "Cancelado" },
    Rascunho: { icon: FileText, color: "text-slate-400", bg: "bg-slate-400/5", label: "Rascunho" },
};

export default function Dashboard() {
    const { currentUser } = useSimulation();

    const { data: qCertificates } = useSWR(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`, fetcher);
    
    const recentCertificates = qCertificates?.slice(0, 5) || [];

    const xpGoal = currentUser.level === "Bronze" ? 1000 : currentUser.level === "Prata" ? 2500 : 5000;
    const xpProgress = Math.min((currentUser.xp / xpGoal) * 100, 100);

    return (
        <div className="max-w-5xl mx-auto p-4 space-y-10 pb-24 relative pt-4 md:pt-8">
            
            {/* ── Main Sales & Access Actions (Priority Focus) ── */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickAction 
                    href="/certificados" 
                    icon={PlusCircle} 
                    label="Novo Pedido" 
                    description="Emitir agora"
                    primary
                    color="bg-primary text-white" 
                />
                <QuickAction 
                    href="/certificados" 
                    icon={ShoppingBag} 
                    label="Vendas" 
                    description="Ver histórico"
                    color="bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]" 
                />
                <QuickAction 
                    href="/clientes" 
                    icon={Users} 
                    label="Clientes" 
                    description="Minha base"
                    color="bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]" 
                />
                <QuickAction 
                    href="/financeiro" 
                    icon={ArrowDownCircle} 
                    label="Resgate" 
                    description="Solicitar pix"
                    color="bg-[var(--card)] text-[var(--foreground)] border-[var(--border)]" 
                />
            </section>

            {/* ── XP Progress (Subtle & Elegant) ── */}
            <section className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Award size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest leading-none mb-1">Status de Nível</p>
                            <h3 className="text-sm font-black text-[var(--foreground)] uppercase">Nível {currentUser.level}</h3>
                        </div>
                    </div>
                    <span className="text-lg font-black text-primary tracking-tighter">{xpProgress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden p-0.5">
                    <div 
                        style={{ width: `${xpProgress}%` }}
                        className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(37,99,235,0.3)]"
                    />
                </div>
                <p className="text-[10px] text-center text-[var(--muted)] font-bold uppercase tracking-widest opacity-60">
                    Faltam <span className="text-[var(--foreground)]">{xpGoal - currentUser.xp} XP</span> para o próximo nível
                </p>
            </section>

            {/* ── Recent Activities (Clean Feed) ── */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-80">Últimas Atividades</h3>
                    <Link href="/certificados" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                        Ver Tudo
                    </Link>
                </div>

                <div className="space-y-3">
                    {recentCertificates.length > 0 ? (
                        recentCertificates.map((cert: any) => {
                            const status = STATUS_CONFIG[cert.status] || STATUS_CONFIG.Pendente;
                            const StatusIcon = status.icon;

                            return (
                                <div 
                                    key={cert.id}
                                    className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] flex items-center justify-between hover:border-primary/30 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", 
                                            status.bg, 
                                            status.color
                                        )}>
                                            <StatusIcon size={20} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-black text-[var(--foreground)] truncate uppercase tracking-tight">
                                                {cert.holder}
                                            </p>
                                            <p className="text-[10px] text-[var(--muted)] font-bold uppercase truncate tracking-tighter opacity-60">
                                                {cert.product}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0 ml-4">
                                        <p className="text-xs font-black text-[var(--foreground)] leading-none mb-1 tracking-tighter">
                                            {Number(cert.final_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <div className={cn("size-1 rounded-full", status.color.replace('text-', 'bg-'))} />
                                            <span className={cn("text-[8px] font-black uppercase tracking-widest", status.color)}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center bg-[var(--background)]/30 border border-dashed border-[var(--border)] rounded-3xl opacity-50">
                            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Sem atividades no momento</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}

function QuickAction({ href, icon: Icon, label, description, color, primary }: any) {
    return (
        <Link href={href} className="group">
            <div className={cn(
                "w-full p-5 rounded-[2rem] border transition-all duration-300 flex flex-col items-center justify-center gap-3 text-center",
                color,
                primary ? "shadow-xl shadow-primary/20 scale-105" : "hover:border-primary/50 hover:bg-primary/5 shadow-sm"
            )}>
                <div className={cn(
                    "size-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                    primary ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                )}>
                    <Icon size={24} strokeWidth={2.5} />
                </div>
                <div className="space-y-0.5">
                    <span className="block text-[11px] font-black uppercase tracking-wider">
                        {label}
                    </span>
                    <span className={cn(
                        "block text-[8px] font-bold uppercase tracking-tight opacity-60",
                        primary ? "text-white/70" : "text-[var(--muted)]"
                    )}>
                        {description}
                    </span>
                </div>
            </div>
        </Link>
    );
}


