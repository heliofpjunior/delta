"use client";

import { useSimulation } from "@/components/SimulationProvider";
import {
    Users,
    Share2,
    Zap,
    ArrowRight,
    TrendingUp,
    Gift,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RewardItem {
    id: string;
    title: string;
    desc: string;
    cost: number;
    icon: any;
    color: string;
    category: string;
}

const rewards: RewardItem[] = [
    {
        id: "leads_01",
        title: "Pack de Leads (30 dias)",
        desc: "Lista segmentada de 50 certificados a vencer na sua região.",
        cost: 1500,
        icon: Users,
        color: "blue",
        category: "Vendas"
    },
    {
        id: "mkt_01",
        title: "Créditos de Marketing",
        desc: "R$ 100,00 de crédito para impulsionamento em redes sociais.",
        cost: 2000,
        icon: Share2,
        color: "indigo",
        category: "Marketing"
    },
    {
        id: "cash_01",
        title: "Cashback de Custo",
        desc: "Redução de R$ 2,00 no custo por certificado nas próximas 10 vendas.",
        cost: 1200,
        icon: Zap,
        color: "amber",
        category: "Benefícios"
    }
];

export default function RewardStore() {
    const { currentUser, updateUser } = useSimulation();

    const handleRedeem = (item: RewardItem) => {
        if (currentUser.xp < item.cost) {
            alert("XP insuficiente para este resgate.");
            return;
        }

        if (confirm(`Deseja resgatar ${item.title} por ${item.cost} XP?`)) {
            updateUser({ xp: currentUser.xp - item.cost });
            alert(`Sucesso! ${item.title} ativado na sua conta.`);
        }
    };

    return (
        <div className="bg-[var(--card)] rounded-3xl border border-[var(--border)] p-8 lg:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="text-primary" size={20} />
                        <h2 className="text-2xl font-black tracking-tight">Loja de Recompensas</h2>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Troque seus pontos conquistados por benefícios exclusivos.</p>
                </div>

                <div className="bg-primary/5 dark:bg-[var(--accent)] rounded-2xl p-6 border border-primary/10 dark:border-[var(--border)] flex items-center gap-6 self-start md:self-auto shadow-sm transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-primary/60 dark:text-[var(--muted)] uppercase tracking-widest mb-1">Seu XP Disponível</p>
                        <p className="text-3xl font-black text-[var(--foreground)] leading-none">{currentUser.xp.toLocaleString()}</p>
                    </div>
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                        <TrendingUp size={24} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((item) => {
                    const canAfford = currentUser.xp >= item.cost;
                    const colorMap: any = {
                        blue: "bg-blue-500",
                        indigo: "bg-indigo-500",
                        amber: "bg-amber-500",
                    };

                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "group p-6 rounded-2xl border-2 transition-all relative overflow-hidden",
                                canAfford
                                    ? "border-[var(--border)] bg-[var(--accent)]/30 hover:border-primary/30"
                                    : "border-[var(--border)] opacity-60 grayscale bg-[var(--accent)]/10"
                            )}
                        >
                            <div className="relative z-10">
                                <div className={cn(
                                    "size-14 rounded-xl flex items-center justify-center text-white mb-6 shadow-md",
                                    colorMap[item.color]
                                )}>
                                    <item.icon size={28} />
                                </div>
                                <div className="mb-6">
                                    <p className="text-[10px] font-black text-primary/40 dark:text-[var(--muted)] uppercase tracking-[0.2em] mb-2">{item.category}</p>
                                    <h4 className="text-lg font-black tracking-tight text-[var(--foreground)] mb-2">{item.title}</h4>
                                    <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
                                </div>

                                <button
                                    onClick={() => handleRedeem(item)}
                                    disabled={!canAfford}
                                    className={cn(
                                        "w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm",
                                        canAfford
                                            ? "bg-primary text-white hover:bg-primary/90 shadow-primary/10"
                                            : "bg-[var(--accent)] text-[var(--muted)] cursor-not-allowed"
                                    )}
                                >
                                    {item.cost} XP
                                    <ArrowRight size={16} />
                                </button>
                            </div>

                            {/* Decorative Background Icon */}
                            <Gift className="absolute -bottom-6 -right-6 size-32 text-slate-900/5 dark:text-white/5 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                        </div>
                    );
                })}
            </div>

            <div className="mt-12 p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl flex items-center gap-4">
                <div className="size-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                    <Sparkles size={20} />
                </div>
                <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                    "Novas recompensas são liberadas sempre que você sobe de nível!"
                </p>
            </div>
        </div>
    );
}
