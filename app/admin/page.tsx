"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    LayoutDashboard,
    BarChart,
    ShieldCheck,
    Users,
    Package,
    ShoppingBag,
    DollarSign,
    Target,
    Search,
    Plus,
    MoreHorizontal,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Shield,
    Award,
    Link as LinkIcon,
    Copy,
    Check,
    Zap,
    Flame,
    Briefcase,
    Mail,
    FileText,
    ChevronRight,
    ArrowUpDown,
    Building2,
    Factory,
    Truck,
    TrendingUp,
    Fingerprint,
    ArrowRight,
    ExternalLink,
    Database,
    Key,
    Eye,
    EyeOff,
    Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/fetcher";
import axios from "axios";
import Modal from "@/components/Modal";
import Input from "@/components/ui/Input";
import ProductModal from "@/components/ProductModal";
import SupplierTableModal from "@/components/SupplierTableModal";
import SupplierProductModal from "@/components/SupplierProductModal";
import { useSimulation } from "@/components/SimulationProvider";

export default function AdminDashboard() {
    return (
        <Suspense fallback={<div className="p-12 text-center font-black text-on-surface-variant/40 animate-pulse">Carregando Painel Administrativo...</div>}>
            <AdminDashboardContent />
        </Suspense>
    );
}

function AdminDashboardContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { hasPermission, currentUser } = useSimulation();
    const tabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(tabParam || "overview");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Financial Audit State
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [withdrawalDetails, setWithdrawalDetails] = useState<any>(null);
    const [auditProofUrl, setAuditProofUrl] = useState("");
    const [auditObservations, setAuditObservations] = useState("");
    const [isAuditSubmitting, setIsAuditSubmitting] = useState(false);
    const [isUploadingProof, setIsUploadingProof] = useState(false);
    const [auditItemStates, setAuditItemStates] = useState<Record<string, 'Aprovado' | 'Recusado' | 'Processando'>>({});
    const [mounted, setMounted] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteName, setInviteName] = useState("");
    const [isSendingInvite, setIsSendingInvite] = useState(false);
    const [inviteSuccess, setInviteSuccess] = useState("");
    const [inviteError, setInviteError] = useState("");

    // Product CRUD State
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [isProductBusy, setIsProductBusy] = useState(false);

    // Supplier CRUD State
    const [isSTableModalOpen, setIsSTableModalOpen] = useState(false);
    const [editingSTable, setEditingSTable] = useState<any>(null);
    const [isSProductModalOpen, setIsSProductModalOpen] = useState(false);
    const [editingSProduct, setEditingSProduct] = useState<any>(null);

    // CertControl API Settings State
    const [certcontrolToken, setCertcontrolToken] = useState("");
    const [certcontrolApiUrl, setCertcontrolApiUrl] = useState("");
    const [showToken, setShowToken] = useState(false);
    const [isSavingToken, setIsSavingToken] = useState(false);
    const [tokenSaved, setTokenSaved] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (tabParam) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    // Data Fetching
    const { data: users, mutate: mutateUsers, error: usersError } = useSWR("admin_users_list", async () => {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: products, mutate: mutateProducts } = useSWR("admin_products_list", async () => {
        const { data, error } = await supabase.from('products').select('*').order('name');
        if (error) throw error;
        return data;
    });

    const { data: sales } = useSWR("admin_sales_list", async () => {
        const { data, error } = await supabase.from('orders').select('*, profiles(full_name)').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: financials, mutate: mutateFinancials } = useSWR("admin_financials", async () => {
        const res = await axios.get("/api/admin/financials");
        return res.data;
    });

    const { data: goals } = useSWR("admin_goals", async () => {
        const { data, error } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: supplierTables, mutate: mutateSupplierTables } = useSWR("admin_supplier_tables", async () => {
        const { data, error } = await supabase.from('supplier_tables').select('*').order('name');
        if (error) throw error;
        return data;
    });

    const { data: supplierProducts, mutate: mutateSupplierProducts } = useSWR("admin_supplier_products", async () => {
        const { data, error } = await supabase.from('supplier_products').select('*, supplier_tables(name)').order('name');
        if (error) throw error;
        return data;
    });

    // Fetch CertControl API Settings from system_settings
    useSWR("certcontrol_settings", async () => {
        const { data } = await supabase
            .from('system_settings')
            .select('key, value')
            .in('key', ['certcontrol_api_token', 'certcontrol_api_url']);
        if (data) {
            const map = Object.fromEntries(data.map((s: any) => [s.key, s.value]));
            if (map['certcontrol_api_token']) setCertcontrolToken(map['certcontrol_api_token']);
            if (map['certcontrol_api_url']) setCertcontrolApiUrl(map['certcontrol_api_url']);
        }
        return data;
    });

    // Custom Supabase Fetcher for Invites 
    const { data: invites, mutate: mutateInvites } = useSWR("allowed_emails_list", async () => {
        const { data, error } = await supabase
            .from('allowed_emails')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) return { error: error.message };
        return data;
    });

    const tabs = [
        { id: "overview", label: "Painel", icon: LayoutDashboard },
        { id: "usuarios", label: "Usuários", icon: Users, perm: 'admin_users' },
        { id: "convites", label: "Convites", icon: Mail, perm: 'admin_invites' },
        { id: "produtos", label: "Produtos", icon: Package, perm: 'admin_products' },
        { id: "vendas", label: "Vendas", icon: ShoppingBag, perm: 'admin_sales' },
        { id: "fornecedores", label: "Fornecedores", icon: Building2, perm: 'admin_suppliers' },
        { id: "financeiro", label: "Financeiro", icon: DollarSign, perm: 'admin_financials' },
        { id: "metas", label: "Metas & Selos", icon: Target, perm: 'admin_gamification' },
    ].filter(tab => !tab.perm || hasPermission(tab.perm));

    const PERMISSIONS_LIST = [
        { key: 'access_dashboard', label: 'Dashboard Principal', category: 'Menu Principal' },
        { key: 'access_certificates', label: 'Certificados', category: 'Menu Principal' },
        { key: 'access_store', label: 'Links de Venda', category: 'Menu Principal' },
        { key: 'access_marketing', label: 'Marketing/Campanhas', category: 'Menu Principal' },
        { key: 'access_customers', label: 'Gestão de Clientes', category: 'Menu Principal' },
        { key: 'access_financial', label: 'Financeiro (Usuário)', category: 'Menu Principal' },
        { key: 'access_reports', label: 'Relatórios de Venda', category: 'Menu Principal' },
        { key: 'access_settings', label: 'Configurações de Perfil', category: 'Menu Principal' },
        { key: 'admin_users', label: 'Gestão de Usuários', category: 'Administração' },
        { key: 'admin_invites', label: 'Gestão de Convites', category: 'Administração' },
        { key: 'admin_products', label: 'Catálogo de Produtos', category: 'Administração' },
        { key: 'admin_sales', label: 'Visão Geral de Vendas', category: 'Administração' },
        { key: 'admin_financials', label: 'Auditoria de Financeiro', category: 'Administração' },
        { key: 'admin_gamification', label: 'Metas e Recompensas', category: 'Administração' },
        { key: 'admin_suppliers', label: 'Gestão de Fornecedores', category: 'Administração' },
    ];

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploadingProof(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedWithdrawal?.id || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `proofs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('financial_proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('financial_proofs')
                .getPublicUrl(filePath);

            setAuditProofUrl(publicUrl);
        } catch (error: any) {
            console.error("Erro no upload:", error);
            alert("Falha ao subir comprovante: " + error.message);
        } finally {
            setIsUploadingProof(false);
        }
    };

    const renderOverview = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[80px] pointer-events-none animate-pulse" />
            <div className="absolute -bottom-20 -left-20 w-[200px] h-[200px] bg-indigo-500/5 blur-[60px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col gap-1 px-1">
                    <div className="flex items-center gap-1.5">
                        <div className="size-5 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                            <BarChart size={12} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5">OPERATIONAL CORE</span>
                            <div className="flex items-center gap-1">
                                <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/80">SISTEMA ATIVO</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Central de Comando</h2>
                        <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-none max-w-lg border-l-2 border-primary/20 pl-2 italic">Métricas de rede e performance integrada Delta360.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar">
                {/* Vendas do Mês */}
                <div className="bg-[var(--card)] p-3.5 rounded-xl shadow-sm border border-[var(--border)] flex flex-col gap-2.5 lg:col-span-1 transform transition-all hover:border-primary/20 group relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="size-7 rounded-lg bg-primary text-white flex items-center justify-center border border-white/20 shadow-sm group-hover:scale-105 transition-transform duration-500">
                            <TrendingUp size={14} strokeWidth={2.5} />
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
                            <Plus size={8} strokeWidth={3} /> 13.3%
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-widest mb-0.5 opacity-60">RECEITA BRUTA (MES)</p>
                        <p className="text-lg font-bold tracking-tight text-[var(--foreground)] leading-none">R$ 2.300</p>
                    </div>
                    <div className="h-10 w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-lg flex items-end gap-1 p-1 overflow-hidden shadow-inner">
                        {[40, 70, 45, 90, 65, 80, 50, 85, 60, 95].map((h, i) => (
                            <div key={i} className="flex-1 bg-primary/20 rounded-t-sm hover:bg-primary/50 transition-all cursor-help" style={{ height: `${h}%` }} />
                        ))}
                    </div>
                </div>

                {/* Sua Wallet */}
                <div className="bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-800 flex flex-col gap-2 lg:col-span-1 transform transition-all hover:border-amber-500/30 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[40px] pointer-events-none" />
                    <div className="flex justify-between items-start relative z-10">
                        <div className="size-6 rounded-md bg-amber-500 text-white flex items-center justify-center border border-white/10 shadow-sm transition-all animate-in zoom-in-75">
                            <DollarSign size={12} strokeWidth={2.5} />
                        </div>
                        <div className="bg-white/5 backdrop-blur-md text-[8px] font-bold px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-widest text-white/80">
                            DISPONÍVEL
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest mb-0.5">SALDO ADMIN</p>
                        <p className="text-base font-bold tracking-tight text-white leading-none">R$ 7.100</p>
                    </div>
                    <button className="w-full bg-white text-slate-900 h-7 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all shadow-sm border border-transparent relative z-10 active:scale-95">
                        Resgate Master
                    </button>
                </div>

                {/* Atividade Recente */}
                <div className="lg:col-span-2 bg-[var(--card)] p-3.5 rounded-xl shadow-sm border border-[var(--border)] flex flex-col gap-3.5 relative overflow-hidden backdrop-blur-xl group">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[60px] pointer-events-none group-hover:bg-indigo-500/10 transition-all duration-1000" />
                    <div className="flex justify-between items-center px-0.5 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="size-6 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20 shadow-sm group-hover:scale-105 transition-transform">
                                <Clock size={12} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest leading-none mb-0.5">LOG DE EVENTOS</h3>
                                <p className="text-[8px] font-bold text-[var(--muted)] opacity-60 uppercase tracking-widest">Últimas 24 horas</p>
                            </div>
                        </div>
                        <button className="px-2 h-6 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[8px] font-bold text-primary hover:bg-primary hover:text-white transition-all uppercase tracking-widest shadow-sm">Audit Trail</button>
                    </div>
                    <div className="space-y-1 relative z-10">
                        {[
                            { type: 'CERT', msg: 'Novo Certificado E-CPF A3 emitido', user: 'Consultor Alfa', time: '14:35', color: 'primary' },
                            { type: 'FIN', msg: 'Solicitação de saque liquidada', user: 'Financeiro', time: '12:10', color: 'emerald' }
                        ].map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-[var(--background)]/80 rounded-lg border border-[var(--border)] group/item hover:border-primary/30 transition-all cursor-pointer shadow-sm active:scale-[0.99]">
                                <div className="flex items-center gap-2.5">
                                    <div className={cn(
                                        "size-7 rounded-lg flex items-center justify-center border shadow-inner group-item-hover:scale-105 transition-all text-white",
                                        log.color === 'primary' ? "bg-primary border-white/10" : "bg-emerald-500 border-white/10"
                                    )}>
                                        {log.type === 'CERT' ? <FileText size={12} strokeWidth={2.5} /> : <CheckCircle2 size={12} strokeWidth={2.5} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-[var(--foreground)] tracking-tight uppercase leading-none mb-0.5">{log.msg}</p>
                                        <p className="text-[8px] text-[var(--muted)] font-bold uppercase tracking-widest opacity-80 flex items-center gap-1.5 leading-none">
                                            <span className="text-indigo-500">{log.user}</span> • {log.time}
                                        </p>
                                    </div>
                                </div>
                                <div className="size-5 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-item-hover:text-primary group-item-hover:border-primary transition-all">
                                    <ChevronRight size={10} strokeWidth={3} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );


    const filteredUsers = Array.isArray(users) ? users.filter((u: any) =>
        (u.full_name || "")?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "")?.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    const pendingInvites = Array.isArray(invites) ? invites.filter((i: any) => {
        const userEmails = Array.isArray(users) ? users.map((u: any) => u.email?.toLowerCase()) : [];
        const isRegistered = userEmails.includes(i.email?.toLowerCase());
        const matchesSearch = i.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return !isRegistered && matchesSearch;
    }) : [];

    const renderUsers = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[70vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/[0.01] blur-[100px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20 shadow-sm">
                                <Users size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-600 opacity-80 leading-none mb-0.5">NETWORK MANAGEMENT</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[8px] font-semibold uppercase tracking-widest text-indigo-600/80">GESTÃO DE PRIVILÉGIOS</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Rede de Parceiros</h2>
                            <p className="text-[var(--muted)] font-semibold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-indigo-500/20 pl-2 italic">Controle de acessos e níveis de comissionamento.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white dark:bg-white/5 p-1.5 px-2.5 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-2 group transition-all min-w-[80px]">
                            <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">TOTAL</span>
                            <span className="text-base font-bold text-[var(--foreground)] tracking-tight leading-none">{filteredUsers.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search & Actions Bar - Tightened */}
            <div className="p-2 border-b border-[var(--border)] flex flex-col xl:flex-row xl:items-center justify-between gap-2 bg-[var(--background)]/10 relative z-10 px-3.5">
                <div className="relative flex-1 max-w-lg group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-primary transition-all" size={12} strokeWidth={2.5} />
                    <input
                        type="text"
                        placeholder="BUSCAR PARCEIRO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 h-7 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[10px] font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-[var(--muted)]/40 text-[var(--foreground)] uppercase tracking-tight"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                    {hasPermission('manage_invites') && (
                        <>
                            <button
                                onClick={() => {
                                    if (!mounted) return;
                                    const link = `${window.location.origin}/auth?mode=register`;
                                    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
                                }}
                                className="flex items-center gap-1.5 px-2.5 h-7 bg-[var(--background)] text-[var(--muted)] rounded-lg text-[8px] font-bold uppercase tracking-widest border border-[var(--border)] hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95 group"
                            >
                                {copied ? <CheckCircle2 size={12} strokeWidth={3} className="text-emerald-500" /> : <LinkIcon size={12} strokeWidth={2.5} />}
                                URL COPIADA
                            </button>
                            <button
                                onClick={() => setIsInviteModalOpen(true)}
                                className="bg-primary text-white px-3 h-7 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                            >
                                <Mail size={12} strokeWidth={2.5} /> NOVO CONVITE
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter Hub - High Compact */}
            <div className="px-3.5 py-1.5 border-b border-[var(--border)] bg-[var(--background)]/20 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <div className="size-1 rounded-full bg-emerald-500 shadow-sm" />
                        <span className="text-[8px] font-bold text-[var(--foreground)] uppercase tracking-widest opacity-80">{filteredUsers.length} PARCEIROS</span>
                    </div>
                    <div className="w-[1px] h-2.5 bg-[var(--border)] opacity-30" />
                    <div className="flex items-center gap-1.5">
                        <div className="size-1 rounded-full bg-amber-500 shadow-sm animate-pulse" />
                        <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest opacity-80">{pendingInvites.length} CONVITES</span>
                    </div>
                </div>
                <button className="flex items-center gap-1 text-[8px] font-bold text-primary opacity-80 hover:opacity-100 uppercase tracking-widest transition-all">
                    <ArrowUpDown size={10} strokeWidth={2} /> FILTRAR
                </button>
            </div>

            {/* Users List Area */}
            <div className="divide-y divide-[var(--border)] bg-[var(--card)]">
                {filteredUsers.length === 0 && (
                    <div className="px-6 py-12 text-center text-[var(--muted)] opacity-60">
                        <p className="text-[10px] font-bold uppercase tracking-widest italic">Nenhum registro encontrado.</p>
                    </div>
                )}
                {filteredUsers?.map((user: any) => {
                    const userInvite = Array.isArray(invites) ? invites.find((inv: any) => inv.email?.toLowerCase() === user.email?.toLowerCase()) : null;
                    return (
                        <div
                            key={user.id}
                            onClick={() => setSelectedUser(user)}
                            className="flex flex-col lg:flex-row lg:items-center gap-4 px-5 py-3 hover:bg-primary/[0.02] transition-all group cursor-pointer border-l-4 border-l-transparent hover:border-l-primary relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-full bg-primary/[0.01] blur-2xl pointer-events-none group-hover:bg-primary/[0.03] transition-all" />
                            
                            <div className="size-11 rounded-2xl bg-[var(--background)] text-[var(--muted)] group-hover:bg-primary group-hover:text-white flex items-center justify-center font-black text-lg shrink-0 transition-all duration-500 border-2 border-[var(--border)] group-hover:border-primary/20 shadow-sm group-hover:shadow-primary/20 group-hover:rotate-3">
                                {(user.full_name || '?').charAt(0).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex flex-wrap items-center gap-3 mb-1.5">
                                    <span className="text-base font-black text-[var(--foreground)] truncate tracking-tighter uppercase group-hover:text-primary transition-colors duration-300">
                                        {user.full_name}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase text-indigo-600 rounded-lg tracking-wider shadow-sm">
                                            {user.role === 'admin' ? 'DIRETOR MASTER' : user.role === 'moderador' ? 'GERENTE REGIONAL' : user.role === 'financeiro' ? 'AUDITOR FISCAL' : 'CONSULTOR PREMIUM'}
                                        </span>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0 inline-flex items-center gap-1.5 transition-all shadow-sm",
                                            user.level === 'Ouro'
                                                ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/20"
                                                : user.level === 'Prata'
                                                    ? "bg-slate-500 text-white border-slate-600 shadow-slate-500/20"
                                                    : "bg-indigo-600 text-white border-indigo-700 shadow-indigo-600/20"
                                        )}>
                                            <Award size={10} strokeWidth={3} /> ELO {user.level || 'BRONZE'}
                                        </span>
                                        {user.status === 'Inativo' && (
                                            <span className="px-2 py-0.5 bg-rose-500 text-white border border-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">BLOQUEADO</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                                        <div className="size-4 rounded-md bg-primary/5 flex items-center justify-center text-primary/60">
                                            <Mail size={10} strokeWidth={2.5} />
                                        </div>
                                        <span className="text-[var(--foreground)] truncate max-w-[200px] lowercase tracking-tight">{user.email}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-[var(--border)] hidden lg:block" />
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                                        <div className="size-4 rounded-md bg-indigo-500/5 flex items-center justify-center text-indigo-500/60">
                                            <Building2 size={10} strokeWidth={2.5} />
                                        </div>
                                        <span className="uppercase tracking-tighter">{user.address_city && user.address_state ? `${user.address_city}/${user.address_state}` : 'LOCALIZAÇÃO NÃO DEFINIDA'}</span>
                                    </div>
                                    <div className="w-[1px] h-3 bg-[var(--border)] hidden lg:block" />
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                                        <div className="size-4 rounded-md bg-emerald-500/5 flex items-center justify-center text-emerald-500/60">
                                            <Shield size={10} strokeWidth={2.5} />
                                        </div>
                                        <span className="uppercase tracking-tighter">{Object.values(user.permissions || {}).filter(Boolean).length} TELAS ATIVAS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0 relative z-10">
                                <div className="hidden xl:flex flex-col items-end">
                                    <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-50 mb-1">DATA DE INGRESSO</p>
                                    <p className="text-xs font-black text-[var(--foreground)] tracking-tighter">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '---'}
                                    </p>
                                </div>
                                <div className="size-9 rounded-xl text-[var(--muted)] bg-[var(--background)] group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-sm flex items-center justify-center border border-[var(--border)] group-hover:border-primary/20 group-hover:scale-110 active:scale-95 duration-300">
                                    <FileText size={16} strokeWidth={2.5} />
                                </div>
                                <ChevronRight size={18} strokeWidth={3} className="text-[var(--border)] group-hover:text-primary transition-all group-hover:translate-x-1 duration-500" />
                            </div>
                        </div>
                    );
                })}
                {pendingInvites.map((invite: any) => (
                    <div key={invite.email} className="flex items-center gap-3 px-4 py-2.5 bg-amber-500/[0.02] hover:bg-amber-500/[0.04] transition-all group border-l-2 border-l-amber-500/30 relative">
                        <div className="size-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm border border-amber-600/20 group-hover:scale-105 transition-transform duration-500">
                            <Mail size={14} strokeWidth={2} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className="text-base font-bold text-[var(--foreground)] truncate uppercase leading-none">{invite.email?.toLowerCase()}</span>
                                <span className="px-1.5 py-0.5 bg-amber-500 text-white border border-amber-600/20 rounded-lg text-[8px] font-bold uppercase tracking-widest shadow-sm inline-flex items-center gap-1 animate-pulse">
                                    <Clock size={10} strokeWidth={2.5} /> PENDENTE
                                </span>
                            </div>
                            <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">
                                EMITIDO EM {new Date(invite.created_at).toLocaleDateString('pt-BR').toUpperCase()}
                            </p>
                        </div>
                        <button
                            onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm("Deseja realmente revogar esta autorização?")) {
                                    const { error } = await supabase.from('allowed_emails').delete().eq('email', invite.email);
                                    if (error) alert(error.message);
                                    mutateInvites();
                                }
                            }}
                            className="px-3 py-1.5 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-bold text-[8px] uppercase tracking-widest border border-dashed border-rose-500/30 active:scale-95"
                        >
                            REVOGAR
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInvites = () => {
        const inviteList = Array.isArray(invites) ? invites : [];
        const userEmails = Array.isArray(users) ? users.map((u: any) => u.email?.toLowerCase()) : [];

        return (
            <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
                <div className="absolute top-0 right-0 w-full h-full bg-amber-500/[0.01] blur-[80px] pointer-events-none" />

                {/* Integrated Header */}
                <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                                <div className="size-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-sm">
                                    <Mail size={12} strokeWidth={2.5} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600 opacity-80 leading-none mb-0.5">ACCESS CONTROL</span>
                                    <div className="flex items-center gap-1">
                                        <div className="size-1 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600/80">LISTA BRANCA ATIVA</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Convites & Autorizações</h2>
                                <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-amber-500/20 pl-2 italic">E-mails autorizados que podem realizar o registro.</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <div className="bg-white dark:bg-white/5 p-2 px-3 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-3 group hover:border-amber-500/20 transition-all">
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">TOTAL</span>
                                    <span className="text-lg font-bold text-[var(--foreground)] tracking-tight">{inviteList.length}</span>
                                </div>
                                <div className="w-[1px] h-4 bg-[var(--border)]" />
                                <div className="flex flex-col items-center">
                                    <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">PENDENTES</span>
                                    <span className="text-lg font-bold text-amber-500 tracking-tight">{inviteList.filter((i: any) => !userEmails.includes(i.email?.toLowerCase())).length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
                    <div className="px-3.5 py-1.5 border-b border-[var(--border)] bg-[var(--background)]/10 flex items-center justify-between">
                        <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">{inviteList.length} CONVITES REGISTRADOS</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    if (!mounted) return;
                                    const link = `${window.location.origin}/auth?mode=register`;
                                    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
                                }}
                                className="flex items-center gap-1.5 px-2.5 h-7 bg-[var(--background)] text-[var(--muted)] rounded-lg text-[8px] font-bold uppercase tracking-widest border border-[var(--border)] hover:bg-primary/5 hover:text-primary transition-all shadow-sm active:scale-95 group"
                            >
                                {copied ? <Check size={12} strokeWidth={3} className="text-emerald-500" /> : <Mail size={12} strokeWidth={2} />}
                                {copied ? 'URL REGISTRO' : 'URL DE REGISTRO'}
                            </button>
                        </div>
                    </div>
                    <div className="divide-y divide-[var(--border)] bg-[var(--card)]">
                        {inviteList.length === 0 && (
                            <div className="px-8 py-20 text-center">
                                <div className="size-12 bg-[var(--background)] rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mx-auto mb-3 text-[var(--muted)] opacity-20 shadow-inner">
                                    <Mail size={24} />
                                </div>
                                <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-40 italic">Nenhuma autorização pendente.</p>
                            </div>
                        )}
                        {inviteList.map((invite: any) => {
                            const isRegistered = userEmails.includes(invite.email?.toLowerCase());
                            return (
                                <div key={invite.email} className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-amber-500/[0.01] transition-all group border-l-2 border-l-transparent hover:border-l-amber-500 relative">
                                    <div className="size-7 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm group-hover:scale-105 duration-500">
                                        <Mail size={12} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <span className="text-xs font-bold text-[var(--foreground)] truncate uppercase group-hover:text-amber-600 transition-colors">{invite.email?.toLowerCase()}</span>
                                            {isRegistered ? (
                                                <span className="px-1 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-md text-[5px] font-bold uppercase tracking-widest shadow-sm inline-flex items-center gap-1">
                                                    <CheckCircle2 size={7} strokeWidth={2.5} /> REGISTRADO
                                                </span>
                                            ) : (
                                                <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md text-[6px] font-bold uppercase tracking-widest shadow-sm inline-flex items-center gap-1 animate-pulse">
                                                    <Clock size={8} strokeWidth={2.5} /> PENDENTE
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[5px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-50">
                                            EMITIDO EM {new Date(invite.created_at).toLocaleDateString('pt-BR').toUpperCase()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm("Revogar este convite?")) {
                                                const { error } = await supabase.from('allowed_emails').delete().eq('email', invite.email);
                                                if (error) alert(error.message);
                                                mutateInvites();
                                            }
                                        }}
                                        className="size-10 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-dashed border-rose-500/20 flex items-center justify-center active:scale-95 group/del"
                                        title="Revogar convite"
                                    >
                                        <XCircle size={18} strokeWidth={2.5} className="group-hover/del:rotate-90 transition-transform duration-500" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderProducts = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/[0.01] blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <Package size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5">INVENTORY & PRICING</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/80">CATÁLOGO GLOBAL</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Portfólio de Soluções</h2>
                            <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-primary/20 pl-2 italic">Custos por nível e precificação pública.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                            className="bg-primary text-white px-2.5 h-7 rounded-lg text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all active:scale-95 border border-white/10"
                        >
                            <Plus size={10} strokeWidth={2.5} /> NOVO PRODUTO
                        </button>
                        <div className="bg-white dark:bg-white/5 p-1.5 px-2.5 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-2.5 group hover:border-primary/20 transition-all">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">SKUS</span>
                                <span className="text-lg font-bold text-[var(--foreground)] tracking-tight leading-none">{products?.length || 0}</span>
                            </div>
                            <div className="w-[1px] h-3 bg-[var(--border)]" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">TIPO</span>
                                <span className="text-lg font-bold text-primary tracking-tight leading-none">CERT</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative z-10 flex flex-col">
                <div className="px-3.5 py-1.5 border-b border-[var(--border)] bg-[var(--background)]/10 flex items-center justify-between">
                    <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-80">{products?.length || 0} PRODUTOS ATIVOS</span>
                    <div className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border border-emerald-500/20 shadow-sm flex items-center gap-1">
                        <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                        SINCRONIZADO
                    </div>
                </div>

                <div className="divide-y divide-[var(--border)] bg-[var(--card)]">
                    {products?.length === 0 && (
                        <div className="px-6 py-12 text-center text-[var(--muted)] opacity-60">
                            <p className="text-[10px] font-bold uppercase tracking-widest italic">Nenhum produto cadastrado.</p>
                        </div>
                    )}
                    {products?.map((product: any) => (
                        <div
                            key={product.id}
                            className="flex flex-col lg:flex-row lg:items-center gap-3 px-4 py-2 hover:bg-primary/[0.01] transition-all group border-l-2 border-l-transparent hover:border-l-primary cursor-pointer relative"
                            onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                        >
                            <div className="size-8 rounded-lg flex items-center justify-center shrink-0 transition-all border border-[var(--border)] shadow-sm group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 bg-[var(--background)]/50">
                                {product.category === 'CNPJ' ? <Briefcase size={14} strokeWidth={2} /> : <User size={14} strokeWidth={2} />}
                            </div>

                            <div className="flex-1 min-w-0 relative z-10">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h3 className="text-sm font-bold text-[var(--foreground)] truncate tracking-tight uppercase group-hover:text-primary transition-colors">{product.name}</h3>
                                    <div className="flex items-center gap-1">
                                        <span className="px-1.5 py-0.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[8px] font-bold uppercase rounded tracking-wider shadow-sm">
                                            {product.type}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-[var(--background)] border border-[var(--border)] text-[8px] font-bold uppercase text-[var(--muted)] rounded tracking-wider shadow-sm">
                                            {product.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[var(--muted)]">
                                    <div className="flex items-center gap-1 font-bold text-[8px] uppercase tracking-widest opacity-60">
                                        <Zap size={10} className="text-primary" /> CATÁLOGO DELTA360
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-[var(--border)] opacity-30" />
                                    <div className="flex items-center gap-1 font-bold text-[8px] uppercase tracking-widest opacity-60">
                                        <Fingerprint size={10} className="text-indigo-500" /> STANDARDS
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
                                <div className="flex flex-col items-end bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 shadow-sm min-w-[100px]">
                                    <span className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-80">Preço Público</span>
                                    <span className="text-base font-bold text-[var(--foreground)] tracking-tight leading-none">
                                        {Number(product.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>

                                <div className="flex flex-col items-center bg-[var(--background)] px-2 py-1 rounded-lg border border-[var(--border)] shadow-inner">
                                    <span className="text-[8px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5 opacity-80">Custos por Elo</span>
                                    <div className="flex gap-2.5">
                                        {[
                                            { l: 'BRZ', v: product.commission_bronze, t: 'text-amber-600' },
                                            { l: 'PRT', v: product.commission_prata, t: 'text-slate-500' },
                                            { l: 'ORO', v: product.commission_ouro, t: 'text-amber-400' }
                                        ].map((t, idx) => (
                                            <div key={idx} className="flex flex-col items-center">
                                                <span className={cn("text-[8px] font-bold leading-none mb-0.5 opacity-70", t.t)}>{t.l}</span>
                                                <span className="text-[10px] font-bold text-[var(--foreground)] tracking-tight leading-none">
                                                    R$ {Math.round(Number(t.v) || 0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {hasPermission('manage_products') && (
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setEditingProduct(product); setIsProductModalOpen(true); }}
                                            className="size-7 rounded-md bg-[var(--background)] text-primary hover:bg-primary hover:text-white transition-all border border-[var(--border)] flex items-center justify-center shadow-sm"
                                        >
                                            <FileText size={12} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                            className="size-7 rounded-md bg-[var(--background)] text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-[var(--border)] flex items-center justify-center shadow-sm"
                                        >
                                            <XCircle size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSupplierTab = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/[0.01] blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <Factory size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5">OPERATIONAL BACKBONE</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/80">SISTEMA ATIVO</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Infra & Logística</h2>
                            <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-primary/20 pl-2 italic">Taxas fixas e regras de repasse industrial.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => { setEditingSTable(null); setIsSTableModalOpen(true); }}
                            className="bg-primary text-white px-2.5 h-7 rounded-lg text-[8px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm transition-all active:scale-95 border border-white/10"
                        >
                            <Plus size={10} strokeWidth={2.5} /> NOVA TABELA
                        </button>
                        <div className="bg-white dark:bg-white/5 p-1.5 px-2.5 rounded-lg border border-[var(--border)] shadow-sm flex items-center gap-2.5 group hover:border-primary/20 transition-all">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">TABELAS</span>
                                <span className="text-lg font-bold text-[var(--foreground)] tracking-tight leading-none">{supplierTables?.length || 0}</span>
                            </div>
                            <div className="w-[1px] h-3 bg-[var(--border)]" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">VÍNCULOS</span>
                                <span className="text-lg font-bold text-primary tracking-tight leading-none">{supplierProducts?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 custom-scrollbar">

                {/* Card: Configuração da API CertControl */}
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
                        <div className="size-6 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center border border-indigo-500/20">
                            <Key size={12} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[var(--foreground)]">Configuração da API — CertControl</h3>
                            <p className="text-[8px] text-[var(--muted)] font-medium uppercase tracking-widest opacity-60">Credenciais de integração com a emissora parceira</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20">
                            <div className={cn("size-1.5 rounded-full", certcontrolToken && certcontrolApiUrl ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                            <span className={cn("text-[8px] font-bold uppercase tracking-widest", certcontrolToken && certcontrolApiUrl ? "text-emerald-600" : "text-amber-600")}>
                                {certcontrolToken && certcontrolApiUrl ? "CONFIGURADO" : "PENDENTE"}
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-[var(--border)]">
                        {/* Campo: URL da API */}
                        <div className="p-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">
                                URL Base da API
                            </label>
                            <div className="relative">
                                <ExternalLink size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                                <input
                                    type="url"
                                    value={certcontrolApiUrl}
                                    onChange={(e) => { setCertcontrolApiUrl(e.target.value); setTokenSaved(false); }}
                                    placeholder="https://service.certcontrol.com.br"
                                    className="w-full pl-9 pr-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                            </div>
                        </div>

                        {/* Campo: Token / Chave */}
                        <div className="p-4">
                            <label className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted)] block mb-2">
                                Token de Acesso (Bearer)
                            </label>
                            <div className="relative">
                                <Key size={14} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                                <input
                                    type={showToken ? "text" : "password"}
                                    value={certcontrolToken}
                                    onChange={(e) => { setCertcontrolToken(e.target.value); setTokenSaved(false); }}
                                    placeholder="Cole aqui o JWT de acesso..."
                                    className="w-full pl-9 pr-10 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted)]/50 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowToken(!showToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                                    title={showToken ? "Ocultar token" : "Exibir token"}
                                >
                                    {showToken ? <EyeOff size={14} strokeWidth={2} /> : <Eye size={14} strokeWidth={2} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Botao + Aviso */}
                    <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-[var(--border)] bg-[var(--background)]">
                        <p className="text-[9px] text-[var(--muted)] opacity-60 font-medium">
                            ⚠ Armazenado em <span className="font-mono">system_settings</span>. Não compartilhe publicamente.
                        </p>
                        <button
                            onClick={async () => {
                                if (!certcontrolToken.trim() || !certcontrolApiUrl.trim()) return;
                                setIsSavingToken(true);
                                try {
                                    const { error } = await supabase
                                        .from('system_settings')
                                        .upsert([
                                            { key: 'certcontrol_api_token', value: certcontrolToken.trim() },
                                            { key: 'certcontrol_api_url', value: certcontrolApiUrl.trim() }
                                        ], { onConflict: 'key' });
                                    if (error) throw error;
                                    setTokenSaved(true);
                                    setTimeout(() => setTokenSaved(false), 3000);
                                } catch (err: any) {
                                    alert('Erro ao salvar configurações: ' + err.message);
                                } finally {
                                    setIsSavingToken(false);
                                }
                            }}
                            disabled={isSavingToken || !certcontrolToken.trim() || !certcontrolApiUrl.trim()}
                            className={cn(
                                "shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all active:scale-95 shadow-sm disabled:opacity-50",
                                tokenSaved
                                    ? "bg-emerald-600 text-white"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                            )}
                        >
                            {isSavingToken ? (
                                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : tokenSaved ? (
                                <CheckCircle2 size={14} strokeWidth={2.5} />
                            ) : (
                                <Save size={14} strokeWidth={2.5} />
                            )}
                            {tokenSaved ? "Salvo!" : "Salvar Configurações"}
                        </button>
                    </div>
                </div>
                {/* Section: Supplier Tables Grid */}
                <div>
                    <div className="flex items-center gap-2 mb-3 border-b border-primary/5 pb-2">
                        <div className="size-1 rounded-full bg-primary shadow-sm" />
                        <h3 className="text-[8px] font-bold tracking-tight text-[var(--foreground)] uppercase leading-none opacity-50">Matriz de Custos Base</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {supplierTables?.map((table: any) => (
                            <div
                                key={table.id}
                                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 shadow-sm hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden flex flex-col min-h-[140px]"
                                onClick={() => { setEditingSTable(table); setIsSTableModalOpen(true); }}
                            >
                                <div className="flex justify-between items-start mb-2 relative z-10">
                                    <div className="size-7 rounded-lg bg-slate-900 text-white flex items-center justify-center border border-white/10 shadow-sm">
                                        <ShieldCheck size={12} strokeWidth={2} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest mb-0.5 opacity-60 italic">TAXA %</p>
                                        <p className="text-lg font-bold text-rose-500 tracking-tight leading-none">{table.tax_percent}%</p>
                                    </div>
                                </div>
                                <div className="relative z-10 mb-auto">
                                    <h4 className="text-sm font-bold text-[var(--foreground)] mb-0.5 tracking-tight uppercase leading-none group-hover:text-primary transition-colors">{table.name}</h4>
                                    <div className="flex items-center gap-1.5 text-[var(--muted)] opacity-60 font-bold text-[8px] uppercase tracking-widest">
                                        <div className="size-1 rounded-full bg-emerald-500" />
                                        BACKOFFICE ATIVO
                                    </div>
                                </div>
                                <div className="relative z-10 pt-2">
                                    <div className="flex items-center justify-between p-1.5 bg-[var(--background)] rounded-lg border border-[var(--border)] shadow-inner">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest mb-0.5 opacity-60">TAXA FIXA</span>
                                            <span className="text-xs font-bold text-primary tracking-tight leading-none">
                                                R$ {Number(table.tax_fixed).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                        <div className="size-6 rounded-md bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                                            <DollarSign size={10} strokeWidth={2} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Industrial Catalog */}
                <div>
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end border-b border-indigo-500/5 pb-2 mb-3 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="size-1 rounded-full bg-indigo-500 shadow-sm" />
                            <div className="flex flex-col">
                                <h3 className="text-[10px] font-bold tracking-tight text-[var(--foreground)] uppercase leading-none opacity-60">Originação Industrial</h3>
                            </div>
                        </div>
                        <button
                            onClick={() => { setEditingSProduct(null); setIsSProductModalOpen(true); }}
                            className="bg-indigo-600 text-white px-3 h-7 rounded-lg text-[8px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-white/10 w-fit shrink-0"
                        >
                            <Plus size={10} strokeWidth={2.5} /> VINCULAR PRODUTO
                        </button>
                    </div>

                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
                        <div className="divide-y divide-[var(--border)] bg-[var(--card)]">
                            {supplierProducts?.map((sp: any) => (
                                <div
                                    key={sp.id}
                                    className="flex flex-col lg:flex-row lg:items-center gap-2.5 px-3 py-1.5 hover:bg-indigo-500/[0.01] transition-all group border-l-2 border-l-transparent hover:border-l-indigo-500 cursor-pointer relative overflow-hidden"
                                    onClick={() => { setEditingSProduct(sp); setIsSProductModalOpen(true); }}
                                >
                                    <div className="size-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                                        <Fingerprint size={12} strokeWidth={2} />
                                    </div>

                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-tight group-hover:text-indigo-600 transition-all leading-none">{sp.name}</h4>
                                            <span className="text-[8px] font-bold uppercase bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-1.5 py-0.5 rounded border border-white/10 tracking-widest shadow-sm shrink-0 leading-none">
                                                ID: {sp.external_id || '---'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 font-bold text-[8px] text-indigo-600 uppercase tracking-widest opacity-80">
                                                <div className="size-1 rounded-full bg-indigo-500 animate-pulse" />
                                                MATRIZ: <span className="underline underline-offset-2">{sp.supplier_tables?.name || 'GENÉRICA'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 relative z-10 shrink-0">
                                        <div className="flex flex-col items-end px-1.5 py-0.5 bg-indigo-500/5 rounded-lg border border-indigo-500/10 shadow-sm min-w-[90px]">
                                            <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest mb-0.5 opacity-60">Custo Industrial</span>
                                            <span className="text-sm font-bold text-[var(--foreground)] tracking-tight leading-none">
                                                R$ {Number(sp.base_cost).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                        <div className="size-6 rounded-md bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] group-hover:text-indigo-600 group-hover:border-indigo-500/30 transition-all active:scale-95">
                                            <ArrowRight size={12} strokeWidth={2} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderSales = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-emerald-500/[0.01] blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-sm">
                                <ShoppingBag size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600 opacity-80 leading-none mb-0.5">LIVE STREAM</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-600/80">MONITOR ATIVO</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Fluxo de Emissões</h2>
                            <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-emerald-500/20 pl-2 italic">Liquidez e volume de vendas em tempo real.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white dark:bg-white/5 p-1.5 px-2.5 rounded-lg border border-emerald-500/10 shadow-sm flex flex-col items-center justify-center min-w-[100px] group transition-all">
                            <span className="text-[6px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5 opacity-40">BRUTO HOJE</span>
                            <span className="text-lg font-bold text-emerald-600 tracking-tight leading-none">R$ 12.850,00</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar relative z-10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-[var(--background)]/50 border-b border-[var(--border)] uppercase">
                            <th className="px-4 py-2 text-[10px] font-bold text-[var(--muted)] tracking-widest">Titular / Documentação</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-[var(--muted)] tracking-widest">Produto / Categoria</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-[var(--muted)] tracking-widest">Vendedor / Origem</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-[var(--muted)] tracking-widest">Status</th>
                            <th className="px-4 py-2 text-[10px] font-bold text-[var(--muted)] tracking-widest text-right">Valor Final</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {sales?.map((sale: any) => (
                            <tr key={sale.id} className="hover:bg-primary/[0.01] transition-all group/row cursor-default">
                                <td className="px-3 py-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold border border-white/10 shrink-0">
                                            {sale.holder?.charAt(0) || 'C'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-[var(--foreground)] tracking-tight leading-none mb-0.5 uppercase group-hover/row:text-primary transition-colors">{sale.holder}</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-60">#{sale.id?.substring(0, 8)}</span>
                                                <div className="size-1 rounded-full bg-[var(--border)]" />
                                                <span className="text-[8px] font-bold text-primary uppercase tracking-widest opacity-80">CONFERIDO</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5">
                                    <div className="px-1.5 py-0.5 bg-indigo-500/5 rounded border border-indigo-500/10 transition-all font-bold uppercase tracking-widest w-fit shadow-sm">
                                        <span className="text-indigo-600 text-[8px] leading-tight block">{sale.product}</span>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <div className="size-6 rounded bg-primary/10 text-primary flex items-center justify-center text-[8px] font-bold border border-primary/10 shadow-sm">
                                            {sale.seller?.charAt(0) || 'D'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-[var(--foreground)] tracking-tight uppercase opacity-80 leading-none">{sale.seller || 'Venda Direta'}</span>
                                            <span className="text-[8px] font-bold text-rose-500 uppercase tracking-widest mt-0.5">MASTER</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-3 py-1.5">
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shadow-sm flex items-center gap-1 w-fit",
                                        sale.status === 'Pago'
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                    )}>
                                        <div className={cn("size-1 rounded-full animate-pulse", sale.status === 'Pago' ? "bg-emerald-500" : "bg-amber-500")} />
                                        {sale.status}
                                    </div>
                                </td>
                                <td className="px-3 py-1.5 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-base font-bold text-[var(--foreground)] tracking-tight leading-none group-hover/row:text-emerald-500 transition-colors">
                                            R$ {sale.price?.toFixed(2).replace('.', ',') || '0,00'}
                                        </span>
                                        <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest">LIQUIDADO</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!sales || sales.length === 0) && (
                    <div className="py-20 text-center bg-slate-500/5 m-4 rounded-2xl border-2 border-dashed border-[var(--border)]">
                        <div className="size-12 bg-[var(--background)] rounded-full border-2 border-dashed border-[var(--border)] flex items-center justify-center mx-auto mb-3 text-[var(--muted)] opacity-20 shadow-inner">
                            <ShoppingBag size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-40 italic">Nenhuma transação registrada.</p>
                    </div>
                )}
            </div>
        </div>
    );


    const handleFinancialAction = async (transactionId: string, action: 'audit' | 'liquidate' | 'refuse', extraData?: any) => {
        try {
            await axios.patch("/api/admin/financials", {
                transactionId,
                action,
                ...extraData
            });
            mutateFinancials();
            setIsWithdrawalModalOpen(false);
            if (action === 'refuse' || action === 'liquidate') {
                mutateUsers();
            }
        } catch (error: any) {
            alert(error.response?.data?.error || "Erro ao processar ação");
        }
    };

    const openWithdrawalDetails = async (withdrawal: any) => {
        setSelectedWithdrawal(withdrawal);
        setWithdrawalDetails(null);
        setAuditProofUrl("");
        setAuditObservations(withdrawal.observations || "");
        setIsWithdrawalModalOpen(true);
        try {
            const res = await axios.get(`/api/admin/financials?id=${withdrawal.id}`);
            setWithdrawalDetails(res.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes:", error);
        }
    };

    const renderFinancial = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/[0.01] blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <DollarSign size={12} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-primary opacity-80 leading-none mb-0.5">TREASURY MANAGEMENT</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-amber-500 animate-pulse" />
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-amber-600/80">FILA DE LIQUIDAÇÃO</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Tesouraria & Repasses</h2>
                            <p className="text-[var(--muted)] font-bold text-[10px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-primary/20 pl-2 italic">Gestão e liquidação dos repasses da rede.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="bg-white dark:bg-white/5 p-1.5 px-2.5 rounded-lg border border-primary/10 shadow-sm flex flex-col items-center justify-center min-w-[100px]">
                            <span className="text-[8px] font-bold text-primary uppercase tracking-widest mb-0.5 opacity-60">EM PROCESSAMENTO</span>
                            <span className="text-lg font-bold text-primary tracking-tight leading-none">
                                R$ {financials?.filter((f: any) => f.status === 'Processando').reduce((acc: any, curr: any) => acc + Math.abs(curr.amount || 0), 0).toLocaleString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10 custom-scrollbar">
                {(financials || []).map((req: any) => (
                    <div
                        key={req.id}
                        onClick={() => openWithdrawalDetails(req)}
                        className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between shadow-sm hover:border-primary/20 transition-all group gap-3.5 cursor-pointer border-l-2"
                        style={{ borderLeftColor: req.status === 'Processando' ? '#f59e0b' : req.status === 'Liquidado' ? 'var(--primary)' : '#ef4444' }}
                    >
                        <div className="flex items-center gap-3 relative z-10">
                            <div className={cn(
                                "size-8 rounded-lg flex items-center justify-center transition-all shadow-sm shrink-0",
                                req.status === 'Processando' ? "bg-amber-500 text-white" :
                                    req.status === 'Liquidado' ? "bg-primary text-white" :
                                        "bg-rose-500 text-white"
                            )}>
                                <DollarSign size={14} strokeWidth={2} />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-bold tracking-tight text-[var(--foreground)] uppercase leading-none mb-1 group-hover:text-primary transition-colors">{req.profiles?.full_name || 'Usuário'}</h3>
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--muted)] opacity-60 uppercase tracking-widest">
                                        <Clock size={10} strokeWidth={2} />
                                        <span>{new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                    <div className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border shadow-sm",
                                        req.status === 'Processando' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                            req.status === 'Liquidado' ? "bg-primary/10 text-primary border-primary/20" :
                                                "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                    )}>
                                        {req.status}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 relative z-10 lg:ml-auto">
                            <div className="text-right">
                                <p className="text-[8px] font-bold text-[var(--muted)] uppercase mb-0.5 tracking-widest opacity-60">SOLICITAÇÃO DE SAQUE</p>
                                <p className="text-lg font-bold text-[var(--foreground)] tracking-tight leading-none group-hover:text-primary transition-colors">
                                    {Math.abs(req.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                            <div className="size-7 bg-[var(--background)] flex items-center justify-center rounded-lg border border-[var(--border)] group-hover:bg-primary group-hover:text-white transition-all active:scale-95">
                                <ChevronRight size={14} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                ))}

                {(!financials || financials.length === 0) && (
                    <div className="py-20 text-center bg-slate-500/5 m-4 rounded-2xl border-2 border-dashed border-[var(--border)]">
                        <div className="size-12 bg-[var(--background)] border border-dashed border-[var(--border)] rounded-full flex items-center justify-center mx-auto mb-3 text-[var(--muted)] opacity-20 shadow-inner">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-widest opacity-40 italic">Ciclo de tesouraria zerado.</p>
                    </div>
                )}
            </div>
        </div>
    );


    const renderGoals = () => (
        <div className="animate-in fade-in slide-in-from-bottom-5 duration-700 bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm relative overflow-hidden min-h-[60vh] flex flex-col">
            <div className="absolute top-0 right-0 w-full h-full bg-primary/[0.01] blur-[80px] pointer-events-none" />

            {/* Integrated Header */}
            <div className="p-3.5 border-b border-[var(--border)] bg-[var(--background)]/30 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <div className="size-5 rounded bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                                <Target size={10} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[5px] font-bold uppercase tracking-widest text-primary opacity-70 leading-none mb-0.5">GAMIFICAÇÃO & ENGAJAMENTO</span>
                                <div className="flex items-center gap-1">
                                    <div className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[5px] font-bold uppercase tracking-widest text-emerald-600/70">SISTEMA XP ATIVO</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-base font-bold tracking-tight text-[var(--foreground)] leading-none uppercase mb-0.5">Metas & Conquistas</h2>
                            <p className="text-[var(--muted)] font-bold text-[7px] opacity-70 uppercase tracking-tight leading-tight max-w-lg border-l-2 border-primary/20 pl-2 italic">Incentivos, selos e progressão de carreira Delta360.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            className="bg-primary text-white px-2.5 h-7 rounded-lg text-[7px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 border border-white/10 shrink-0"
                        >
                            <Plus size={10} strokeWidth={2.5} /> NOVA META
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 relative z-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {goals?.map((goal: any) => (
                        <div
                            key={goal.id}
                            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-3.5 shadow-sm group hover:border-primary/20 transition-all flex flex-col relative overflow-hidden min-h-[160px]"
                        >
                            <div className="flex items-center gap-2.5 mb-3 relative z-10">
                                <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-sm border border-white/10 transition-all duration-300 shrink-0">
                                    {goal.icon === 'Target' ? <Target size={14} strokeWidth={2} /> : goal.icon === 'Zap' ? <Zap size={14} strokeWidth={2} /> : <Flame size={14} strokeWidth={2} />}
                                </div>
                                <div className="flex flex-col gap-0 flex-1">
                                    <h3 className="font-bold text-base tracking-tight leading-none text-[var(--foreground)] uppercase group-hover:text-primary transition-colors">{goal.title}</h3>
                                    <div className="px-1 py-0.5 bg-[var(--background)] text-primary rounded text-[5px] font-bold uppercase tracking-widest inline-block border border-primary/20 w-fit mt-1">{goal.type}</div>
                                </div>
                            </div>

                            <div className="flex-1 relative z-10">
                                <p className="text-[9px] leading-tight text-[var(--foreground)] font-bold mb-3 opacity-40 group-hover:opacity-60 transition-opacity tracking-tight uppercase italic">{goal.description}</p>
                            </div>

                            <div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-2.5 relative z-10">
                                <div className="flex items-center gap-1.5 bg-primary text-white px-2.5 py-0.5 rounded-full font-bold text-[7px] uppercase tracking-widest border border-white/10 shadow-sm">
                                    <Award size={10} strokeWidth={2} /> {goal.rewardXp} XP
                                </div>
                                <button className="size-7 flex items-center justify-center text-[var(--muted)] hover:text-white hover:bg-primary bg-[var(--background)] border border-[var(--border)] rounded-lg transition-all active:scale-95">
                                    <MoreHorizontal size={14} strokeWidth={2.5} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );


    const handleSaveUserAdmin = async (userData: any) => {
        setIsUpdating(true);
        try {
            // Build dynamic permissions object
            const permissions: Record<string, boolean> = {};
            PERMISSIONS_LIST.forEach(p => {
                permissions[p.key] = userData[p.key] === 'on';
            });

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: userData.full_name,
                    phone: userData.phone,
                    doc: userData.doc,
                    company_name: userData.company_name,
                    state_registration: userData.state_registration,
                    pix_key: userData.pix_key,
                    level: userData.level,
                    role: userData.role,
                    status: userData.status,
                    address_zip: userData.address_zip,
                    address_street: userData.address_street,
                    address_neighborhood: userData.address_neighborhood,
                    address_city: userData.address_city,
                    address_state: userData.address_state,
                    permissions: permissions
                })
                .eq('id', selectedUser.id);

            if (error) throw error;

            mutateUsers();
            setSelectedUser(null);
        } catch (error: any) {
            console.error("Erro ao atualizar usuário:", error);
            alert("Erro ao atualizar usuário: " + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    // Product CRUD Handlers
    const handleAddProduct = async (data: any) => {
        setIsProductBusy(true);
        try {
            // Envia commission_bronze também para a coluna antiga por compatibilidade
            const payload = { ...data, commission: data.commission_bronze };
            const { error } = await supabase.from('products').insert([payload]);
            if (error) throw error;
            mutateProducts();
            setIsProductModalOpen(false);
        } catch (error: any) {
            alert("Erro ao criar produto: " + error.message);
        } finally {
            setIsProductBusy(false);
        }
    };

    const handleUpdateProduct = async (data: any) => {
        if (!editingProduct) return;
        setIsProductBusy(true);
        try {
            const payload = { ...data, commission: data.commission_bronze };
            const { error } = await supabase
                .from('products')
                .update(payload)
                .eq('id', editingProduct.id);
            if (error) throw error;
            mutateProducts();
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error: any) {
            alert("Erro ao atualizar produto: " + error.message);
        } finally {
            setIsProductBusy(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        setIsProductBusy(true);
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            mutateProducts();
        } catch (error: any) {
            alert("Erro ao excluir produto: " + error.message);
        } finally {
            setIsProductBusy(false);
        }
    };

    return (
        <div className="space-y-6">



            {activeTab === "overview" && renderOverview()}
            {activeTab === "usuarios" && renderUsers()}
            {activeTab === "convites" && renderInvites()}
            {activeTab === "produtos" && renderProducts()}
            {activeTab === "vendas" && renderSales()}
            {activeTab === "fornecedores" && renderSupplierTab()}
            {activeTab === "financeiro" && renderFinancial()}
            {activeTab === "metas" && renderGoals()}

            {/* FINANCIAL AUDIT MODAL */}
            <Modal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setIsWithdrawalModalOpen(false)}
                title="Auditoria & Liquidação de Saque"
                width="lg"
            >
                {!withdrawalDetails ? (
                    <div className="py-20 text-center animate-pulse text-on-surface-variant/40 font-black uppercase tracking-widest">
                        Carregando detalhes...
                    </div>
                ) : (
                    <div className="space-y-8 pb-4">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border-2 border-slate-200 dark:border-white/10 shadow-lg transition-all hover:bg-slate-100 dark:hover:bg-white/10 group">
                            <div>
                                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Vantagem Operacional / Vendedor</p>
                                <p className="text-xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-1">{withdrawalDetails.profiles?.full_name || 'Desconhecido'}</p>
                                <div className="flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-blue-500" />
                                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{withdrawalDetails.profiles?.doc || 'CPF/CNPJ não disponível'}</p>
                                </div>
                            </div>
                            <div className="md:text-right flex flex-col items-end justify-center">
                                <p className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-2">Chave PIX Autorizada</p>
                                <p className="text-xl font-black tracking-tighter text-blue-600 dark:text-blue-400 font-mono leading-none">{withdrawalDetails.profiles?.pix_key || 'Não informada'}</p>
                            </div>
                        </div>

                        {/* Audit List */}
                        <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 flex items-center gap-2 px-2">
                                <ShieldCheck size={16} className="text-blue-600" /> Auditoria de Pedidos do Lote
                            </h4>
                            <div className="max-h-[350px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                {withdrawalDetails.commissions?.map((item: any) => (
                                    <div key={item.id} className="bg-white dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 p-4 rounded-xl flex items-center justify-between group transition-all hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md active:scale-[0.99]">
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 font-black text-[10px] border border-slate-200 dark:border-white/5 shadow-inner group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                ID
                                            </div>
                                            <div>
                                                <p className="text-base font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none mb-1">{item.description || 'Comissão de Venda'}</p>
                                                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-full border border-emerald-100 dark:border-emerald-500/20">
                                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                                                    + R$ {item.amount.toLocaleString('pt-BR')}
                                                </span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => setAuditItemStates(prev => ({ ...prev, [item.id]: 'Aprovado' }))}
                                                    className={cn(
                                                        "size-8 rounded-lg flex items-center justify-center transition-all border shadow-sm",
                                                        (auditItemStates[item.id] || item.status) === 'Aprovado' ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200" : "bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                                                    )}
                                                >
                                                    <CheckCircle2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setAuditItemStates(prev => ({ ...prev, [item.id]: 'Recusado' }))}
                                                    className={cn(
                                                        "size-8 rounded-lg flex items-center justify-center transition-all border shadow-sm",
                                                        (auditItemStates[item.id] || item.status) === 'Recusado' ? "bg-rose-600 text-white border-rose-700 shadow-rose-200" : "bg-white dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10 hover:border-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                                    )}
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!withdrawalDetails.commissions || withdrawalDetails.commissions.length === 0) && (
                                    <div className="text-center py-16 bg-slate-50 dark:bg-white/5 rounded-3xl border border-dashed border-slate-300 dark:border-white/10">
                                        <p className="text-sm font-black text-slate-400 italic">Nenhum pedido vinculado encontrado.</p>
                                        <p className="text-[10px] text-slate-400/60 mt-2 font-bold uppercase tracking-widest">Verificar Integridade do Banco</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-200 dark:border-white/10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Observações da Auditoria</label>
                                    <textarea
                                        value={auditObservations}
                                        onChange={(e) => setAuditObservations(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-3 text-xs font-bold focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-500/10 focus:border-blue-500 transition-all min-h-[120px] outline-none text-slate-950 dark:text-white placeholder:text-slate-300 shadow-inner"
                                        placeholder="Descreva observações detalhadas..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Comprovante Bancário</label>
                                        <div className="flex flex-col gap-2">
                                            {auditProofUrl ? (
                                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-500/20 p-3 rounded-xl flex items-center justify-between group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-6 rounded bg-emerald-500 text-white flex items-center justify-center">
                                                            <Check size={12} />
                                                        </div>
                                                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Arquivo enviado com sucesso!</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setAuditProofUrl('')}
                                                        className="text-[9px] font-black text-rose-600 uppercase hover:underline p-1.5"
                                                    >
                                                        Trocar
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className={cn(
                                                    "w-full h-[120px] bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-inner",
                                                    isUploadingProof && "animate-pulse cursor-wait opacity-50"
                                                )}>
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept="image/*,application/pdf"
                                                        onChange={handleFileUpload}
                                                        disabled={isUploadingProof}
                                                    />
                                                    <div className="size-10 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/10">
                                                        {isUploadingProof ? <div className="size-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> : <Plus size={20} />}
                                                    </div>
                                                    <div className="text-center px-4">
                                                        <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">ANEXAR COMPROVANTE</p>
                                                        <p className="text-[8px] text-slate-400 font-bold mt-0.5">Clique ou arraste um PDF ou Imagem</p>
                                                    </div>
                                                </label>
                                            )}
                                            {auditProofUrl && (
                                                <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl border border-blue-100 dark:border-blue-500/10">
                                                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    <a href={auditProofUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-2">
                                                        Abrir link do arquivo <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-6">
                                <button
                                    disabled={isAuditSubmitting || withdrawalDetails.status !== 'Processando'}
                                    onClick={async () => {
                                        setIsAuditSubmitting(true);
                                        const approvedItems = Object.entries(auditItemStates).filter(([_, status]) => status === 'Aprovado').map(([id]) => id);
                                        const refusedItems = Object.entries(auditItemStates).filter(([_, status]) => status === 'Recusado').map(([id]) => id);
                                        await handleFinancialAction(withdrawalDetails.id, 'audit', {
                                            approvedItems,
                                            refusedItems,
                                            observations: auditObservations
                                        });
                                        setIsAuditSubmitting(false);
                                    }}
                                    className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-900 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border border-slate-200 dark:border-white/5 shadow-sm"
                                >
                                    Salvar Alterações
                                </button>
                                <button
                                    disabled={isAuditSubmitting || withdrawalDetails.status !== 'Processando'}
                                    onClick={() => handleFinancialAction(withdrawalDetails.id, 'refuse', { observations: auditObservations })}
                                    className="px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border border-rose-100 hover:border-rose-700 shadow-sm"
                                >
                                    <XCircle size={16} /> Recusar Saque
                                </button>
                                <button
                                    disabled={isAuditSubmitting || withdrawalDetails.status !== 'Processando'}
                                    onClick={() => {
                                        if (!auditProofUrl && !confirm("Deseja liquidar sem comprovante?")) return;
                                        handleFinancialAction(withdrawalDetails.id, 'liquidate', {
                                            proofUrl: auditProofUrl,
                                            observations: auditObservations
                                        });
                                    }}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group"
                                >
                                    <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" /> Confirmar & Liquidar Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* PRODUCT MODAL */}
            <ProductModal
                isOpen={isProductModalOpen}
                onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                initialData={editingProduct}
                supplierProducts={supplierProducts || []}
                title={editingProduct ? "Editar Produto" : "Novo Produto"}
            />


            {/* INVITE MODAL */}
            <Modal isOpen={isInviteModalOpen} onClose={() => { setIsInviteModalOpen(false); setInviteEmail(""); setInviteName(""); setInviteSuccess(""); setInviteError(""); }} title="Convidar Novo Usuário" width="sm">
                <div className="space-y-8 py-4">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">GESTÃO DE ACESSOS</span>
                        <p className="text-sm text-[var(--muted)] font-bold opacity-80 leading-relaxed italic border-l-4 border-primary/20 pl-4 uppercase tracking-widest text-[10px]">O e-mail informado será adicionado à lista de autorizados para criação de conta.</p>
                    </div>

                    {inviteSuccess && (
                        <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500 text-white rounded-2xl border border-emerald-600 shadow-xl shadow-emerald-500/20 animate-in zoom-in duration-300">
                            <CheckCircle2 size={24} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">{inviteSuccess}</span>
                        </div>
                    )}
                    {inviteError && (
                        <div className="flex items-center gap-3 px-6 py-4 bg-rose-500 text-white rounded-2xl border border-rose-600 shadow-xl shadow-rose-500/20 animate-in shake duration-500">
                            <XCircle size={24} strokeWidth={3} />
                            <span className="text-xs font-black uppercase tracking-widest">{inviteError}</span>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Nome do Consultor (Opcional)</label>
                            <Input
                                value={inviteName}
                                onChange={(e: any) => setInviteName(e.target.value)}
                                placeholder="EX: JOÃO DA SILVA"
                                className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase placeholder:opacity-30"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-2">E-mail Corporativo</label>
                            <Input
                                type="email"
                                value={inviteEmail}
                                onChange={(e: any) => setInviteEmail(e.target.value)}
                                placeholder="EMAIL@DELTA360.COM.BR"
                                required
                                className="bg-[var(--background)] border-4 border-[var(--border)] rounded-[1.5rem] font-black uppercase placeholder:opacity-30 focus:border-primary transition-all py-8 px-8 text-lg tracking-tight"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-6 border-t border-[var(--border)]">
                        <button
                            disabled={isSendingInvite || !inviteEmail.includes('@')}
                            onClick={async () => {
                                setIsSendingInvite(true);
                                setInviteError("");
                                setInviteSuccess("");
                                try {
                                    const { error } = await supabase.from('allowed_emails').insert([{ email: inviteEmail.toLowerCase().trim() }]);
                                    if (error) {
                                        setInviteError(error.code === '23505' ? 'E-MAIL JÁ AUTORIZADO.' : error.message.toUpperCase());
                                    } else {
                                        setInviteSuccess(`AUTORIZADO: ${inviteEmail.toUpperCase()}!`);
                                        mutateInvites();
                                        setInviteEmail(""); setInviteName("");
                                        setTimeout(() => { setIsInviteModalOpen(false); setInviteSuccess(""); }, 2000);
                                    }
                                } catch (err: any) {
                                    setInviteError(err.message?.toUpperCase() || 'ERRO AO ENVIAR CONVITE.');
                                } finally {
                                    setIsSendingInvite(false);
                                }
                            }}
                            className="bg-primary text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:bg-primary-dark active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-4 border border-white/10"
                        >
                            {isSendingInvite ? (
                                <div className="size-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Mail size={18} strokeWidth={3} /> Enviar Convite
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsInviteModalOpen(false)}
                            className="py-4 rounded-2xl font-black text-[10px] text-[var(--muted)] uppercase tracking-widest hover:text-[var(--foreground)] transition-all bg-[var(--background)] border border-[var(--border)]"
                        >
                            Cancelar Operação
                        </button>
                    </div>
                </div>
            </Modal>

            {/* SELECTION MODAL (PARCEIRO EDIT) */}
            {selectedUser && (
                <Modal
                    isOpen={!!selectedUser}
                    onClose={() => setSelectedUser(null)}
                    title="Gestão de Parceiro Credenciado"
                    width="lg"
                >
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const data = Object.fromEntries(formData.entries());
                        handleSaveUserAdmin(data);
                    }} className="flex flex-col space-y-12 pb-6">
                        {/* Section: Identificação */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b-4 border-primary/10 pb-4">
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                    <User size={18} />
                                </div>
                                <h5 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.4em]">Identidade & Acesso</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Nome Completo</label>
                                    <Input name="full_name" defaultValue={selectedUser.full_name} required className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1 opacity-50">E-mail (Login)</label>
                                    <Input defaultValue={selectedUser.email} disabled className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold opacity-40" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Telefone / WhatsApp</label>
                                    <Input name="phone" defaultValue={selectedUser.phone} placeholder="(00) 00000-0000" className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Documento (CPF/CNPJ)</label>
                                    <Input name="doc" defaultValue={selectedUser.doc} placeholder="000.000.000-00" className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold" />
                                </div>
                            </div>
                        </div>

                        {/* Section: Operacional & Endereço */}
                        <div className="space-y-10">
                            <div className="flex items-center gap-3 border-b-4 border-indigo-500/10 pb-4">
                                <div className="size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 border border-indigo-500/20">
                                    <Building2 size={18} />
                                </div>
                                <h5 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.4em]">Logística & Faturamento</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Razão Social / Nome Fantasia</label>
                                    <Input name="company_name" defaultValue={selectedUser.company_name} className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Chave PIX para Repasses</label>
                                    <Input name="pix_key" defaultValue={selectedUser.pix_key} className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black text-blue-600" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Inscrição Estadual</label>
                                    <Input name="state_registration" defaultValue={selectedUser.state_registration} className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--background)]/50 p-8 rounded-[2.5rem] border border-[var(--border)] shadow-inner">
                                <div className="space-y-2 md:col-span-3">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-60">Endereço de Correspondência</label>
                                </div>
                                <Input label="CEP" name="address_zip" defaultValue={selectedUser.address_zip} className="bg-[var(--card)] rounded-xl border-[var(--border)] font-bold" />
                                <Input label="Logradouro" name="address_street" defaultValue={selectedUser.address_street} className="md:col-span-2 bg-[var(--card)] rounded-xl border-[var(--border)] font-bold" />
                                <Input label="Bairro" name="address_neighborhood" defaultValue={selectedUser.address_neighborhood} className="bg-[var(--card)] rounded-xl border-[var(--border)] font-bold" />
                                <Input label="Cidade" name="address_city" defaultValue={selectedUser.address_city} className="bg-[var(--card)] rounded-xl border-[var(--border)] font-bold" />
                                <Input label="UF" name="address_state" defaultValue={selectedUser.address_state} className="bg-[var(--card)] rounded-xl border-[var(--border)] font-black text-center" />
                            </div>
                        </div>

                        {/* Section: Permissões de Acesso */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b-4 border-emerald-500/10 pb-4">
                                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                                    <ShieldCheck size={18} />
                                </div>
                                <h5 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.4em]">Permissões de Acesso</h5>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {['Menu Principal', 'Administração'].map((category) => (
                                    <div key={category} className="space-y-4">
                                        <h6 className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] opacity-60 ml-1">{category}</h6>
                                        <div className="space-y-2 bg-[var(--background)]/40 p-4 rounded-2xl border border-[var(--border)] shadow-inner">
                                            {PERMISSIONS_LIST.filter(p => p.category === category).map((perm) => (
                                                <label key={perm.key} className="flex items-center justify-between group cursor-pointer p-2 hover:bg-primary/5 rounded-xl transition-all border border-transparent hover:border-primary/10">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold uppercase tracking-tight text-[var(--foreground)] group-hover:text-primary transition-colors">{perm.label}</span>
                                                        <span className="text-[8px] font-medium text-[var(--muted)] opacity-60 uppercase tracking-widest">{perm.key}</span>
                                                    </div>
                                                    <div className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name={perm.key}
                                                            defaultChecked={selectedUser.permissions?.[perm.key]}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-9 h-5 bg-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section: Papel de Gestão */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 border-b-4 border-amber-500/10 pb-4">
                                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                                    <Shield size={18} />
                                </div>
                                <h5 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-[0.4em]">Hierarquia & Status</h5>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-10 bg-amber-500/[0.03] rounded-[3rem] border border-amber-500/10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 ml-1">Cargo / Função</label>
                                    <select
                                        name="role"
                                        defaultValue={selectedUser.role || 'seller'}
                                        className="w-full h-14 px-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black uppercase focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 appearance-none cursor-pointer tracking-wider"
                                    >
                                        <option value="seller">Consultor Premium</option>
                                        <option value="moderador">Moderador</option>
                                        <option value="financeiro">Financeiro Auditor</option>
                                        <option value="admin">Administrador Master</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 ml-1">Nível de Rede</label>
                                    <select
                                        name="level"
                                        defaultValue={selectedUser.level || 'Bronze'}
                                        className="w-full h-14 px-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black uppercase focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none cursor-pointer tracking-wider"
                                    >
                                        <option value="Bronze">Parceiro Bronze</option>
                                        <option value="Prata">Parceiro Prata</option>
                                        <option value="Ouro">Parceiro Ouro</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Situação Cadastral</label>
                                    <select
                                        name="status"
                                        defaultValue={selectedUser.status || 'Ativo'}
                                        className="w-full h-14 px-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black uppercase focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer tracking-wider"
                                    >
                                        <option value="Ativo">Operacional (Ativo)</option>
                                        <option value="Pendente">Aguardando Revisão</option>
                                        <option value="Inativo">Bloqueado / Inativo</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex flex-col md:flex-row gap-6 pt-10 border-t-8 border-[var(--border)]">
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="flex-[2] bg-primary text-white py-8 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] shadow-[0_25px_50px_-12px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 border-2 border-white/20"
                            >
                                {isUpdating ? (
                                    <div className="size-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={28} strokeWidth={3} /> Salvar Alterações
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedUser(null)}
                                className="flex-1 py-8 bg-[var(--background)] text-[var(--muted)] border-4 border-[var(--border)] rounded-[2.5rem] font-black text-xs uppercase tracking-[0.2em] hover:text-[var(--foreground)] hover:border-primary group transition-all"
                            >
                                Descartar
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* SUPPLIER TABLE MODAL */}
            <SupplierTableModal
                isOpen={isSTableModalOpen}
                onClose={() => { setIsSTableModalOpen(false); setEditingSTable(null); }}
                onSubmit={async (data) => {
                    try {
                        if (editingSTable) {
                            const { error } = await supabase.from('supplier_tables').update(data).eq('id', editingSTable.id);
                            if (error) throw error;
                        } else {
                            const { error } = await supabase.from('supplier_tables').insert([data]);
                            if (error) throw error;
                        }
                        mutateSupplierTables();
                        setIsSTableModalOpen(false);
                    } catch (e: any) { alert(e.message); }
                }}
                initialData={editingSTable}
                title={editingSTable ? "Editar Tabela" : "Nova Tabela de Custo"}
            />

            {/* SUPPLIER PRODUCT MODAL */}
            <SupplierProductModal
                isOpen={isSProductModalOpen}
                onClose={() => { setIsSProductModalOpen(false); setEditingSProduct(null); }}
                onSubmit={async (data) => {
                    try {
                        if (editingSProduct) {
                            const { error } = await supabase.from('supplier_products').update(data).eq('id', editingSProduct.id);
                            if (error) throw error;
                        } else {
                            const { error } = await supabase.from('supplier_products').insert([data]);
                            if (error) throw error;
                        }
                        mutateSupplierProducts();
                        setIsSProductModalOpen(false);
                    } catch (e: any) { alert(e.message); }
                }}
                initialData={editingSProduct}
                tables={supplierTables || []}
                title={editingSProduct ? "Editar Vínculo" : "Vincular Produto Fornecedor"}
            />
        </div>
    );
}
