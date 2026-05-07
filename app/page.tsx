"use client";

import { useState } from "react";
import {
    Wallet,
    Eye,
    EyeOff,
    PlusCircle,
    Users,
    ArrowDownCircle,
    ShoppingBag,
    ChevronRight,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    Pendente: { icon: Clock, color: "text-amber-500", label: "Pendente" },
    Pago: { icon: CheckCircle2, color: "text-emerald-500", label: "Pago" },
    Emitido: { icon: CheckCircle2, color: "text-primary", label: "Emitido" },
    Cancelado: { icon: XCircle, color: "text-rose-500", label: "Cancelado" },
    Rascunho: { icon: FileText, color: "text-slate-400", label: "Rascunho" },
};

export default function Dashboard() {
    const { currentUser } = useSimulation();
    const [showBalance, setShowBalance] = useState(true);

    const { data: qCertificates } = useSWR(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`, fetcher);
    const { data: financialData } = useSWR(currentUser?.id ? `/api/financials?userId=${currentUser.id}` : null, fetcher);
    
    const availableBalance = financialData?.available ?? currentUser.balance_available ?? 0;
    const recentCertificates = qCertificates?.slice(0, 3) || [];

    const xpGoal = currentUser.level === "Bronze" ? 1000 : currentUser.level === "Prata" ? 2500 : 5000;
    const xpProgress = Math.min((currentUser.xp / xpGoal) * 100, 100);

    return (
        <div className="max-w-md mx-auto p-4 space-y-8 pb-24">
            
            {/* ── Minimalist Header ── */}
            <header className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                    <p className="text-sm font-medium text-[var(--muted)]">Olá,</p>
                    <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">
                        {currentUser.name.split(' ')[0]}
                    </h1>
                </div>
                <div className="size-12 rounded-full border-2 border-primary/20 p-0.5">
                    <div className="size-full rounded-full bg-slate-100 overflow-hidden">
                        {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.name} className="size-full object-cover" />
                        ) : (
                            <div className="size-full flex items-center justify-center bg-primary text-white font-bold text-lg">
                                {currentUser.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Balance Card (Nu Style) ── */}
            <section className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                        <Wallet size={18} />
                        <span className="text-sm font-semibold uppercase tracking-wider">Conta Delta</span>
                    </div>
                    <button 
                        onClick={() => setShowBalance(!showBalance)}
                        className="p-2 hover:bg-[var(--background)] rounded-full transition-colors"
                    >
                        {showBalance ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                </div>
                
                <div className="space-y-1">
                    <p className="text-sm font-medium text-[var(--muted)]">Saldo disponível</p>
                    <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tighter">
                        {showBalance ? (
                            availableBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        ) : (
                            "••••••••"
                        )}
                    </h2>
                </div>

                <Link 
                    href="/financeiro"
                    className="flex items-center justify-between pt-4 border-t border-[var(--border)] group"
                >
                    <span className="text-sm font-bold text-primary">Ver detalhes do financeiro</span>
                    <ChevronRight size={18} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                </Link>
            </section>

            {/* ── Quick Access Grid ── */}
            <section className="grid grid-cols-4 gap-2">
                <QuickAction 
                    href="/certificados" 
                    icon={PlusCircle} 
                    label="Novo" 
                    color="bg-primary/10 text-primary" 
                />
                <QuickAction 
                    href="/clientes" 
                    icon={Users} 
                    label="Clientes" 
                    color="bg-indigo-500/10 text-indigo-500" 
                />
                <QuickAction 
                    href="/financeiro" 
                    icon={ArrowDownCircle} 
                    label="Resgate" 
                    color="bg-emerald-500/10 text-emerald-500" 
                />
                <QuickAction 
                    href="/loja" 
                    icon={ShoppingBag} 
                    label="Vendas" 
                    color="bg-amber-500/10 text-amber-500" 
                />
            </section>

            {/* ── XP Progress ── */}
            <section className="space-y-4 px-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-primary" />
                        <span className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Nível {currentUser.level}</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{xpProgress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div 
                        style={{ width: `${xpProgress}%` }}
                        className="h-full bg-primary transition-all duration-1000"
                    />
                </div>
                <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-tight opacity-70">
                    Faltam <span className="text-[var(--foreground)]">{xpGoal - currentUser.xp} XP</span> para o próximo nível.
                </p>
            </section>

            {/* ── Recent Activities ── */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--foreground)]">Atividades Recentes</h3>
                    <Link href="/certificados" className="text-xs font-bold text-primary">Ver tudo</Link>
                </div>

                <div className="space-y-2">
                    {recentCertificates.length > 0 ? (
                        recentCertificates.map((cert: any) => {
                            const status = STATUS_CONFIG[cert.status] || STATUS_CONFIG.Pendente;
                            const StatusIcon = status.icon;

                            return (
                                <div 
                                    key={cert.id}
                                    className="bg-[var(--card)] p-4 rounded-2xl border border-[var(--border)] flex items-center justify-between hover:border-primary/30 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", status.color, "bg-current opacity-10")}>
                                            <StatusIcon size={20} className="opacity-100" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-[var(--foreground)] truncate uppercase">{cert.holder}</p>
                                            <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-tighter truncate">{cert.product}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-[var(--foreground)] leading-none mb-1">
                                            {Number(cert.final_price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </p>
                                        <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest">{cert.date}</p>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-8 text-center bg-[var(--background)]/50 border-2 border-dashed border-[var(--border)] rounded-2xl">
                            <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest opacity-40">Nenhuma atividade recente</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}

function QuickAction({ href, icon: Icon, label, color }: any) {
    return (
        <Link href={href} className="flex flex-col items-center gap-2 group">
            <div className={cn(
                "size-14 md:size-16 rounded-2xl flex items-center justify-center transition-all group-active:scale-90 shadow-sm",
                color
            )}>
                <Icon size={24} strokeWidth={2.5} className="size-5 md:size-6" />
            </div>
            <span className="text-[9px] md:text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider group-hover:text-primary transition-colors text-center">
                {label}
            </span>
        </Link>
    );
}
