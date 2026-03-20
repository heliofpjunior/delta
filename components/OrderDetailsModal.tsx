"use client";

import {
    X,
    Calendar,
    User,
    FileText,
    MapPin,
    CreditCard,
    ExternalLink,
    Clock,
    CheckCircle2,
    XCircle,
    Info,
    ShieldCheck,
    Truck,
    Smartphone,
    Mail,
    Globe,
    FileEdit,
    History,
    Activity,
    ArrowRight,
    RefreshCw,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import { calculateCommission } from "@/lib/rulesEngine";
import { ReceiptText, ChevronDown, ChevronUp } from "lucide-react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

interface OrderDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: any;
}

const STATUS_CONFIG: Record<string, { icon: any; label: string; className: string }> = {
    Pendente: {
        icon: Clock,
        label: "Aguardando Pagamento",
        className: "bg-amber-500 text-white ring-amber-400/30 shadow-amber-500/20",
    },
    Rascunho: {
        icon: FileEdit,
        label: "Aguardando Finalização",
        className: "bg-slate-600 text-white ring-slate-500/30 shadow-slate-600/20",
    },
    Pago: {
        icon: CheckCircle2,
        label: "Pago",
        className: "bg-emerald-600 text-white ring-emerald-500/30 shadow-emerald-600/20",
    },
    Emitido: {
        icon: CheckCircle2,
        label: "Emitido",
        className: "bg-primary text-white ring-primary shadow-primary/20",
    },
    Aprovado: {
        icon: CheckCircle2,
        label: "Pronto p/ Emitir",
        className: "bg-emerald-500 text-white ring-emerald-400/30 shadow-emerald-500/20 animate-pulse",
    },
    Cancelado: {
        icon: XCircle,
        label: "Cancelado",
        className: "bg-slate-400 text-white ring-slate-300 shadow-slate-400/20",
    },
};

export default function OrderDetailsModal({ isOpen, onClose, order }: OrderDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<"details" | "history">("details");
    const { currentUser } = useSimulation();
    const [showCalcMemory, setShowCalcMemory] = useState(false);

    // Fetch logs
    const { data: logs, isLoading: logsLoading } = useSWR(
        isOpen && order?.id ? `/api/certificates/logs?orderId=${order.id}` : null,
        fetcher
    );

    if (!isOpen || !order) return null;

    const currentStatus = (order.supplier_status === "Aprovado" && order.status === "Pago") ? "Aprovado" : order.status;
    const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pendente"];
    const StatusIcon = statusCfg.icon;

    // Stored memory has priority for historical accuracy. 
    // Fallback to recalculation only if legacy order.
    const steps = order.calculation_memory || (order.products ? calculateCommission(
        order.final_price,
        currentUser.level,
        order.category === "CNPJ",
        undefined,
        order.products.supplier_products ? {
            base_cost: order.products.supplier_products.base_cost,
            tax_fixed: order.products.supplier_products.supplier_tables?.tax_fixed || 0,
            tax_percent: order.products.supplier_products.supplier_tables?.tax_percent || 0
        } : undefined,
        {
            bronze: Number(order.products.commission_bronze) || 0,
            prata: Number(order.products.commission_prata) || 0,
            ouro: Number(order.products.commission_ouro) || 0
        }
    ).calculationSteps : null);

    const calcLabel = order.calculation_memory ? "MEMÓRIA DE CÁLCULO (SISTEMA)" : "MEMÓRIA DE CÁLCULO (ESTIMADO)";

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const details = [
        { label: "Titular", value: order.holder_name || order.holder, icon: User },
        { label: "Documento", value: order.doc, icon: FileText },
        { label: "Produto", value: order.product, icon: ShieldCheck },
        { label: "Protocolo", value: order.protocol, icon: Info, mono: true },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[var(--card)] rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] overflow-hidden border-4 border-[var(--border)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-500">

                {/* ── Header ── */}
                <div className="p-10 border-b-4 border-[var(--border)] shrink-0 bg-primary/[0.02]">
                    <div className="flex items-center justify-between mb-8">
                        <span className={cn(
                            "inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border-2 shadow-lg",
                            statusCfg.className
                        )}>
                            <StatusIcon size={16} strokeWidth={3} />
                            {statusCfg.label}
                        </span>
                        <button onClick={onClose} className="size-12 flex items-center justify-center bg-[var(--background)] hover:bg-rose-500/10 hover:text-rose-500 rounded-2xl border-2 border-[var(--border)] transition-all active:scale-90">
                            <X size={24} strokeWidth={3} />
                        </button>
                    </div>

                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-tight">
                                {order.holder_name || order.holder}
                            </h2>
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <span className="px-4 py-2 bg-[var(--background)] rounded-xl border-2 border-[var(--border)] text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                                    PROTOCOLO: <span className="font-mono text-primary">{order.protocol}</span>
                                </span>
                                <div className="size-2 bg-primary/30 rounded-full" />
                                <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60">
                                    EMITIDO EM: {order.date || format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex items-center gap-3 mt-10 bg-[var(--background)] p-2 rounded-[2rem] border-2 border-[var(--border)] w-fit shadow-inner">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                                activeTab === "details"
                                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                    : "text-[var(--muted)] hover:text-primary"
                            )}
                        >
                            <FileText size={18} strokeWidth={3} />
                            DETALHES
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={cn(
                                "flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all",
                                activeTab === "history"
                                    ? "bg-primary text-white shadow-xl shadow-primary/20 scale-105"
                                    : "text-[var(--muted)] hover:text-primary"
                            )}
                        >
                            <History size={18} strokeWidth={3} />
                            LINHA DO TEMPO
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="overflow-y-auto p-10 custom-scrollbar flex-1 bg-[var(--background)]/30">

                    {activeTab === "details" ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Basic Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {details.map((item, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 p-6 bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] shadow-sm hover:border-primary/20 transition-all group">
                                        <div className="flex items-center gap-3 text-primary/40 group-hover:text-primary transition-colors">
                                            <item.icon size={16} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{item.label}</span>
                                        </div>
                                        <span className={cn("text-lg font-black text-[var(--foreground)] uppercase truncate", item.mono && "font-mono text-base tracking-normal")}>
                                            {item.value || "NÃO CADASTRADO"}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="h-1 bg-[var(--border)] rounded-full opacity-50" />

                            {/* Financial Section */}
                            <div className="p-8 bg-emerald-500/[0.03] rounded-[2.5rem] border-4 border-emerald-500/10">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8 mb-8">
                                    <div className="flex flex-col gap-2">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-[var(--muted)]">INVESTIMENTO TOTAL</span>
                                        <span className="text-5xl font-black text-[var(--foreground)] tracking-tighter leading-none">
                                            {formatCurrency(order.final_price || 0)}
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-500">COMISSÃO GERADA</span>
                                        <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none bg-emerald-500/10 px-6 py-3 rounded-2xl border-2 border-emerald-500/20">
                                            {formatCurrency(order.seller_commission || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Calculation Memory */}
                                {steps && (
                                    <div className="bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] overflow-hidden shadow-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setShowCalcMemory(!showCalcMemory)}
                                            className="w-full flex items-center justify-between px-6 py-5 bg-[var(--background)] hover:bg-primary/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <ReceiptText size={20} strokeWidth={3} className="text-primary group-hover:scale-110 transition-transform" />
                                                <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.25em]">{calcLabel}</p>
                                            </div>
                                            {showCalcMemory ? <ChevronUp size={24} strokeWidth={3} className="text-primary" /> : <ChevronDown size={24} strokeWidth={3} className="text-[var(--muted)]" />}
                                        </button>

                                        {showCalcMemory && (
                                            <div className="p-8 space-y-4 border-t-2 border-[var(--border)] animate-in fade-in slide-in-from-top-2 duration-300">
                                                {steps.map((step: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                                        <span className="text-[var(--muted)]">{step.label}</span>
                                                        <span className={cn(
                                                            "px-4 py-1.5 rounded-lg",
                                                            step.type === "positive" ? "bg-emerald-500/10 text-emerald-600" :
                                                                step.type === "negative" ? "bg-rose-500/10 text-rose-500" :
                                                                    "bg-[var(--background)] text-[var(--foreground)]"
                                                        )}>
                                                            {step.value > 0 ? "+" : ""}{step.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="h-1 bg-[var(--border)] rounded-full opacity-50" />

                            {/* Integrated Data */}
                            {order.supplier_uuid && (
                                <div className="p-10 rounded-[3rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-white/10 blur-[100px] pointer-events-none" />
                                    <div className="flex items-center gap-4 mb-8 relative z-10">
                                        <div className="size-10 rounded-2xl bg-white/20 flex items-center justify-center border-2 border-white/20">
                                            <Globe size={20} strokeWidth={3} />
                                        </div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-100">INFRAESTRUTURA EXTERNA</h3>
                                    </div>

                                    <div className="grid grid-cols-2 gap-10 mb-10 relative z-10">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-indigo-200/60 block mb-2 tracking-widest">PEDIDO FORNECEDOR</span>
                                            <span className="text-2xl font-mono font-black tracking-tight">{order.supplier_order_id}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black uppercase text-indigo-200/60 block mb-2 tracking-widest">SITUAÇÃO ATUAL</span>
                                            <span className="inline-flex px-4 py-2 bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest border border-white/20">
                                                {order.supplier_status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 relative z-10">
                                        {order.supplier_link_pagamento && (
                                            <button
                                                onClick={() => window.open(order.supplier_link_pagamento, '_blank')}
                                                className="flex-1 px-6 py-5 bg-white text-indigo-600 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl"
                                            >
                                                REALIZAR PAGAMENTO
                                            </button>
                                        )}
                                        {order.supplier_link_agendamento && (
                                            <button
                                                onClick={() => window.open(order.supplier_link_agendamento, '_blank')}
                                                className="flex-1 px-6 py-5 bg-emerald-500 text-white rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl border-2 border-white/20"
                                            >
                                                AGENDAR EMISSÃO
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Address Detail */}
                            {order.address_details && (
                                <div className="p-8 bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] shadow-sm">
                                    <div className="flex items-center gap-4 mb-6 text-primary">
                                        <MapPin size={24} strokeWidth={3} />
                                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">ENDEREÇO DE COBRANÇA</span>
                                    </div>
                                    <div className="text-lg text-[var(--foreground)] font-black uppercase tracking-tight leading-relaxed pl-10">
                                        <p className="opacity-90">
                                            {order.address_details.street}, {order.address_details.number}
                                        </p>
                                        <p className="text-sm opacity-60">
                                            {order.address_details.neighborhood} · {order.address_details.city} — {order.address_details.state}
                                        </p>
                                        <p className="text-sm font-mono text-primary mt-2">CEP {order.address_details.cep}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-2">
                            {logsLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-6 opacity-40">
                                    <RefreshCw className="animate-spin text-primary" size={48} strokeWidth={3} />
                                    <p className="text-xs font-black uppercase tracking-[0.5em] animate-pulse">Consultando Registros...</p>
                                </div>
                            ) : logs && logs.length > 0 ? (
                                <div className="space-y-12 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-1 before:bg-[var(--border)]">
                                    {logs.map((log: any, idx: number) => {
                                        const isStatusChange = log.status_before !== log.status_after;
                                        return (
                                            <div key={log.id} className="relative pl-16">
                                                {/* Timeline Node */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 size-10 rounded-2xl border-4 border-[var(--card)] flex items-center justify-center z-10 shadow-2xl transition-transform hover:scale-110",
                                                    log.event_type === 'webhook' ? "bg-emerald-600 text-white shadow-emerald-600/30" : "bg-primary text-white shadow-primary/30"
                                                )}>
                                                    {log.event_type === 'webhook' ? <Globe size={18} strokeWidth={3} /> : <RefreshCw size={18} strokeWidth={3} />}
                                                </div>

                                                <div className="flex flex-col gap-3 p-8 bg-[var(--card)] rounded-[2rem] border-2 border-[var(--border)] shadow-xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[80px] pointer-events-none" />

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <h4 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-3">
                                                            {log.event_type === 'webhook' ? "INTERAÇÃO VIA WEBHOOK" : "EXPEDIÇÃO MANUAL"}
                                                            {log.event_type === 'webhook' && <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />}
                                                        </h4>
                                                        <span className="text-[10px] font-black text-[var(--muted)] opacity-50 bg-[var(--background)] px-3 py-1 rounded-lg border border-[var(--border)]">
                                                            {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-[var(--foreground)] font-black uppercase tracking-tight leading-relaxed opacity-80 relative z-10">
                                                        {log.message}
                                                    </p>

                                                    {isStatusChange && (
                                                        <div className="mt-4 flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] relative z-10 shadow-inner">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40">ORIGEM</span>
                                                                <span className="px-3 py-1.5 rounded-xl bg-slate-600/10 text-[10px] font-black text-slate-500 uppercase tracking-widest border border-slate-500/10">
                                                                    {log.status_before}
                                                                </span>
                                                            </div>
                                                            <ArrowRight size={16} strokeWidth={3} className="text-primary/40" />
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest opacity-40">DESTINO</span>
                                                                <span className="px-3 py-1.5 rounded-xl bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest border-2 border-primary/20 shadow-sm shadow-primary/10">
                                                                    {log.status_after}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 gap-8 text-center">
                                    <div className="size-32 rounded-[3.5rem] bg-[var(--card)] border-4 border-[var(--border)] flex items-center justify-center text-[var(--muted)] shadow-2xl opacity-20 scale-110">
                                        <Activity size={64} strokeWidth={2} />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-black text-[var(--foreground)] uppercase tracking-[0.4em]">LINHA DO TEMPO LIMPA</p>
                                        <p className="text-xs text-[var(--muted)] font-black uppercase tracking-widest opacity-40 italic max-w-xs mx-auto">
                                            AS ATUALIZAÇÕES DO MOTOR DE EMISSÃO APARECERÃO AQUI EM TEMPO REAL.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-10 py-8 border-t-4 border-[var(--border)] bg-[var(--background)] flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-4 bg-[var(--card)] px-5 py-2 rounded-xl border-2 border-[var(--border)]">
                        <Zap size={16} className="text-primary" strokeWidth={3} />
                        <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-[0.3em]">
                            CANAL: {order.origin}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-10 py-4 rounded-2xl bg-[var(--card)] text-[var(--muted)] font-black text-[11px] uppercase tracking-[0.4em] hover:text-[var(--foreground)] hover:border-primary/40 border-2 border-[var(--border)] transition-all active:scale-95 shadow-lg shadow-black/5"
                    >
                        FECHAR DETALHES
                    </button>
                </div>
            </div>
        </div>
    );
}
