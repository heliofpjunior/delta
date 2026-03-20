"use client";

import {
    Users,
    Search,
    MessageCircle,
    Calendar,
    Shield,
    Plus,
    Filter,
    Edit3,
    Trash2,
    TrendingUp,
    AlertCircle,
    Building2,
    CalendarClock,
    UserCheck,
    ChevronRight,
    ExternalLink,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    RefreshCw,
    RefreshCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import CustomerModal from "@/components/CustomerModal";
import axios from "axios";

export default function CustomersPage() {
    const { currentUser } = useSimulation();
    const { data: customers, error } = useSWR(`/api/customers?userId=${currentUser.id}&role=${currentUser.role}`, fetcher);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("Todos");
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' | null }>({ key: 'name', direction: 'asc' });
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: string) => {
        if (sortConfig.key !== key) return <ArrowUpDown size={12} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-primary" /> : <ArrowDown size={12} className="text-primary" />;
    };

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("Novo Cliente");
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const filteredCustomers = (customers || []).filter((customer: any) => {
        const contactValues = customer.contacts?.map((c: any) => c.value?.toLowerCase()) || [];
        const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.doc?.includes(searchTerm) ||
            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contactValues.some((v: string) => v.includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        if (activeTab === "Leads") return customer.status === "Lead" || customer.status === "Oportunidade";
        if (activeTab === "Ativos") return customer.status === "Ativo";
        if (activeTab === "Concorrência") return customer.origin === "Migração";
        if (activeTab === "Vencendo") {
            if (!customer.expiry_date) return false;
            const diff = new Date(customer.expiry_date).getTime() - new Date().getTime();
            return diff > 0 && diff < (30 * 24 * 60 * 60 * 1000); // 30 days
        }

        return true;
    }).sort((a: any, b: any) => {
        if (!sortConfig.key || !sortConfig.direction) return 0;

        let aValue = a[sortConfig.key] || "";
        let bValue = b[sortConfig.key] || "";

        if (sortConfig.key === 'expiry_date') {
            aValue = aValue ? new Date(aValue).getTime() : 0;
            bValue = bValue ? new Date(bValue).getTime() : 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleAdd = () => {
        setSelectedCustomer(null);
        setModalTitle("Novo Cliente");
        setSubmissionError(null);
        setIsModalOpen(true);
    };

    const handleEdit = (customer: any) => {
        setSelectedCustomer(customer);
        setModalTitle("Editar Cliente");
        setSubmissionError(null);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Tem certeza que deseja excluir este cliente?")) {
            await axios.delete(`/api/customers?id=${id}`);
            mutate(`/api/customers?userId=${currentUser.id}&role=${currentUser.role}`);
        }
    };

    const handleModalSubmit = async (data: any) => {
        console.log("Submit initialized with data:", data);
        try {
            if (selectedCustomer) {
                await axios.put("/api/customers", { ...data, id: selectedCustomer.id });
            } else {
                await axios.post("/api/customers", { ...data, seller: currentUser.name, sellerId: currentUser.id });
            }
            setIsModalOpen(false);
            mutate(`/api/customers?userId=${currentUser.id}&role=${currentUser.role}`);
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.message || "Erro desconhecido";
            setSubmissionError(errorMsg);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Oportunidade": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
            case "Lead": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
            case "Ativo": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            case "Vencido": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
            default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
        }
    };

    const dayDiff = (dateStr: string) => {
        if (!dateStr) return null;
        const diff = Math.ceil((new Date(dateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const handleSyncCertificates = async () => {
        setIsSyncing(true);
        try {
            const response = await axios.post("/api/integracao/certificados/sync");
            if (response.data.success) {
                alert(response.data.message);
                mutate(`/api/customers?userId=${currentUser.id}&role=${currentUser.role}`);
            }
        } catch (err: any) {
            alert("Erro ao sincronizar certificados: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="p-3.5 space-y-1.5 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border border-white/20">
                            <Users size={14} strokeWidth={3} />
                        </div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">MÁQUINA DE VENDAS</p>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] leading-none uppercase">Gestão de Clientes</h1>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                        onClick={handleSyncCertificates}
                        disabled={isSyncing}
                        className={cn(
                            "px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all border shadow-sm",
                            isSyncing
                                ? "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] cursor-not-allowed"
                                : "bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:border-primary/40 hover:bg-[var(--background)] active:scale-95 group"
                        )}
                    >
                        <RefreshCw size={16} strokeWidth={3} className={cn(isSyncing && "animate-spin", !isSyncing && "text-primary/60 transition-transform group-hover:rotate-180 group-hover:text-primary")} />
                        {isSyncing ? "SINC" : "SINCRONIZAR"}
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.02] border border-white/10 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} />
                        NOVO REGISTRO
                    </button>
                </div>
            </div>

            {/* High-Realce Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 mt-1.5">
                <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-between group hover:border-blue-500/40 transition-all duration-500 hover:scale-[1.01]">
                    <div className="size-10 rounded-lg bg-blue-600/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20 mb-4 group-hover:scale-105 transition-transform">
                        <Users size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-60">Base Total</p>
                        <p className="text-xl font-bold text-[var(--foreground)] tracking-tight uppercase leading-none">{customers?.length || 0}</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-between group hover:border-amber-500/40 transition-all duration-500 hover:scale-[1.01]">
                    <div className="size-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 mb-4 group-hover:scale-105 transition-transform">
                        <TrendingUp size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-60">Oportunidades</p>
                        <p className="text-xl font-bold text-[var(--foreground)] tracking-tight uppercase leading-none">{customers?.filter((c: any) => c.status === "Oportunidade").length || 0}</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-between group hover:border-emerald-500/40 transition-all duration-500 hover:scale-[1.01]">
                    <div className="size-10 rounded-lg bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-500/20 mb-4 group-hover:scale-105 transition-transform">
                        <Shield size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-60">Ativos</p>
                        <p className="text-xl font-bold text-[var(--foreground)] tracking-tight uppercase leading-none">{customers?.filter((c: any) => c.status === "Ativo").length || 0}</p>
                    </div>
                </div>
                <div className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] shadow-sm flex flex-col justify-between group hover:border-rose-500/40 transition-all duration-500 hover:scale-[1.01]">
                    <div className="size-10 rounded-lg bg-rose-600/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/20 mb-4 group-hover:scale-105 transition-transform">
                        <CalendarClock size={16} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-1 opacity-60">Vencendo</p>
                        <p className="text-xl font-bold text-rose-600 tracking-tight uppercase leading-none">
                            {customers?.filter((c: any) => {
                                const diff = dayDiff(c.expiry_date);
                                return diff !== null && diff > 0 && diff < 30;
                            }).length || 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation & Search - High Realce */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-1.5 shadow-sm mt-1.5">
                <div className="flex flex-col lg:flex-row gap-2">
                    <div className="flex p-0.5 bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-x-auto no-scrollbar shadow-inner">
                        {["Todos", "Leads", "Ativos", "Concorrência", "Vencendo"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-[0.1em] transition-all whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-primary text-white shadow-sm scale-105"
                                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] opacity-60"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative flex-1 flex items-center bg-[var(--background)] rounded-lg border border-[var(--border)] shadow-inner group focus-within:border-primary/40 transition-all">
                        <Search className="absolute left-4 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity" size={16} strokeWidth={3} />
                        <input
                            type="text"
                            placeholder="PESQUISAR CLIENTE..."
                            className="w-full pl-11 pr-4 py-2 bg-transparent border-none text-[9px] focus:ring-0 placeholder:text-[var(--muted)] placeholder:opacity-50 font-bold uppercase tracking-wider"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* High-Realce Data List */}
            <div className="space-y-4">
                {error && (
                    <div className="p-8 mb-8 bg-rose-600 text-white rounded-[2rem] border-4 border-white/20 flex items-center gap-6 shadow-2xl shadow-rose-600/30">
                        <AlertCircle size={32} strokeWidth={3} />
                        <div className="text-sm font-black uppercase tracking-[0.2em]">
                            ERRO CRÍTICO NA SINCRONIZAÇÃO. VERIFIQUE A INTEGRIDADE DO BANCO DE DADOS.
                        </div>
                    </div>
                )}

                {!customers && !error && (
                    <div className="py-24 flex flex-col items-center justify-center gap-6">
                        <div className="size-16 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-primary font-black uppercase tracking-[0.5em] text-xs">Sincronizando Máquina de Vendas...</p>
                    </div>
                )}

                <div className="hidden lg:grid grid-cols-12 gap-1.5 px-6 py-2.5 text-[8px] font-bold uppercase tracking-[0.4em] text-[var(--muted)] opacity-50 italic">
                    <div className="col-span-4 flex items-center gap-2 cursor-pointer group" onClick={() => handleSort('name')}>
                        Cliente / Registro
                        {getSortIcon('name')}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 cursor-pointer group" onClick={() => handleSort('status')}>
                        Status CRM
                        {getSortIcon('status')}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 cursor-pointer group" onClick={() => handleSort('certificate_type')}>
                        Certificado
                        {getSortIcon('certificate_type')}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 cursor-pointer group" onClick={() => handleSort('expiry_date')}>
                        Timeline
                        {getSortIcon('expiry_date')}
                    </div>
                    <div className="col-span-2 text-right">AÇÕES</div>
                </div>

                <div className="space-y-4">
                    {filteredCustomers.map((customer: any) => {
                        const diff = dayDiff(customer.expiry_date);
                        const isExpiring = diff !== null && diff > 0 && diff < 30;

                        return (
                            <div key={customer.id} className="relative group transition-all duration-300">
                                {/* Desktop View Row */}
                                <div className="hidden lg:grid grid-cols-12 gap-1.5 items-center px-5 py-3.5 bg-[var(--card)] border border-[var(--border)] rounded-xl hover:border-primary/40 group-hover:shadow-sm transition-all">
                                    {/* Client Info */}
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className={cn(
                                            "size-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 border shadow-sm",
                                            customer.origin === "Migração" ? "bg-rose-500 text-white border-white/20" : "bg-primary text-white border-white/20"
                                        )}>
                                            {customer.origin === "Migração" ? <Building2 size={18} strokeWidth={3} /> : customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-[13px] text-[var(--foreground)] truncate uppercase tracking-tight leading-none">{customer.name}</p>
                                                {customer.origin === "Migração" && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 text-[6px] font-bold uppercase tracking-widest border border-rose-500/20">Migração</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-[8px] text-[var(--muted)] font-bold uppercase tracking-[0.1em] opacity-60">
                                                <span>{customer.doc}</span>
                                                {customer.contacts?.length > 0 && (
                                                    <>
                                                        <div className="size-1 bg-primary/30 rounded-full" />
                                                        <span className="text-primary truncate max-w-[120px]">
                                                            {customer.contacts[0].value}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-2">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-lg text-[8px] font-bold uppercase tracking-[0.1em] border shadow-sm inline-flex items-center gap-1.5",
                                            customer.status === "Ativo" ? "bg-emerald-600 text-white border-white/10 shadow-emerald-600/10" :
                                                customer.status === "Lead" ? "bg-blue-600 text-white border-white/10 shadow-blue-600/10" :
                                                    customer.status === "Oportunidade" ? "bg-amber-500 text-white border-white/10 shadow-amber-500/10" :
                                                        "bg-rose-600 text-white border-white/10 shadow-rose-600/10"
                                        )}>
                                            <div className="size-1 rounded-full bg-white animate-pulse" />
                                            {customer.status}
                                        </span>
                                    </div>

                                    {/* Certificate Type */}
                                    <div className="col-span-2">
                                        <div className="flex items-center gap-2.5 p-2 bg-[var(--background)] rounded-lg border border-[var(--border)] shadow-inner">
                                            <Shield size={14} strokeWidth={3} className={customer.certificate_type ? "text-primary" : "text-[var(--muted)] opacity-30"} />
                                            <p className="text-[10px] font-bold text-[var(--foreground)] uppercase truncate">{customer.certificate_type || "NENHUM"}</p>
                                        </div>
                                    </div>

                                    {/* Expiration */}
                                    <div className="col-span-2">
                                        {customer.expiry_date ? (
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-tight">
                                                    {new Date(customer.expiry_date).toLocaleDateString('pt-BR')}
                                                </p>
                                                {isExpiring ? (
                                                    <div className="flex items-center gap-1.5 text-rose-600 text-[7px] font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 w-fit">
                                                        <AlertCircle size={10} strokeWidth={3} />
                                                        VENCE EM {diff} DIAS
                                                    </div>
                                                ) : diff && diff < 0 ? (
                                                    <div className="text-rose-600 text-[7px] font-bold uppercase bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 w-fit">EXPIRADO</div>
                                                ) : (
                                                    <div className="text-emerald-600 text-[7px] font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 w-fit">EM DIA</div>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-[11px] text-[var(--muted)] font-bold opacity-30 tracking-widest leading-none">---</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-2 flex items-center justify-end gap-1.5 px-1">
                                        <button
                                            onClick={() => window.open(`https://wa.me/55${customer.phone?.replace(/\D/g, '')}`)}
                                            className="size-8 rounded-lg flex items-center justify-center text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/20 hover:border-emerald-500 transition-all shadow-sm active:scale-90"
                                            title="WHATSAPP"
                                        >
                                            <MessageCircle size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="size-8 rounded-lg flex items-center justify-center text-primary bg-primary/5 hover:bg-primary hover:text-white border border-primary/20 hover:border-primary transition-all shadow-sm active:scale-90"
                                        >
                                            <Edit3 size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="size-8 rounded-lg flex items-center justify-center text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all shadow-sm active:scale-90"
                                        >
                                            <Trash2 size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile View Card - High Realce */}
                                <div className="lg:hidden block p-8 bg-[var(--card)] border-4 border-[var(--border)] rounded-[3rem] shadow-xl space-y-8 mb-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "size-18 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0 border-2 shadow-inner",
                                                customer.origin === "Migração" ? "bg-rose-500 text-white border-white/20" : "bg-primary text-white border-white/20"
                                            )}>
                                                {customer.origin === "Migração" ? <Building2 size={28} strokeWidth={3} /> : customer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <p className="font-black text-lg text-[var(--foreground)] uppercase tracking-tight truncate">{customer.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                                                        customer.status === "Ativo" ? "bg-emerald-600 text-white border-white/10" :
                                                            customer.status === "Lead" ? "bg-blue-600 text-white border-white/10" :
                                                                customer.status === "Oportunidade" ? "bg-amber-500 text-white border-white/10" :
                                                                    "bg-rose-600 text-white border-white/10"
                                                    )}>
                                                        {customer.status}
                                                    </span>
                                                    <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">{customer.doc}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => window.open(`https://wa.me/55${customer.phone?.replace(/\D/g, '')}`)}
                                                className="size-14 rounded-2xl flex items-center justify-center text-emerald-500 bg-emerald-500/10 border-2 border-emerald-500/20"
                                            >
                                                <MessageCircle size={28} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6 p-6 bg-[var(--background)] rounded-[2rem] border-2 border-[var(--border)] shadow-inner">
                                        <div className="space-y-2">
                                            <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.3em] opacity-60">CERTIFICADO</p>
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} strokeWidth={3} className={customer.certificate_type ? "text-primary" : "text-[var(--muted)] opacity-30"} />
                                                <p className="text-[11px] font-black text-[var(--foreground)] uppercase truncate">{customer.certificate_type || "---"}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.3em] opacity-60">VENCIMENTO</p>
                                            {customer.expiry_date ? (
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} strokeWidth={3} className={isExpiring ? "text-rose-600" : "text-emerald-600"} />
                                                    <p className={cn(
                                                        "text-[11px] font-black uppercase tracking-tight",
                                                        isExpiring ? "text-rose-600" : "text-[var(--foreground)]"
                                                    )}>
                                                        {new Date(customer.expiry_date).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[11px] text-[var(--muted)] font-black opacity-30 italic uppercase">NENHUM</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleEdit(customer)}
                                            className="flex-1 bg-primary text-white py-6 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-primary/20 border-2 border-white/10"
                                        >
                                            DETALHES DO CLIENTE
                                        </button>
                                        <button
                                            onClick={() => handleDelete(customer.id)}
                                            className="size-18 bg-rose-500/10 text-rose-600 rounded-[1.5rem] flex items-center justify-center border-2 border-rose-500/20 shadow-xl"
                                        >
                                            <Trash2 size={24} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {filteredCustomers.length === 0 && (
                <div className="py-40 flex flex-col items-center justify-center text-center px-8 bg-[var(--card)] rounded-[4rem] border-8 border-dashed border-[var(--border)] shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-[150px] pointer-events-none" />
                    <div className="size-32 rounded-[2.5rem] bg-[var(--background)] border-4 border-[var(--border)] flex items-center justify-center text-[var(--muted)] mb-10 shadow-2xl group hover:scale-110 transition-transform duration-500">
                        <Users size={64} strokeWidth={2.5} className="opacity-20 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter text-[var(--foreground)]">Sua Base está Vazia</h2>
                    <p className="text-[var(--muted)] text-sm max-w-md mb-12 font-black uppercase tracking-[0.2em] opacity-40 leading-relaxed italic">Inicie sua prospecção hoje. Cadastre seu primeiro lead ou sincronize sua base externa para começar a escalar.</p>
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-12 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all border-2 border-white/10"
                    >
                        ADICIONAR PRIMEIRO LEAD
                    </button>
                </div>
            )}

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedCustomer}
                title={modalTitle}
                submissionError={submissionError}
            />
        </div>
    );
}
