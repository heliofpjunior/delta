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

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups: any, tx: any) => {
        const date = new Date(tx.created_at).toLocaleDateString('pt-BR');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tx);
        return groups;
    }, {});

    const getRelativeDate = (dateStr: string) => {
        const today = new Date().toLocaleDateString('pt-BR');
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toLocaleDateString('pt-BR');

        if (dateStr === today) return "Hoje";
        if (dateStr === yesterdayStr) return "Ontem";
        return dateStr;
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Mobile Header - Banking Style */}
            <div className="flex md:hidden items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Olá, {currentUser?.name?.split(' ')[0]}</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Minha Conta</h1>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setPixKey(currentUser?.pix_key || "");
                        setIsWithdrawModalOpen(true);
                    }}
                    className="p-2.5 rounded-full bg-slate-900 dark:bg-primary text-white shadow-lg active:scale-90 transition-transform"
                >
                    <ArrowDownCircle size={20} />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
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

            {/* Balance Summary - Optimized for Vertical Space */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Main Balance Card - Compact & Elegant */}
                <div className="md:col-span-3 lg:col-span-1 bg-slate-950 dark:bg-slate-900 rounded-[24px] p-5 shadow-xl relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -mr-16 -mt-16" />
                    
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Saldo Disponível</span>
                                <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-none">
                                    {financialData?.available.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </h2>
                            </div>
                            <button 
                                onClick={() => {
                                    setPixKey(currentUser?.pix_key || "");
                                    setIsWithdrawModalOpen(true);
                                }}
                                className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95 transition-all"
                            >
                                Resgatar
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">A Receber</p>
                                    <p className="text-sm font-bold text-slate-200">
                                        {financialData?.processing.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-500 border border-white/10">
                                    <CheckCircle2 size={14} />
                                </div>
                                <div>
                                    <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Resgatado</p>
                                    <p className="text-sm font-bold text-slate-200">
                                        {financialData?.withdrawn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Cards for Desktop Only */}
                <div className="hidden lg:flex lg:col-span-2 grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900/40 rounded-[24px] p-6 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="size-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <Clock size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Em Processamento</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {financialData?.processing.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/40 rounded-[24px] p-6 border border-slate-200 dark:border-white/5 shadow-sm flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <CheckCircle2 size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Consolidado</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {financialData?.withdrawn.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Atividades</h3>
                    <div className="flex gap-2">
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl">
                            <Search size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-primary transition-colors bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-xl">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                {/* Mobile Transaction List - Grouped by Date */}
                <div className="md:hidden space-y-6">
                    {Object.keys(groupedTransactions).length === 0 ? (
                        <div className="py-20 text-center space-y-3">
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                <Search size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Nenhuma movimentação</p>
                        </div>
                    ) : (
                        Object.keys(groupedTransactions).map((date) => (
                            <div key={date} className="space-y-3">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2">{getRelativeDate(date)}</h4>
                                <div className="space-y-2">
                                    {groupedTransactions[date].map((tx: any) => (
                                        <div key={tx.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-3xl p-5 flex items-center justify-between shadow-sm active:scale-[0.98] transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-12 rounded-2xl flex items-center justify-center shadow-sm",
                                                    tx.type === 'Resgate' || Number(tx.amount) < 0 
                                                        ? "bg-rose-500/10 text-rose-500" 
                                                        : "bg-emerald-500/10 text-emerald-500"
                                                )}>
                                                    {tx.type === 'Resgate' ? <ArrowUpRight size={22} /> : <ArrowDownCircle size={22} />}
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{tx.description || tx.type}</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-slate-500 font-medium">
                                                            {new Date(tx.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                        <span className={cn(
                                                            "size-1 rounded-full",
                                                            tx.status === 'Disponível' ? "bg-emerald-500" :
                                                            tx.status === 'Liquidado' ? "bg-indigo-500" :
                                                            tx.status === 'Processando' ? "bg-amber-500" :
                                                            "bg-rose-500"
                                                        )} />
                                                        <span className="text-[10px] text-slate-400 font-medium">{tx.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-base font-bold tracking-tight",
                                                    Number(tx.amount) > 0 ? "text-emerald-600" : "text-rose-600"
                                                )}>
                                                    {(Number(tx.amount) > 0 ? "+" : "") + Number(tx.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View - Refined */}
                <div className="hidden md:block bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Descrição</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Data</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {transactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "size-8 rounded-lg flex items-center justify-center",
                                                Number(tx.amount) > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                                            )}>
                                                {Number(tx.amount) > 0 ? <Banknote size={16} /> : <CreditCard size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.type}</p>
                                                <p className="text-[10px] text-slate-500">{tx.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs text-slate-500 font-medium">
                                            {new Date(tx.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            tx.status === 'Disponível' ? "bg-emerald-500/10 text-emerald-600" :
                                            tx.status === 'Liquidado' ? "bg-indigo-500/10 text-indigo-600" :
                                            tx.status === 'Processando' ? "bg-amber-500/10 text-amber-600" :
                                            "bg-rose-500/10 text-rose-600"
                                        )}>
                                            {tx.status}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-right font-bold text-sm",
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
