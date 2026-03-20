"use client";

import {
    Wallet,
    ArrowUpRight,
    ArrowDownCircle,
    Download,
    Clock,
    CheckCircle2,
    Search,
    TrendingUp,
    CreditCard,
    Banknote,
    Calendar,
    Filter,
    XCircle,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR, { useSWRConfig } from "swr";
import { fetcher } from "@/lib/fetcher";
import Modal from "@/components/Modal";
import Input from "@/components/ui/Input";
import axios from "axios";

export default function FinanceiroPage() {
    const { currentUser } = useSimulation();
    const { mutate } = useSWRConfig();
    const { data: financialData, isLoading, error } = useSWR(
        currentUser?.id ? `/api/financials?userId=${currentUser.id}` : null,
        fetcher
    );

    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [pixKey, setPixKey] = useState(currentUser?.pix_key || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const handleWithdrawRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError("");

        const amount = financialData?.available || 0;

        if (amount <= 0) {
            setFormError("Não há saldo disponível para saque.");
            setIsSubmitting(false);
            return;
        }

        if (!pixKey || pixKey.trim().length < 5) {
            setFormError("Informe uma chave PIX válida.");
            setIsSubmitting(false);
            return;
        }

        try {
            await axios.post("/api/financials", {
                userId: currentUser.id,
                amount: amount,
                pixKey: pixKey
            });

            mutate(`/api/financials?userId=${currentUser.id}`);
            setIsWithdrawModalOpen(false);
            setWithdrawAmount("");
        } catch (err: any) {
            setFormError(err.response?.data?.error || "Erro ao processar solicitação.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center animate-pulse font-bold text-slate-400">CARREGANDO DADOS FINANCEIROS...</div>;

    const transactions = financialData?.transactions || [];

    return (
        <div className="p-3.5 space-y-1.5 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2/3 h-full bg-primary/10 blur-[150px] pointer-events-none animate-pulse" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none rounded-full" />

                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border border-white/10 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <Wallet size={16} strokeWidth={3} />
                        </div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">PATRIMÔNIO E LIQUIDEZ</p>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] leading-none uppercase">
                        Gestão <span className="text-primary">Financeira</span>
                    </h1>
                </div>

                <button
                    onClick={() => {
                        setPixKey(currentUser?.pix_key || "");
                        setIsWithdrawModalOpen(true);
                    }}
                    className="relative z-10 bg-slate-900 dark:bg-primary text-white px-4 py-2 rounded-xl font-bold text-[8px] uppercase tracking-[0.15em] flex items-center gap-2 shadow-md hover:scale-[1.02] transition-all self-start md:self-auto active:scale-95 border border-white/10 group/btn"
                >
                    <ArrowDownCircle size={16} strokeWidth={3} className="relative z-10" />
                    <span className="relative z-10">RESGATE PIX</span>
                </button>
            </div>

            {/* Premium Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mt-1.5">
                <div className="bg-emerald-500/5 backdrop-blur-xl rounded-xl border border-emerald-500/10 p-4 shadow-sm overflow-hidden relative group hover:border-emerald-500/30 transition-all duration-500 hover:scale-[1.01]">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[7px] font-bold text-emerald-600 uppercase tracking-[0.2em] opacity-60 italic">DISPONÍVEL AGORA</p>
                            <div className="size-6 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md border border-white/10">
                                <TrendingUp size={12} strokeWidth={3} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-3 tracking-tight text-emerald-600 uppercase">
                            {financialData?.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h4>
                        <div className="flex items-center gap-2 text-[7px] font-bold text-white uppercase tracking-[0.1em] bg-emerald-600 px-3 py-1 rounded-lg border border-white/10 shadow-sm w-full justify-center">
                            <span>LIBERADO PARA RESGATE</span>
                        </div>
                    </div>
                </div>

                <div className="bg-amber-500/5 backdrop-blur-xl rounded-xl border border-amber-500/10 p-4 shadow-sm overflow-hidden relative group hover:border-amber-500/30 transition-all duration-500 hover:scale-[1.01]">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[7px] font-bold text-amber-600 uppercase tracking-[0.2em] opacity-60 italic">EM PROCESSAMENTO</p>
                            <div className="size-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-md border border-white/10">
                                <Clock size={12} strokeWidth={3} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-3 tracking-tight text-amber-600 uppercase">
                            {financialData?.processing.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h4>
                        <div className="flex items-center gap-2 text-[7px] font-bold text-amber-700 uppercase tracking-[0.1em] bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 shadow-sm w-full justify-center">
                            <span>AGUARDANDO LIQUIDAÇÃO</span>
                        </div>
                    </div>
                </div>

                <div className="bg-indigo-500/5 backdrop-blur-xl rounded-xl border border-indigo-500/10 p-4 shadow-sm overflow-hidden relative group hover:border-indigo-500/30 transition-all duration-500 hover:scale-[1.01]">
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-[7px] font-bold text-indigo-600 uppercase tracking-[0.2em] opacity-60 italic">TOTAL CONSOLIDADO</p>
                            <div className="size-6 rounded-lg bg-indigo-500 text-white flex items-center justify-center shadow-md border border-white/10">
                                <CheckCircle2 size={12} strokeWidth={3} />
                            </div>
                        </div>
                        <h4 className="text-xl font-bold mb-3 tracking-tight text-indigo-600 uppercase">
                            {financialData?.withdrawn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </h4>
                        <div className="flex items-center gap-2 text-[7px] font-bold text-indigo-700 uppercase tracking-[0.1em] bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20 shadow-sm w-full justify-center">
                            <span>HISTÓRICO DE SAQUES</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Realce Transaction History */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]/30">
                    <div className="space-y-0.5">
                        <h3 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase">Fluxo de Caixa</h3>
                        <p className="text-[7px] text-primary font-bold uppercase tracking-[0.4em] opacity-70 italic">AUDITORIA DE MOVIMENTAÇÕES</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.1em] text-white bg-slate-900 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-800 transition-all shadow-sm">
                        <Download size={12} strokeWidth={3} />
                        EXPORTAR
                    </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[var(--background)]/50 border-b border-[var(--border)]">
                                <th className="px-5 py-2 text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">TIPO / DESCRIÇÃO</th>
                                <th className="px-5 py-2 text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">DATA E HORA</th>
                                <th className="px-5 py-2 text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">ESTADO</th>
                                <th className="px-5 py-2 text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.3em] text-right">MONTANTE</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-[var(--border)]">
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-14 py-32 text-center text-[var(--muted)] text-sm font-black uppercase tracking-[0.6em] opacity-30">SEM DADOS PARA EXIBIÇÃO</td>
                                </tr>
                            )}
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-primary/[0.02] transition-all group/row">
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "size-7 rounded bg-[var(--background)] flex items-center justify-center border shadow-sm transition-all group-hover/row:scale-105",
                                                Number(tx.amount) > 0 ? "text-emerald-500 border-emerald-500/20" : "text-rose-500 border-rose-500/20"
                                            )}>
                                                {Number(tx.amount) > 0 ? <Banknote size={12} strokeWidth={2.5} /> : <CreditCard size={12} strokeWidth={2.5} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-bold text-[var(--foreground)] tracking-tight uppercase leading-none">{tx.type}</p>
                                                <p className="text-[7px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-40 italic leading-none">{tx.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <div className="flex items-center gap-2 text-[var(--muted)] font-bold text-[10px] uppercase tracking-tight">
                                            <Calendar size={12} className="text-primary/40" />
                                            <span className="opacity-70">{new Date(tx.created_at).toLocaleString('pt-BR')}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2.5">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[7px] font-bold uppercase tracking-[0.1em] border shadow-sm transition-all",
                                            tx.status === 'Disponível' ? "bg-emerald-600 text-white border-white/10 shadow-emerald-600/10" :
                                                tx.status === 'Liquidado' ? "bg-indigo-600 text-white border-white/10 shadow-indigo-600/10" :
                                                    tx.status === 'Processando' ? "bg-amber-500 text-white border-white/10 shadow-amber-500/10" :
                                                        "bg-rose-600 text-white border-white/10 shadow-rose-600/10"
                                        )}>
                                            <div className="size-1 rounded-full bg-white animate-pulse" />
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-5 py-2 text-right text-sm font-bold tracking-tight uppercase",
                                        Number(tx.amount) > 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {(Number(tx.amount) > 0 ? "+" : "") + Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Withdraw Modal - High Realce */}
            <Modal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                title="CONSOLIDAÇÃO E RESGATE"
                width="sm"
            >
                <form onSubmit={handleWithdrawRequest} className="space-y-4">
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10 space-y-1 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] pointer-events-none" />
                        <p className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-1 opacity-60">TOTAL DISPONÍVEL</p>
                        <p className="text-xl font-bold text-emerald-600 tracking-tight uppercase leading-none">
                            {financialData?.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <div className="flex items-center gap-1.5 text-[7px] text-emerald-600/60 font-bold uppercase tracking-widest pt-2 border-t border-emerald-500/10 mt-2">
                            <AlertCircle size={10} strokeWidth={3} />
                            Pagamento via PIX Automático.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Input
                                label="MONTANTE PARA LIQUIDAÇÃO"
                                type="text"
                                value={financialData?.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                readOnly
                                className="bg-[var(--background)] border-2 border-emerald-500/10 opacity-60 cursor-not-allowed font-bold text-lg uppercase tracking-tight h-14"
                            />
                            <div className="absolute right-4 top-[48px]">
                                <CheckCircle2 size={24} strokeWidth={3} className="text-emerald-500 opacity-50" />
                            </div>
                        </div>
                        <Input
                            label="CHAVE PIX DESTINATÁRIA"
                            value={pixKey}
                            onChange={(e: any) => setPixKey(e.target.value)}
                            placeholder="CPF, E-MAIL OU CHAVE ALEATÓRIA"
                            required
                            className="h-14 text-lg font-bold uppercase tracking-tight border-2 focus:border-primary transition-all rounded-xl"
                        />
                    </div>

                    {formError && (
                        <div className="flex items-center gap-3 text-white text-[9px] font-bold bg-rose-600 p-4 rounded-xl border-2 border-white/10 shadow-lg uppercase tracking-widest animate-in slide-in-from-top-2">
                            <AlertCircle size={18} strokeWidth={3} />
                            <span>{formError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-2 pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting || (financialData?.available || 0) <= 0}
                            className="w-full bg-slate-900 dark:bg-primary text-white py-3 rounded-xl font-bold text-[8px] uppercase tracking-[0.15em] shadow-md hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 border border-white/10"
                        >
                            {isSubmitting ? "PROCESSANDO..." : `SOLICITAR RESGATE`}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsWithdrawModalOpen(false)}
                            className="w-full text-[var(--muted)] font-bold text-[8px] uppercase tracking-[0.1em] hover:text-[var(--foreground)] transition-colors py-1 opacity-50"
                        >
                            FECHAR
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
