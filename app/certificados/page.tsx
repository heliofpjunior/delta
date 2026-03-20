"use client";

import {
    Search,
    Filter,
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
    ChevronRight
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
    "Expirado"
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
        const { data, error } = await supabase.from('products').select('*');
        if (error) throw error;
        return data;
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("Todos");
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
        if (statusFilter === "Todos") {
            matchesStatus = matchesArchivedToggle;
        } else if (statusFilter === "Emitido") {
            matchesStatus = cert.supplier_status === "Emitido";
        } else if (statusFilter === "Aprovado") {
            matchesStatus = cert.supplier_status === "Aprovado";
        } else {
            matchesStatus = cert.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

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
        <div className="animate-in fade-in duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden flex flex-col min-h-[85vh]">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/2 blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-0.5">
                    <div className="flex flex-col gap-0">
                        <div className="flex items-center gap-1.5 mb-1">
                            <div className="size-4 rounded bg-primary text-white flex items-center justify-center shadow-sm border border-white/10 shrink-0">
                                <FileText size={10} strokeWidth={2.5} />
                            </div>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none opacity-80">CENTRO DE EMISSÕES</span>
                        </div>
                        <h1 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Certificados</h1>
                        <p className="text-[var(--muted)] font-bold text-xs opacity-70 uppercase tracking-tight leading-none italic border-l border-primary/20 pl-2">Gestão integrada de protocolos e emissões Delta360.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSyncOrders}
                            disabled={isSyncing || isCoolingDown}
                            className={cn(
                                "px-2 h-7 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border shadow-sm",
                                (isSyncing || isCoolingDown)
                                    ? "bg-[var(--card)] text-[var(--muted)] border-[var(--border)] cursor-not-allowed"
                                    : "bg-[var(--background)] text-[var(--foreground)] border-[var(--border)] hover:border-primary/30 hover:bg-primary/5 active:scale-95 group"
                            )}
                        >
                            <RefreshCw size={10} strokeWidth={2.5} className={cn(isSyncing && "animate-spin", !isSyncing && "text-primary/60")} />
                            {isSyncing ? "..." : isCoolingDown ? `${secondsRemaining}S` : "SYNC"}
                        </button>
                        <button
                            onClick={() => setIsJourneyOpen(true)}
                            className="bg-primary text-white px-3 h-7 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all border border-white/10"
                        >
                            <Plus size={11} strokeWidth={2.5} /> NOVA EMISSÃO
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Bar (Search & Filter Toggles) */}
            <div className="p-2 border-b border-[var(--border)] bg-[var(--background)]/10 relative z-10 px-3.5 flex flex-col md:flex-row gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-colors opacity-30 group-focus-within:opacity-100" size={10} strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="BUSCAR POR TITULAR, DOCUMENTO OU PROTOCOLO..."
                        className="w-full pl-8 pr-4 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[10px] focus:outline-none focus:border-primary/50 placeholder:text-[var(--muted)]/40 font-bold uppercase tracking-tight h-7 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={cn(
                            "px-2.5 h-7 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-1.5 shadow-sm",
                            isFiltersOpen
                                ? "bg-primary text-white border-primary"
                                : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-primary/20 hover:text-primary"
                        )}
                    >
                        <Filter size={10} strokeWidth={2.5} /> FILTROS
                    </button>

                    <button
                        onClick={() => setShowArchived(!showArchived)}
                        className={cn(
                            "px-2.5 h-7 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all flex items-center gap-1.5 shadow-sm",
                            showArchived
                                ? "bg-amber-500 text-white border-amber-600"
                                : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-amber-500/20 hover:text-amber-600"
                        )}
                    >
                        <Archive size={10} strokeWidth={2.5} /> ARQUIVADOS
                    </button>
                </div>
            </div>

            {/* Filter Tray Expansion */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out bg-[var(--background)]/10 border-b border-[var(--border)] relative z-10",
                isFiltersOpen ? "max-h-20 opacity-100 py-2.5" : "max-h-0 opacity-0"
            )}>
                <div className="px-3.5 flex flex-wrap gap-1.5">
                    {STATUSES.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest transition-all border",
                                statusFilter === status
                                    ? "bg-primary text-white border-primary shadow-sm"
                                    : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)] hover:border-primary/30 hover:text-primary"
                            )}
                        >
                            {status === "Emitido" ? "Finalizados" : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main List Content */}
            <div className="flex-1 overflow-y-auto p-3.5 relative z-10 custom-scrollbar flex flex-col gap-3">
                {/* Statistics Bar */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--background)]/20 border border-[var(--border)] rounded-lg shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="size-1 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] opacity-60">
                            {filteredCertificates.length} REGISTROS ENCONTRADOS
                        </span>
                    </div>
                    <button className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:opacity-80 transition-all">
                        <ArrowUpDown size={8} strokeWidth={2.5} /> ORDENAR
                    </button>
                </div>

                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden divide-y divide-[var(--border)]">
                    {!certificates && !error ? (
                        <div className="py-40 flex flex-col items-center justify-center gap-4">
                            <div className="size-16 border-[6px] border-primary/10 border-t-primary rounded-full animate-spin shadow-inner" />
                            <p className="text-primary font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Sincronizando Base Delta360...</p>
                        </div>
                    ) : filteredCertificates.length === 0 ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center px-6 relative">
                            <div className="size-12 rounded-xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] mb-3 shadow-inner">
                                <Search size={20} strokeWidth={2} className="opacity-10" />
                            </div>
                            <h3 className="text-sm font-bold mb-1 uppercase tracking-tight text-[var(--foreground)]">Nenhum Pedido</h3>
                            <p className="text-[var(--muted)] text-[10px] max-w-[200px] font-bold uppercase tracking-widest opacity-40 italic leading-tight">Revise os filtros aplicados.</p>
                        </div>
                    ) : (
                        filteredCertificates.map((cert: any) => {
                            const currentStatus = (cert.supplier_status === "Aprovado" && cert.status === "Pago") ? "Aprovado" : cert.status;
                            const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["Pendente"];
                            const StatusIcon = statusCfg.icon;
                            const expiry = getExpiryInfo(cert.expiry_date);

                            return (
                                <div
                                    key={cert.id}
                                    onClick={() => {
                                        setSelectedOrder(cert);
                                        setIsDetailsOpen(true);
                                    }}
                                    className="group relative flex flex-col lg:flex-row lg:items-center gap-3 px-3.5 py-2.5 hover:bg-primary/[0.01] transition-all cursor-pointer border-l-2 border-l-transparent hover:border-l-primary"
                                >
                                    <div className="flex-1 flex items-center gap-3 min-w-0">
                                        <div className={cn(
                                            "size-8 rounded-lg flex items-center justify-center shrink-0 border border-[var(--border)] shadow-sm group-hover:scale-105 transition-all bg-[var(--background)]",
                                            (cert.doc?.replace(/\D/g, '').length > 11 || cert.category === 'CNPJ')
                                                ? "text-indigo-600 border-indigo-500/10"
                                                : "text-primary border-primary/10"
                                        )}>
                                            <User size={14} strokeWidth={2.5} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-tight truncate group-hover:text-primary transition-colors leading-none">
                                                    {cert.holder}
                                                </h4>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={cn(
                                                        "px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                        (cert.doc?.replace(/\D/g, '').length > 11 || cert.category === 'CNPJ')
                                                            ? "bg-indigo-600 text-white border-white/10"
                                                            : "bg-slate-700 text-white border-white/10"
                                                    )}>
                                                        {(cert.doc?.replace(/\D/g, '').length > 11 || cert.category === 'CNPJ') ? "PJ" : "PF"}
                                                    </span>
                                                    {cert.final_price && (
                                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 shadow-sm leading-none">
                                                            R$ {Number(cert.final_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-black uppercase tracking-widest opacity-60">
                                                <span className="bg-[var(--background)] px-1.5 py-0.5 rounded border border-[var(--border)]">{cert.doc}</span>
                                                <div className="size-0.5 bg-primary/30 rounded-full" />
                                                <span className="text-primary/80 truncate max-w-[150px]">{cert.product}</span>
                                                <div className="size-0.5 bg-primary/30 rounded-full" />
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded border border-[var(--border)]">{cert.protocol}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 lg:shrink-0 justify-between lg:justify-end">
                                        <div className="space-y-1.5 lg:text-right min-w-[120px]">
                                            <div className="flex items-center lg:justify-end gap-2 text-[10px] font-bold text-[var(--foreground)] uppercase tracking-widest bg-[var(--background)] px-2.5 py-1 rounded-lg border border-[var(--border)] shadow-sm">
                                                <Calendar size={11} strokeWidth={2.5} className="text-primary/60" />
                                                {cert.date}
                                            </div>
                                            {expiry && (
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                                    expiry.days < 30 ? "bg-rose-600 text-white border-white/20" : "bg-emerald-600 text-white border-white/20"
                                                )}>
                                                    <Clock size={10} strokeWidth={2.5} />
                                                    {expiry.label}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1 items-center lg:items-end">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm min-w-[110px] justify-center transition-all",
                                                statusCfg.className.includes("emerald") || statusCfg.className.includes("primary") ? "bg-emerald-600 text-white border-white/10" :
                                                    statusCfg.className.includes("amber") || statusCfg.className.includes("orange") ? "bg-amber-500 text-white border-white/10" :
                                                        statusCfg.className.includes("rose") || statusCfg.className.includes("red") ? "bg-rose-600 text-white border-white/10" :
                                                            "bg-slate-700 text-white border-white/10"
                                            )}>
                                                <StatusIcon size={10} strokeWidth={2.5} />
                                                {statusCfg.label}
                                            </span>
                                            {cert.supplier_status && (cert.supplier_status !== cert.status || cert.supplier_status === "Emitido") && (
                                                <span className="text-center text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse leading-none italic opacity-80">
                                                    MOTOR: {cert.supplier_status}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-1.5 lg:ml-2">
                                            {cert.status === "Rascunho" && (
                                                <>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleResumeDraft(cert); }}
                                                        className="size-7 rounded-lg flex items-center justify-center text-primary bg-primary/5 hover:bg-primary hover:text-white border border-primary/20 hover:border-primary transition-all shadow-sm active:scale-90"
                                                        title="FINALIZAR"
                                                    >
                                                        <FileEdit size={12} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDeleteDraft(e, cert.id, cert.protocol)}
                                                        className="size-7 rounded-lg flex items-center justify-center text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border border-rose-500/20 hover:border-rose-500 transition-all shadow-sm active:scale-90"
                                                        title="EXCLUIR"
                                                    >
                                                        <Trash2 size={12} strokeWidth={2.5} />
                                                    </button>
                                                </>
                                            )}
                                            <div className="size-7 bg-[var(--background)] flex items-center justify-center rounded-lg border border-[var(--border)] group-hover:bg-primary group-hover:text-white transition-all active:scale-95 shadow-sm">
                                                <ChevronRight size={14} strokeWidth={2.5} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Bar - Integrated */}
                <div className="px-4 py-3 bg-[var(--background)]/20 border border-[var(--border)] rounded-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-60 italic">CONTROLE DE PAGINAÇÃO</p>
                        <p className="text-xs text-[var(--foreground)] font-black uppercase tracking-tight">
                            {filteredCertificates.length} <span className="opacity-40">DE</span> {certificates?.length || 0} CERTIFICADOS
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--muted)] disabled:opacity-30 hover:bg-[var(--background)] transition-all shadow-sm" disabled>
                            ANTERIOR
                        </button>
                        <button className="px-3.5 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-md active:scale-95">
                            PRÓXIMA PÁGINA
                        </button>
                    </div>
                </div>
            </div>

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
