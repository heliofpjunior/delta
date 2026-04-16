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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[var(--background)] rounded-2xl shadow-xl overflow-hidden border border-[var(--border)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">

                {/* ── Header compacto ── */}
                <div className="px-5 pt-4 pb-0 border-b border-[var(--border)] shrink-0 bg-[var(--card)] z-10">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm shrink-0",
                                statusCfg.className
                            )}>
                                <StatusIcon size={12} strokeWidth={2.5} />
                                {statusCfg.label}
                            </span>
                            <h2 className="text-base font-bold text-[var(--foreground)] truncate">
                                {order.holder_name || order.holder}
                            </h2>
                        </div>
                        <button onClick={onClose} className="size-7 ml-3 shrink-0 flex items-center justify-center text-[var(--muted)] hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-md transition-all">
                            <X size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 mb-3 text-[10px] text-[var(--muted)]">
                        <span className="font-mono font-semibold text-primary">{order.protocol}</span>
                        <div className="size-1 bg-[var(--border)] rounded-full" />
                        <span className="font-medium">{order.date || format(new Date(order.created_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                    </div>

                    {/* ── Tabs ── */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setActiveTab("details")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wide transition-all border-b-2",
                                activeTab === "details"
                                    ? "text-primary border-primary"
                                    : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
                            )}
                        >
                            <FileText size={13} strokeWidth={2.5} />
                            Detalhes
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 text-xs font-semibold tracking-wide transition-all border-b-2",
                                activeTab === "history"
                                    ? "text-primary border-primary"
                                    : "text-[var(--muted)] border-transparent hover:text-[var(--foreground)]"
                            )}
                        >
                            <History size={13} strokeWidth={2.5} />
                            Histórico
                        </button>
                    </div>
                </div>

                {/* ── Content ── */}
                <div className="overflow-y-auto p-5 custom-scrollbar flex-1">

                    {activeTab === "details" ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {/* Card único com todas as infos do titular */}
                            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Informações do Pedido</span>
                                </div>
                                <div className="divide-y divide-[var(--border)]">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-2 text-[var(--muted)]">
                                            <User size={12} strokeWidth={2.5} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Titular</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--foreground)] truncate max-w-[60%] text-right">{order.holder_name || order.holder || "Não cadastrado"}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-2 text-[var(--muted)]">
                                            <FileText size={12} strokeWidth={2.5} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Documento</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--foreground)] font-mono">{order.doc || "Não cadastrado"}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-2 text-[var(--muted)]">
                                            <ShieldCheck size={12} strokeWidth={2.5} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Produto</span>
                                        </div>
                                        <span className="text-sm font-semibold text-[var(--foreground)] truncate max-w-[60%] text-right">{order.product || "Não cadastrado"}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <div className="flex items-center gap-2 text-[var(--muted)]">
                                            <Info size={12} strokeWidth={2.5} />
                                            <span className="text-[10px] font-semibold uppercase tracking-wide">Protocolo</span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-primary tracking-wider">{order.protocol}</span>
                                    </div>
                                </div>
                            </div>
                            {/* Seção Financeira */}
                            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Financeiro</span>
                                </div>
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-0.5">Valor Total</p>
                                        <p className="text-2xl font-bold text-[var(--foreground)] tracking-tight">{formatCurrency(order.final_price || 0)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Comissão</p>
                                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(order.seller_commission || 0)}</p>
                                    </div>
                                </div>

                                {/* Memória de Cálculo */}
                                {steps && (
                                    <div className="border-t border-[var(--border)]">
                                        <button
                                            type="button"
                                            onClick={() => setShowCalcMemory(!showCalcMemory)}
                                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--background)] transition-colors"
                                        >
                                            <div className="flex items-center gap-2">
                                                <ReceiptText size={14} strokeWidth={2.5} className="text-[var(--muted)]" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{calcLabel}</p>
                                            </div>
                                            {showCalcMemory ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
                                        </button>
                                        {showCalcMemory && (
                                            <div className="px-4 pb-4 space-y-2 border-t border-[var(--border)] pt-3 animate-in fade-in duration-200">
                                                {steps.map((step: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-xs">
                                                        <span className="text-[var(--muted)] font-medium">{step.label}</span>
                                                        <span className={cn(
                                                            "px-2 py-0.5 rounded text-xs font-bold",
                                                            step.type === "positive" ? "text-emerald-600 bg-emerald-500/10" :
                                                                step.type === "negative" ? "text-rose-500 bg-rose-500/10" :
                                                                    "text-[var(--foreground)] bg-[var(--background)]"
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

                            {/* Integração com Fornecedor - botões condicionais ao status */}
                            {order.supplier_uuid && (() => {
                                const isPaid = ["Pago", "Aprovado", "Emitido"].includes(currentStatus);
                                const isIssued = currentStatus === "Emitido";
                                const showPayBtn = order.supplier_link_pagamento && !isPaid;
                                const showScheduleBtn = order.supplier_link_agendamento && !isIssued;

                                return (
                                    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
                                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]">
                                            <Globe size={12} strokeWidth={2.5} className="text-indigo-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">Integração com Fornecedor</span>
                                        </div>
                                        <div className="divide-y divide-[var(--border)]">
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Pedido externo</span>
                                                <span className="text-sm font-mono font-bold">{order.supplier_order_id}</span>
                                            </div>
                                            <div className="flex items-center justify-between px-4 py-3">
                                                <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide">Status fornecedor</span>
                                                <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wide border border-indigo-200 dark:border-indigo-700/40">
                                                    {order.supplier_status}
                                                </span>
                                            </div>
                                        </div>

                                        {(showPayBtn || showScheduleBtn) && (
                                            <div className="flex flex-col sm:flex-row gap-2 p-3 border-t border-[var(--border)] bg-[var(--background)]">
                                                {showPayBtn && (
                                                    <button
                                                        onClick={() => window.open(order.supplier_link_pagamento, '_blank')}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:bg-primary/90 active:scale-95 shadow-sm"
                                                    >
                                                        <CreditCard size={14} strokeWidth={2.5} />
                                                        Realizar Pagamento
                                                    </button>
                                                )}
                                                {showScheduleBtn && (
                                                    <button
                                                        onClick={() => window.open(order.supplier_link_agendamento, '_blank')}
                                                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:bg-emerald-700 active:scale-95 shadow-sm"
                                                    >
                                                        <Calendar size={14} strokeWidth={2.5} />
                                                        Agendar Emissão
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {!showPayBtn && !showScheduleBtn && (
                                            <div className="px-4 py-3 border-t border-[var(--border)] bg-emerald-50 dark:bg-emerald-500/10 flex items-center gap-2">
                                                <CheckCircle2 size={14} strokeWidth={2.5} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                                                    {isIssued ? "Certificado já emitido com sucesso." : "Pagamento confirmado — aguardando emissão."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Address Detail */}
                            {order.address_details && (
                                <div className="p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm">
                                    <div className="flex items-center gap-3 mb-4 text-primary">
                                        <MapPin size={20} strokeWidth={2.5} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Endereço de Cobrança</span>
                                    </div>
                                    <div className="text-sm font-medium text-[var(--foreground)] leading-relaxed pl-8">
                                        <p>
                                            {order.address_details.street}, {order.address_details.number}
                                        </p>
                                        <p className="text-[var(--muted)] mt-0.5">
                                            {order.address_details.neighborhood} · {order.address_details.city} — {order.address_details.state}
                                        </p>
                                        <p className="text-xs font-mono text-primary font-semibold mt-1.5">CEP {order.address_details.cep}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 px-2 lg:px-4">
                            {logsLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                                    <RefreshCw className="animate-spin text-[var(--muted)]" size={32} />
                                    <p className="text-xs font-semibold uppercase tracking-wider animate-pulse">Consultando Registros...</p>
                                </div>
                            ) : logs && logs.length > 0 ? (
                                <div className="space-y-8 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[var(--border)]">
                                    {logs.map((log: any, idx: number) => {
                                        const isStatusChange = log.status_before !== log.status_after;
                                        return (
                                            <div key={log.id} className="relative pl-12">
                                                {/* Timeline Node */}
                                                <div className={cn(
                                                    "absolute left-0 top-0 size-8 rounded-full border-[3px] border-[var(--card)] flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110",
                                                    log.event_type === 'webhook' ? "bg-emerald-500 text-white" : "bg-primary text-white"
                                                )}>
                                                    {log.event_type === 'webhook' ? <Globe size={14} strokeWidth={2.5} /> : <RefreshCw size={14} strokeWidth={2.5} />}
                                                </div>

                                                <div className="flex flex-col gap-2 p-5 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 blur-3xl pointer-events-none" />

                                                    <div className="flex items-center justify-between relative z-10">
                                                        <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                                                            {log.event_type === 'webhook' ? "Interação via Webhook" : "Expedição Manual"}
                                                            {log.event_type === 'webhook' && <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />}
                                                        </h4>
                                                        <span className="text-[10px] font-semibold text-[var(--muted)]">
                                                            {format(new Date(log.created_at), "dd MMM, HH:mm", { locale: ptBR })}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-[var(--foreground)] font-medium leading-relaxed opacity-90 relative z-10 mt-1">
                                                        {log.message}
                                                    </p>

                                                    {isStatusChange && (
                                                        <div className="mt-3 flex flex-wrap items-center gap-3 p-3 rounded-lg bg-[var(--background)] border border-[var(--border)] relative z-10">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Origem</span>
                                                                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider border border-[var(--border)]">
                                                                    {log.status_before}
                                                                </span>
                                                            </div>
                                                            <ArrowRight size={14} strokeWidth={2.5} className="text-[var(--muted)]" />
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">Destino</span>
                                                                <span className="px-2 py-1 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-wider border border-primary/20">
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
                                <div className="flex flex-col items-center justify-center py-24 gap-6 text-center opacity-70">
                                    <div className="size-20 rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] shadow-sm">
                                        <Activity size={32} strokeWidth={2} />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest">Linha do tempo vazia</p>
                                        <p className="text-xs text-[var(--muted)] font-medium max-w-xs mx-auto">
                                            As interações com a emissora parceira aparecerão aqui.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 md:px-8 py-5 border-t border-[var(--border)] bg-[var(--card)] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 z-10">
                    <div className="flex items-center gap-2 bg-[var(--background)] px-3 py-1.5 rounded-lg border border-[var(--border)] shadow-sm">
                        <Zap size={14} className="text-primary" strokeWidth={2.5} />
                        <span className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-wider">
                            Canal: {order.origin}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--background)] text-[var(--muted)] font-bold text-xs uppercase tracking-wider hover:text-[var(--foreground)] hover:bg-[var(--border)] border border-[var(--border)] transition-all active:scale-95 shadow-sm"
                    >
                        Fechar Detalhes
                    </button>
                </div>
            </div>
        </div>
    );
}
