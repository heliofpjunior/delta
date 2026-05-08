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
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Mobile Header - Banking Style */}
            <div className="flex md:hidden items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">CRM</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Clientes</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSyncCertificates}
                        className={cn(
                            "p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm active:scale-90 transition-transform text-slate-600 dark:text-slate-400",
                            isSyncing && "animate-spin"
                        )}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button 
                        onClick={handleAdd}
                        className="p-2.5 rounded-full bg-primary text-white shadow-lg active:scale-90 transition-transform"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
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
                <div className="relative z-10 flex gap-3">
                    <button
                        onClick={handleSyncCertificates}
                        disabled={isSyncing}
                        className="px-5 py-2.5 rounded-xl font-bold text-[9px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-primary/40 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw size={16} className={cn(isSyncing && "animate-spin")} />
                        SINCRONIZAR
                    </button>
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-md hover:scale-[1.02] border border-white/10 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} />
                        NOVO REGISTRO
                    </button>
                </div>
            </div>

            {/* Statistics - Ultra-Condensed with Elegant Navigation */}
            <div className="relative group/stats">
                <div className="flex md:grid md:grid-cols-4 gap-2 overflow-x-auto no-scrollbar scroll-smooth pb-1 md:pb-0" id="stats-container">
                    <div className="flex-1 min-w-[120px] md:min-w-0 bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                            <Users size={16} />
                        </div>
                        <div className="leading-none">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{customers?.length || 0}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[120px] md:min-w-0 bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                            <TrendingUp size={16} />
                        </div>
                        <div className="leading-none">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{customers?.filter((c: any) => c.status === "Oportunidade").length || 0}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Ops</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[120px] md:min-w-0 bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                            <Shield size={16} />
                        </div>
                        <div className="leading-none">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{customers?.filter((c: any) => c.status === "Ativo").length || 0}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Ativos</p>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[120px] md:min-w-0 bg-white dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shrink-0">
                            <CalendarClock size={16} />
                        </div>
                        <div className="leading-none">
                            <p className="text-sm font-bold text-rose-500">
                                {customers?.filter((c: any) => {
                                    const diff = dayDiff(c.expiry_date);
                                    return diff !== null && diff > 0 && diff < 30;
                                }).length || 0}
                            </p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Vence</p>
                        </div>
                    </div>
                </div>
                
                {/* Visual Indicators for Scroll */}
                <div className="md:hidden absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none flex items-center justify-end pr-1 opacity-0 group-hover/stats:opacity-100 transition-opacity">
                    <div className="size-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-slate-400">
                        <ChevronRight size={14} />
                    </div>
                </div>
            </div>

            {/* Navigation & Search */}
            <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, documento ou e-mail..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-white dark:bg-slate-900/40 p-1 rounded-2xl border border-slate-200 dark:border-white/5 overflow-x-auto no-scrollbar">
                        {["Todos", "Leads", "Ativos", "Vencendo"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                    activeTab === tab
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Customers List */}
            <div className="space-y-3">
                {error && (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 flex items-center gap-4">
                        <AlertCircle size={20} />
                        <p className="text-xs font-bold uppercase tracking-wider">Erro ao carregar base de clientes.</p>
                    </div>
                )}

                {/* Mobile View - Banking CRM Cards */}
                <div className="md:hidden space-y-3">
                    {filteredCustomers.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/5 rounded-[32px]">
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                <Users size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Nenhum cliente encontrado</p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer: any) => {
                            const diff = dayDiff(customer.expiry_date);
                            const isExpiring = diff !== null && diff > 0 && diff < 30;

                            return (
                                <div key={customer.id} className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[24px] p-5 shadow-sm active:scale-[0.98] transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm",
                                                customer.origin === "Migração" ? "bg-rose-500/10 text-rose-500" : "bg-primary/10 text-primary"
                                            )}>
                                                {customer.origin === "Migração" ? <Building2 size={22} /> : customer.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight uppercase truncate max-w-[160px]">{customer.name}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                                        customer.status === "Ativo" ? "bg-emerald-500/10 text-emerald-600" :
                                                        customer.status === "Lead" ? "bg-blue-500/10 text-blue-600" :
                                                        customer.status === "Oportunidade" ? "bg-amber-500/10 text-amber-600" :
                                                        "bg-rose-500/10 text-rose-600"
                                                    )}>
                                                        {customer.status}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium">{customer.doc}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => window.open(`https://wa.me/55${customer.phone?.replace(/\D/g, '')}`)}
                                            className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center active:scale-90 transition-transform"
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Certificado</p>
                                            <div className="flex items-center gap-1.5">
                                                <Shield size={12} className="text-primary/60" />
                                                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase truncate">{customer.certificate_type || "---"}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Vencimento</p>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={12} className={isExpiring ? "text-rose-500" : "text-slate-400"} />
                                                <p className={cn(
                                                    "text-[10px] font-bold uppercase",
                                                    isExpiring ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                                                )}>
                                                    {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString('pt-BR') : "---"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleEdit(customer)}
                                            className="bg-slate-900 dark:bg-slate-800 text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                                        >
                                            Detalhes
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(customer.id)}
                                            className="bg-rose-500/10 text-rose-600 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop View Table - Refined */}
                <div className="hidden md:block bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left" onClick={() => handleSort('name')}>Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left" onClick={() => handleSort('status')}>Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Certificado</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left" onClick={() => handleSort('expiry_date')}>Vencimento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredCustomers.map((customer: any) => {
                                const diff = dayDiff(customer.expiry_date);
                                const isExpiring = diff !== null && diff > 0 && diff < 30;

                                return (
                                    <tr key={customer.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center font-bold text-sm text-white",
                                                    customer.origin === "Migração" ? "bg-rose-500" : "bg-primary"
                                                )}>
                                                    {customer.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{customer.name}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{customer.doc}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm",
                                                customer.status === "Ativo" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                                customer.status === "Lead" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                                customer.status === "Oportunidade" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                            )}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            {customer.certificate_type || "---"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {customer.expiry_date ? new Date(customer.expiry_date).toLocaleDateString('pt-BR') : "---"}
                                                </p>
                                                {isExpiring && <span className="text-[8px] font-bold text-rose-500 uppercase">Vence em {diff} dias</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => window.open(`https://wa.me/55${customer.phone?.replace(/\D/g, '')}`)}
                                                    className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"
                                                >
                                                    <MessageCircle size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(customer)}
                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

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
