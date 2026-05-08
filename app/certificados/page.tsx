"use client";

import {
    Search,
    Filter,
    AlertCircle,
    MoreHorizontal,
    FileText,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar,
    User,
    Plus,
    ArrowUpDown,
    Archive,
    FileEdit,
    RefreshCw,
    Trash2,
    ChevronRight,
    Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import { supabase } from "@/lib/supabase";
import OrderJourneyModal from "@/components/OrderJourneyModal";
import OrderDetailsModal from "@/components/OrderDetailsModal";
import axios from "axios";

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
    "Aguardando Agendamento": {
        icon: Calendar,
        label: "Aguardando Agendamento",
        className: "bg-cyan-600 text-white ring-cyan-500/30 shadow-cyan-600/20",
    },
    Agendado: {
        icon: Clock,
        label: "Agendado",
        className: "bg-indigo-600 text-white ring-indigo-500/30 shadow-indigo-600/20",
    },
    "Em Validação": {
        icon: User,
        label: "Em Validação",
        className: "bg-violet-600 text-white ring-violet-500/30 shadow-violet-600/20",
    },
    Validado: {
        icon: CheckCircle2,
        label: "Validado",
        className: "bg-blue-600 text-white ring-blue-500/30 shadow-blue-600/20",
    },
    Aprovado: {
        icon: CheckCircle2,
        label: "Pronto p/ Emitir",
        className: "bg-emerald-500 text-white ring-emerald-400/30 shadow-emerald-500/20 animate-pulse",
    },
    Reprovado: {
        icon: XCircle,
        label: "Reprovado",
        className: "bg-rose-600 text-white ring-rose-500/30 shadow-rose-600/20",
    },
    Emitido: {
        icon: CheckCircle2,
        label: "Emitido",
        className: "bg-primary text-white ring-primary shadow-primary/20",
    },
    Cancelado: {
        icon: XCircle,
        label: "Cancelado",
        className: "bg-slate-400 text-white ring-slate-300 shadow-slate-400/20",
    },
    Estornado: {
        icon: RefreshCw,
        label: "Estornado",
        className: "bg-orange-600 text-white ring-orange-500/30 shadow-orange-600/20",
    },
    Expirado: {
        icon: Clock,
        label: "Expirado",
        className: "bg-red-600 text-white ring-red-500/30 shadow-red-600/20",
    },
};

const STATUSES = [
    "Todos",
    "Pendente",
    "Pago",
    "Agendado",
    "Validado",
    "Aprovado",
    "Emitido", // Acts as "Finalizados"
    "Rascunho", // Added Rascunho
    "Cancelado",
    "Expirado",
    "Outros"
];

const getExpiryInfo = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let colorClass = "bg-slate-100 text-slate-600";
    if (diffDays < 0) colorClass = "bg-rose-100 text-rose-700";
    else if (diffDays <= 30) colorClass = "bg-amber-100 text-amber-700";
    else if (diffDays <= 90) colorClass = "bg-blue-100 text-blue-700";

    return {
        days: diffDays,
        label: diffDays < 0 ? "Vencido" : `Expira em ${diffDays}d`,
        dateFormatted: expiry.toLocaleDateString('pt-BR'),
        colorClass
    };
};

export default function CertificatesPage() {
    const { currentUser } = useSimulation();
    const { data: certificates, error } = useSWR(
        `/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`,
        fetcher
    );
    const { data: products } = useSWR("global_products_fetch", async () => {
        const { data, error } = await supabase.from('products').select(`
            *,
            supplier_products (
                *,
                supplier_tables (*)
            )
        `);
        if (error) throw error;
        return data;
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilters, setStatusFilters] = useState<string[]>(["Todos"]);
    const [showArchived, setShowArchived] = useState(false);
    const [isJourneyOpen, setIsJourneyOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<number>(0);
    const [now, setNow] = useState<number>(Date.now());
    const [isFiltersOpen, setIsFiltersOpen] = useState(false); // New state for filters visibility

    useEffect(() => {
        const saved = localStorage.getItem('last_cert_sync');
        if (saved) setLastSync(Number(saved));

        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
    const timeSinceLastSync = now - lastSync;
    const isCoolingDown = timeSinceLastSync < COOLDOWN_MS;
    const secondsRemaining = Math.ceil((COOLDOWN_MS - timeSinceLastSync) / 1000);

    const filteredCertificates = (certificates || []).filter((cert: any) => {
        const matchesSearch =
            cert.holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cert.doc?.includes(searchTerm) ||
            cert.protocol?.toLowerCase().includes(searchTerm.toLowerCase());

        // Logical filter for archived
        const isArchived = cert.status === "Arquivado";
        const matchesArchivedToggle = showArchived ? true : !isArchived;

        let matchesStatus = false;
        if (statusFilters.includes("Todos")) {
            matchesStatus = matchesArchivedToggle;
        } else {
            matchesStatus = statusFilters.some(filter => {
                if (filter === "Emitido") return cert.supplier_status === "Emitido";
                if (filter === "Aprovado") return cert.supplier_status === "Aprovado";
                if (filter === "Outros") {
                    const knownStatuses = ["Pendente", "Pago", "Agendado", "Validado", "Rascunho", "Cancelado", "Expirado"];
                    return !knownStatuses.includes(cert.status) && cert.supplier_status !== "Emitido" && cert.supplier_status !== "Aprovado";
                }
                return cert.status === filter;
            });
            // Apply archive logic to 'Outros' or any specific filter matching 'Arquivado'
            if (matchesStatus && !matchesArchivedToggle && cert.status === "Arquivado") {
                matchesStatus = false;
            }
        }

        return matchesSearch && matchesStatus;
    });

    const handleStatusToggle = (status: string) => {
        if (status === "Todos") {
            setStatusFilters(["Todos"]);
            return;
        }

        let newFilters = statusFilters.filter(s => s !== "Todos");
        if (newFilters.includes(status)) {
            newFilters = newFilters.filter(s => s !== status);
        } else {
            newFilters.push(status);
        }

        if (newFilters.length === 0) {
            setStatusFilters(["Todos"]);
        } else {
            setStatusFilters(newFilters);
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm("Deseja realmente arquivar este rascunho?")) return;
        try {
            const formData = new FormData();
            formData.append('id', id);
            formData.append('status', 'Arquivado');
            formData.append('isUpdateStatusOnly', 'true'); // Flag to prevent data loss

            await axios.post('/api/integracao/vendas', formData);
            mutate(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`);
        } catch (error) {
            alert("Erro ao arquivar.");
        }
    };

    const handleResumeDraft = (cert: any) => {
        setSelectedOrder(cert);
        setIsJourneyOpen(true);
    };

    const handleOrderSubmit = async (data: any) => {
        try {
            const selectedProduct = products?.find((p: any) => p.id === data.productId);
            const submissionData = {
                ...data,
                product: selectedProduct?.name,
                category: selectedProduct?.category,
                origin: `Venda Direta - Vendedor ${currentUser.name} (${currentUser.id})`,
            };
            const response = await axios.post("/api/integracao/vendas", submissionData);
            if (response.data.success) {
                setIsJourneyOpen(false);
                mutate(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`);
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Ops! Algo deu errado na emissão.");
        }
    };

    const handleSyncOrders = async () => {
        setIsSyncing(true);
        try {
            const response = await axios.post("/api/integracao/certificados/sync");
            if (response.data.success) {
                const timestamp = Date.now();
                setLastSync(timestamp);
                localStorage.setItem('last_cert_sync', timestamp.toString());
                alert(response.data.message);
                mutate(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`);
            }
        } catch (err: any) {
            alert("Erro ao sincronizar pedidos: " + (err.response?.data?.error || err.message));
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDeleteDraft = async (e: React.MouseEvent, id: string, protocol: string) => {
        e.stopPropagation(); // Prevent opening details modal
        if (!confirm(`Deseja realmente excluir o rascunho ${protocol}? Esta ação não pode ser desfeita.`)) return;

        try {
            const response = await axios.delete(`/api/integracao/vendas?id=${id}`);
            if (response.data.success) {
                alert("Rascunho excluído com sucesso!");
                mutate(`/api/certificates?userId=${currentUser.id}&role=${currentUser.role}`);
            }
        } catch (err: any) {
            alert("Erro ao excluir rascunho: " + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 animate-in fade-in duration-700 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Mobile Header - Banking Style */}
            <div className="flex md:hidden items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Emissões</p>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">Certificados</h1>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleSyncOrders}
                        disabled={isSyncing || isCoolingDown}
                        className={cn(
                            "p-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-sm active:scale-90 transition-transform text-slate-600 dark:text-slate-400",
                            isSyncing && "animate-spin"
                        )}
                    >
                        {isCoolingDown ? <span className="text-[10px] font-bold">{secondsRemaining}s</span> : <RefreshCw size={18} />}
                    </button>
                    <button 
                        onClick={() => setIsJourneyOpen(true)}
                        className="p-2.5 rounded-full bg-primary text-white shadow-lg active:scale-90 transition-transform"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/2 blur-[80px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border border-white/20">
                            <FileText size={14} strokeWidth={3} />
                        </div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">CENTRO DE EMISSÕES</p>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] leading-none uppercase">Gestão de Certificados</h1>
                </div>
                <div className="relative z-10 flex gap-3">
                    <button
                        onClick={handleSyncOrders}
                        disabled={isSyncing || isCoolingDown}
                        className="px-5 py-2.5 rounded-xl font-bold text-[9px] bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:border-primary/40 active:scale-95 transition-all flex items-center gap-2 shadow-sm"
                    >
                        <RefreshCw size={16} className={cn(isSyncing && "animate-spin")} />
                        {isSyncing ? "SINCRONIZANDO..." : isCoolingDown ? `AGUARDE ${secondsRemaining}S` : "SINCRONIZAR"}
                    </button>
                    <button
                        onClick={() => setIsJourneyOpen(true)}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center gap-2.5 shadow-md hover:scale-[1.02] border border-white/10 active:scale-95 transition-all"
                    >
                        <Plus size={16} strokeWidth={3} />
                        NOVA EMISSÃO
                    </button>
                </div>
            </div>

            {/* Search & Statistics - Compact Header for Mobile */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por titular, CPF/CNPJ ou protocolo..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-2xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Status Pills - Elegant Horizontal Scroll / Expandable Grid on Mobile */}
                <div className="relative group/filters">
                    <div className="flex items-center justify-between md:hidden mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por Status</p>
                        <button 
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10"
                        >
                            <Filter size={12} />
                            {isFiltersOpen ? "Recolher" : "Ver Todos"}
                        </button>
                    </div>

                    <div className={cn(
                        "flex gap-2 pb-1 scroll-smooth no-scrollbar",
                        isFiltersOpen 
                            ? "flex-wrap" 
                            : "overflow-x-auto"
                    )} id="filter-container">
                        {STATUSES.map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusToggle(status)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border shadow-sm",
                                    statusFilters.includes(status)
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white dark:bg-slate-900/40 text-slate-500 border-slate-200 dark:border-white/5 hover:border-primary/20"
                                )}
                            >
                                {status === "Emitido" ? "Finalizados" : status}
                            </button>
                        ))}
                    </div>
                    {!isFiltersOpen && (
                        <div className="md:hidden absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-slate-50 dark:from-slate-950 to-transparent pointer-events-none flex items-center justify-end pr-1 opacity-0 group-hover/filters:opacity-100 transition-opacity">
                            <div className="size-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center text-slate-400">
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Certificates List Content */}
            <div className="space-y-3">
                {error && (
                    <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 flex items-center gap-4">
                        <AlertCircle size={20} />
                        <p className="text-xs font-bold uppercase tracking-wider">Erro ao carregar base de emissões.</p>
                    </div>
                )}

                {/* Mobile View - High-End Certificate Cards */}
                <div className="md:hidden space-y-4">
                    {!certificates && !error ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-4">
                            <div className="size-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <p className="text-primary font-bold uppercase tracking-widest text-[10px]">Sincronizando Base...</p>
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="py-20 text-center space-y-3 bg-white dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-white/5 rounded-[32px]">
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                                <Search size={24} />
                            </div>
                            <p className="text-sm font-medium text-slate-500">Nenhum registro encontrado</p>
                        </div>
                    ) : (
                        filteredCertificates.map((cert: any) => {
                            const currentStatus = (cert.supplier_status === "Aprovado" && cert.status === "Pago") ? "Aprovado" : cert.status;
                            const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pendente"];
                            const StatusIcon = statusCfg.icon;
                            const expiry = getExpiryInfo(cert.expiry_date);
                            const isPJ = cert.doc?.replace(/\D/g, '').length > 11 || cert.category === 'CNPJ';

                            return (
                                <div 
                                    key={cert.id} 
                                    onClick={() => {
                                        setSelectedOrder(cert);
                                        setIsDetailsOpen(true);
                                    }}
                                    className="bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-xl p-5 shadow-sm active:scale-[0.98] transition-all relative overflow-hidden group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-inner",
                                                isPJ ? "bg-indigo-500/10 text-indigo-600" : "bg-primary/10 text-primary"
                                            )}>
                                                {isPJ ? <Building2 size={22} /> : <User size={22} />}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight uppercase truncate max-w-[180px]">{cert.holder}</h4>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black px-2 py-0.5 rounded-lg text-white uppercase tracking-tighter shadow-sm",
                                                        statusCfg.className.split(' ')[0]
                                                    )}>
                                                        {statusCfg.label}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-medium font-mono tracking-tighter">{cert.protocol}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="size-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-active:text-primary transition-colors">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50 dark:border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Produto</p>
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase truncate">{cert.product}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Documento</p>
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase truncate">{cert.doc}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-primary/60" />
                                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">{cert.date}</p>
                                        </div>
                                        {expiry && (
                                            <div className={cn(
                                                "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm",
                                                expiry.days < 30 ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                                            )}>
                                                <Clock size={10} />
                                                {expiry.label}
                                            </div>
                                        )}
                                    </div>

                                    {cert.status === "Rascunho" && (
                                        <div className="mt-4 grid grid-cols-2 gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleResumeDraft(cert); }}
                                                className="bg-primary/10 text-primary py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <FileEdit size={14} /> Finalizar
                                            </button>
                                            <button 
                                                onClick={(e) => handleDeleteDraft(e, cert.id, cert.protocol)}
                                                className="bg-rose-500/10 text-rose-600 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                            >
                                                <Trash2 size={14} /> Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop View - Refined Row Design */}
                <div className="hidden md:block bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Titular / Protocolo</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Produto</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Vencimento</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                            {filteredCertificates.map((cert: any) => {
                                const currentStatus = (cert.supplier_status === "Aprovado" && cert.status === "Pago") ? "Aprovado" : cert.status;
                                const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pendente"];
                                const StatusIcon = statusCfg.icon;
                                const expiry = getExpiryInfo(cert.expiry_date);
                                const isPJ = cert.doc?.replace(/\D/g, '').length > 11 || cert.category === 'CNPJ';

                                return (
                                    <tr 
                                        key={cert.id} 
                                        onClick={() => {
                                            setSelectedOrder(cert);
                                            setIsDetailsOpen(true);
                                        }}
                                        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center font-bold text-sm text-white",
                                                    isPJ ? "bg-indigo-600" : "bg-primary"
                                                )}>
                                                    {isPJ ? <Building2 size={18} /> : <User size={18} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase leading-none mb-1">{cert.holder}</p>
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-tighter">{cert.protocol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{cert.product}</p>
                                            <p className="text-[10px] text-slate-500">{cert.doc}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm",
                                                statusCfg.className
                                            )}>
                                                <StatusIcon size={12} />
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {expiry ? (
                                                <div className="flex flex-col">
                                                    <p className={cn(
                                                        "text-sm font-bold",
                                                        expiry.days < 30 ? "text-rose-600" : "text-slate-700 dark:text-slate-300"
                                                    )}>
                                                        {expiry.dateFormatted}
                                                    </p>
                                                    <span className="text-[8px] font-bold uppercase text-slate-400">{expiry.label}</span>
                                                </div>
                                            ) : <span className="text-xs text-slate-400">---</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <ChevronRight size={18} className="inline-block text-slate-300 group-hover:text-primary transition-colors" />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Redesigned Modal Components */}
            <OrderDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                order={selectedOrder}
            />

            <OrderJourneyModal
                isOpen={isJourneyOpen}
                onClose={() => {
                    setIsJourneyOpen(false);
                    setSelectedOrder(null);
                }}
                onSubmit={handleOrderSubmit}
                products={products || []}
                editingOrder={selectedOrder}
            />
        </div>
    );
}
