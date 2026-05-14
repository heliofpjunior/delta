"use client";

import {
    User,
    ShieldCheck,
    Image as ImageIcon,
    MapPin,
    Lock,
    CreditCard,
    Save,
    AlertCircle,
    FileText,
    Tag,
    Sun,
    Moon,
    RefreshCw,
    Award,
    Store,
    Palette,
    Globe,
    Check,
    ExternalLink,
    Share2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect, Fragment } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import { supabase } from "@/lib/supabase";
import { calculateCommission } from "@/lib/rulesEngine";
import useSWR from "swr";

const getErrorMessage = (error: any) => {
    if (!error) return "Erro desconhecido";
    if (typeof error === "string") return error;

    const parts = [
        error.message,
        error.details,
        error.hint,
        error.code ? `Codigo: ${error.code}` : null
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" | ") : JSON.stringify(error);
};

const isMissingProfileSalesColumnError = (error: any) => {
    const message = getErrorMessage(error).toLowerCase();
    return (
        message.includes("is_public_store_active") ||
        message.includes("store_slug") ||
        message.includes("store_branding") ||
        message.includes("schema cache") ||
        message.includes("column")
    );
};

export default function SettingsPage() {
    const { currentUser, updateUser, updateThemePreference } = useSimulation();
    const [activeTab, setActiveTab] = useState("perfil");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [customPrices, setCustomPrices] = useState<Record<number, number>>({});

    // Form states
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [doc, setDoc] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [stateRegistration, setStateRegistration] = useState("");
    const [pixKey, setPixKey] = useState("");
    const [addressZip, setAddressZip] = useState("");
    const [addressStreet, setAddressStreet] = useState("");
    const [addressNumber, setAddressNumber] = useState("");
    const [addressComplement, setAddressComplement] = useState("");
    const [addressNeighborhood, setAddressNeighborhood] = useState("");
    const [addressCity, setAddressCity] = useState("");
    const [addressState, setAddressState] = useState("");
    const [taxCollectionByUser, setTaxCollectionByUser] = useState(false);
    const [isPublicStoreActive, setIsPublicStoreActive] = useState(false);
    const [storeSlug, setStoreSlug] = useState("");
    const [storeBranding, setStoreBranding] = useState<{ logo: string | null; primary_color: string; bio: string }>({
        logo: null,
        primary_color: "#3B82F6",
        bio: ""
    });

    // Sync form when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || "");
            setPhone(currentUser.phone || "");
            setAvatarUrl(currentUser.avatar || "");
            setDoc(currentUser.doc || "");
            setCompanyName(currentUser.company_name || "");
            setStateRegistration(currentUser.state_registration || "");
            setPixKey(currentUser.pix_key || "");
            setAddressZip(currentUser.address_zip || "");
            setAddressStreet(currentUser.address_street || "");
            setAddressNumber(currentUser.address_number || "");
            setAddressComplement(currentUser.address_complement || "");
            setAddressNeighborhood(currentUser.address_neighborhood || "");
            setAddressCity(currentUser.address_city || "");
            setAddressState(currentUser.address_state || "");
            setCustomPrices(currentUser.custom_prices || {});
            setTaxCollectionByUser(currentUser.tax_collection_by_user || false);
            setIsPublicStoreActive(currentUser.is_public_store_active || false);
            setStoreSlug(currentUser.store_slug || "");
            setStoreBranding(currentUser.store_branding || { logo: null, primary_color: "#3B82F6", bio: "" });
        }
    }, [currentUser]);

    const { data: productsData, error: productsError } = useSWR('products_fetch', async () => {
        const { data, error } = await supabase.from('products').select(`
            *,
            supplier_products (
                *,
                supplier_tables (*)
            )
        `).order('name');
        if (error) throw error;
        return data;
    });

    useEffect(() => {
        if (productsData) setProducts(productsData);
    }, [productsData]);

    const handleSaveProfile = async () => {
        setLoading(true);
        setSuccess(false);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error("Sessao expirada. Faca login novamente para salvar.");

            const profilePayload = {
                full_name: name,
                phone,
                doc,
                company_name: companyName,
                state_registration: stateRegistration,
                pix_key: pixKey,
                address_zip: addressZip,
                address_street: addressStreet,
                address_number: addressNumber,
                address_complement: addressComplement,
                address_neighborhood: addressNeighborhood,
                address_city: addressCity,
                address_state: addressState,
                tax_collection_by_user: taxCollectionByUser
            };

            const salesPayload = {
                is_public_store_active: isPublicStoreActive,
                store_slug: storeSlug,
                store_branding: storeBranding
            };

            let { data: updated, error } = await supabase
                .from('profiles')
                .update({ ...profilePayload, ...salesPayload })
                .eq('id', session.user.id)
                .select()
                .single();

            if (error && activeTab !== "vendas" && isMissingProfileSalesColumnError(error)) {
                const retry = await supabase
                    .from('profiles')
                    .update(profilePayload)
                    .eq('id', session.user.id)
                    .select()
                    .single();

                updated = retry.data;
                error = retry.error;
            }

            if (error) throw error;

            // Update local context
            updateUser({
                name: updated.full_name,
                phone: updated.phone,
                doc: updated.doc,
                company_name: updated.company_name,
                state_registration: updated.state_registration,
                pix_key: updated.pix_key,
                address_zip: updated.address_zip,
                address_street: updated.address_street,
                address_number: updated.address_number,
                address_complement: updated.address_complement,
                address_neighborhood: updated.address_neighborhood,
                address_city: updated.address_city,
                address_state: updated.address_state,
                custom_prices: updated.custom_prices,
                tax_collection_by_user: updated.tax_collection_by_user,
                is_public_store_active: updated.is_public_store_active ?? isPublicStoreActive,
                store_slug: updated.store_slug ?? storeSlug,
                store_branding: updated.store_branding ?? storeBranding
            });
            setSuccess(true);

            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            const message = getErrorMessage(error);
            console.error("Erro ao salvar:", message, error);
            alert("Erro ao salvar perfil: " + message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Não autenticado");

            const fileExt = file.name.split('.').pop();
            const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // 3. Update Profile
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', session.user.id);

            if (updateError) throw updateError;

            // 4. Update local state
            setAvatarUrl(publicUrl);
            updateUser({ avatar: publicUrl });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

        } catch (error: any) {
            console.error("Erro upload:", error);
            alert("Falha no upload do avatar: " + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSavePrices = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Sessao expirada. Faca login novamente para salvar.");

            const { error } = await supabase
                .from('profiles')
                .update({ custom_prices: customPrices })
                .eq('id', session.user.id);

            if (error) throw error;

            updateUser({ custom_prices: customPrices });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (e: any) {
            alert("Erro ao salvar preços: " + getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const [expandedPriceId, setExpandedPriceId] = useState<number | null>(null);

    return (
        <div className="p-4 lg:p-6 space-y-8 min-h-screen bg-[var(--background)]">
            {/* ── High-Realce Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mx-4 -mt-6 p-8 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-[2.5rem] shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
                            <Tag size={16} strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none">PREFERÊNCIAS DO SISTEMA</p>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase">Configurações</h1>
                </div>
            </div>

            {/* ── High-Realce Tabs ── */}
            <div className="flex justify-center -mt-12 relative z-20">
                <div className="flex flex-wrap justify-center gap-2 bg-[var(--card)] p-2 rounded-2xl border-2 border-[var(--border)] shadow-xl backdrop-blur-xl">
                    {[
                        { id: 'perfil', icon: User, label: 'Meu Perfil' },
                        { id: 'fiscal', icon: FileText, label: 'Dados Fiscais' },
                        { id: 'bancario', icon: CreditCard, label: 'Dados Bancários' },
                        { id: 'seguranca', icon: ShieldCheck, label: 'Segurança' },
                        { id: 'precos', icon: Tag, label: 'Preços' },
                        { id: 'vendas', icon: Store, label: 'Vendas' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3",
                                activeTab === tab.id
                                    ? "bg-primary text-white shadow-md scale-105"
                                    : "text-[var(--muted)] hover:text-primary hover:bg-[var(--background)]"
                            )}
                        >
                            <tab.icon size={16} strokeWidth={3} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] overflow-hidden shadow-xl relative min-h-[600px]">
                    <div className="p-6 md:p-10">
                        {activeTab === "perfil" && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                {/* Avatar Section */}
                                <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-[var(--border)]">
                                    <div className="relative group">
                                        <div className="size-24 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] shadow-xl overflow-hidden flex items-center justify-center text-primary font-black text-3xl relative group-hover:scale-105 transition-transform">
                                            {currentUser.avatar ? (
                                                <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                currentUser.name.charAt(0)
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-[var(--background)]/80 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 size-10 bg-primary text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-[var(--card)] z-10">
                                            <ImageIcon size={18} strokeWidth={3} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <div className="text-center md:text-left space-y-3">
                                        <div>
                                            <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">Foto de Perfil</h3>
                                            <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.2em]">JPG, GIF ou PNG. MÁX 2MB.</p>
                                        </div>
                                        <div className="flex gap-3 justify-center md:justify-start">
                                            <label className="px-6 py-2.5 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-md cursor-pointer hover:bg-primary/90 transition-all active:scale-95 border border-white/10">
                                                {uploading ? 'ENVIANDO...' : 'ALTERAR FOTO'}
                                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                            </label>
                                            <button
                                                onClick={async () => {
                                                    if (confirm("Deseja remover sua foto de perfil?")) {
                                                        const { data: { session } } = await supabase.auth.getSession();
                                                        await supabase.from('profiles').update({ avatar_url: null }).eq('id', session?.user.id);
                                                        setAvatarUrl("");
                                                        updateUser({ avatar: undefined });
                                                    }
                                                }}
                                                className="px-6 py-2.5 bg-[var(--background)] text-[var(--muted)] text-[10px] font-black uppercase tracking-widest rounded-lg border border-[var(--border)] hover:text-rose-500 hover:border-rose-500/50 transition-all active:scale-95">REMOVER</button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Nome Completo</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">E-mail Profissional</label>
                                        <input
                                            type="email"
                                            value={currentUser.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black opacity-50 cursor-not-allowed text-[var(--foreground)] uppercase tracking-wider"
                                            title="Email deve ser alterado via segurança do Supabase"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Telefone / WhatsApp</label>
                                        <input
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="(00) 00000-0000"
                                            className="w-full px-4 py-2.5 bg-[var(--background)] border-2 border-[var(--border)] rounded-lg text-sm font-black focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                </div>

                                {/* Theme Preference Section */}
                                <div className="pt-6 border-t border-[var(--border)] space-y-4">
                                    <div className="flex flex-col gap-1">
                                        <h3 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">Aparência do Sistema</h3>
                                        <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-[0.2em]">Escolha o tema que melhor se adapta à sua rotina.</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                                        <button
                                            onClick={() => updateThemePreference(false)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group text-left relative overflow-hidden",
                                                !currentUser.preferences?.darkMode
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-[var(--border)] text-[var(--muted)] hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-12 rounded-xl flex items-center justify-center transition-all shadow-md",
                                                    !currentUser.preferences?.darkMode ? "bg-primary text-white border border-white/20" : "bg-[var(--background)] border border-[var(--border)] group-hover:scale-110"
                                                )}>
                                                    <Sun size={20} strokeWidth={3} />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className="text-[11px] font-black uppercase tracking-widest block">Tema Claro</span>
                                                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">DIURNO / ALTO BRILHO</span>
                                                </div>
                                            </div>
                                            {!currentUser.preferences?.darkMode && (
                                                <div className="size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                                                    <div className="size-2 bg-white rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => updateThemePreference(true)}
                                            className={cn(
                                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all group text-left relative overflow-hidden",
                                                currentUser.preferences?.darkMode
                                                    ? "border-primary bg-primary/5 text-primary"
                                                    : "border-[var(--border)] text-[var(--muted)] hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-12 rounded-xl flex items-center justify-center transition-all shadow-md",
                                                    currentUser.preferences?.darkMode ? "bg-primary text-white border border-white/20" : "bg-[var(--background)] border border-[var(--border)] group-hover:scale-110"
                                                )}>
                                                    <Moon size={20} strokeWidth={3} />
                                                </div>
                                                <div className="leading-tight">
                                                    <span className="text-[11px] font-black uppercase tracking-widest block">Tema Escuro</span>
                                                    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">NOTURNO / ALTO CONTRASTE</span>
                                                </div>
                                            </div>
                                            {currentUser.preferences?.darkMode && (
                                                <div className="size-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                                                    <div className="size-2 bg-white rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 items-center gap-6">
                                    {success && (
                                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Salvo com sucesso!</span>
                                    )}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-white/10"
                                    >
                                        {loading ? (
                                            <Save size={20} className="animate-spin" strokeWidth={3} />
                                        ) : (
                                            <Save size={20} strokeWidth={3} />
                                        )}
                                        {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "fiscal" && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    <div className="space-y-4 md:col-span-1">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">CPF / CNPJ</label>
                                        <input
                                            type="text"
                                            value={doc}
                                            onChange={(e) => setDoc(e.target.value)}
                                            placeholder="000.000.000-00"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4 md:col-span-2">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Razão Social / Nome Fantasia</label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Nome da sua empresa"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Inscrição Estadual</label>
                                        <input
                                            type="text"
                                            value={stateRegistration}
                                            onChange={(e) => setStateRegistration(e.target.value)}
                                            placeholder="Isento"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">CEP</label>
                                        <input
                                            type="text"
                                            value={addressZip}
                                            onChange={(e) => setAddressZip(e.target.value)}
                                            placeholder="00000-000"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4 flex-grow md:col-span-2 lg:col-span-1">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Logradouro</label>
                                        <input
                                            type="text"
                                            value={addressStreet}
                                            onChange={(e) => setAddressStreet(e.target.value)}
                                            placeholder="Rua, Avenida, etc."
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Número</label>
                                        <input
                                            type="text"
                                            value={addressNumber}
                                            onChange={(e) => setAddressNumber(e.target.value)}
                                            placeholder="123"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Complemento</label>
                                        <input
                                            type="text"
                                            value={addressComplement}
                                            onChange={(e) => setAddressComplement(e.target.value)}
                                            placeholder="Apto, Sala, etc."
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Bairro</label>
                                        <input
                                            type="text"
                                            value={addressNeighborhood}
                                            onChange={(e) => setAddressNeighborhood(e.target.value)}
                                            placeholder="Seu bairro"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Cidade</label>
                                        <input
                                            type="text"
                                            value={addressCity}
                                            onChange={(e) => setAddressCity(e.target.value)}
                                            placeholder="Sua cidade"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Estado (UF)</label>
                                        <input
                                            type="text"
                                            value={addressState}
                                            onChange={(e) => setAddressState(e.target.value)}
                                            placeholder="SP"
                                            maxLength={2}
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                </div>

                                {/* New Fiscal Choice Container */}
                                <div className="bg-amber-500/5 border-2 border-amber-500/10 p-8 rounded-[2rem] space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20">
                                            <AlertCircle size={20} strokeWidth={3} />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-600">Gestão Fiscal Personalizada</h4>
                                            <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">Defina como o imposto de fornecedor deve ser processado.</p>
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-4 p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl cursor-pointer hover:border-primary/50 transition-all group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={taxCollectionByUser}
                                                onChange={(e) => setTaxCollectionByUser(e.target.checked)}
                                                className="size-6 bg-[var(--card)] border-2 border-[var(--border)] rounded-lg appearance-none checked:bg-primary checked:border-primary transition-all cursor-pointer"
                                            />
                                            {taxCollectionByUser && (
                                                <div className="absolute pointer-events-none">
                                                    <div className="size-1.5 bg-white rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col leading-tight">
                                            <span className={cn(
                                                "text-xs font-black uppercase tracking-widest transition-colors",
                                                taxCollectionByUser ? "text-primary" : "text-[var(--foreground)] opacity-60"
                                            )}>
                                                Recolhimento de impostos feito pelo usuário
                                            </span>
                                            <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-[0.1em] italic">
                                                {taxCollectionByUser
                                                    ? "Imposto calculado sobre o CUSTO BASE (Elo). Você assume a diferença sobre o lucro."
                                                    : "Imposto calculado sobre o PREÇO DE VENDA FINAL (Padrão)."}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                <div className="flex justify-end pt-8 items-center gap-6">
                                    {success && (
                                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Salvo com sucesso!</span>
                                    )}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-white/10"
                                    >
                                        {loading ? <Save size={20} className="animate-spin" strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
                                        {loading ? 'SALVANDO...' : 'SALVAR DADOS FISCAIS'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "bancario" && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="bg-indigo-500/5 dark:bg-indigo-500/10 border-4 border-indigo-500/20 p-8 rounded-[2rem] flex gap-6 text-indigo-600 dark:text-indigo-400 items-center">
                                    <div className="size-14 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                                        <CreditCard size={28} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] mb-1">Pagamentos de Repasse</h4>
                                        <p className="text-sm font-bold opacity-80">Informe sua chave PIX para o recebimento automático de comissões e resgates.</p>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Chave PIX (E-mail, CPF, Celular ou Aleatória)</label>
                                        <input
                                            type="text"
                                            value={pixKey}
                                            onChange={(e) => setPixKey(e.target.value)}
                                            placeholder="Sua chave PIX"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase tracking-wider"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 items-center gap-6">
                                    {success && (
                                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Salvo com sucesso!</span>
                                    )}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-white/10"
                                    >
                                        {loading ? <Save size={20} className="animate-spin" strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
                                        {loading ? 'SALVANDO...' : 'SALVAR DADOS BANCÁRIOS'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === "seguranca" && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Nova Senha</label>
                                        <input
                                            type="password"
                                            id="new-password"
                                            placeholder="••••••••"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] tracking-[0.5em]"
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            id="confirm-password"
                                            placeholder="••••••••"
                                            className="w-full px-6 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] tracking-[0.5em]"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-8 items-center gap-6">
                                    {success && (
                                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Senha atualizada!</span>
                                    )}
                                    <button
                                        onClick={async () => {
                                            const newPass = (document.getElementById('new-password') as HTMLInputElement).value;
                                            const confirmPass = (document.getElementById('confirm-password') as HTMLInputElement).value;

                                            if (newPass.length < 6) {
                                                alert("A senha deve ter pelo menos 6 caracteres.");
                                                return;
                                            }

                                            if (newPass !== confirmPass) {
                                                alert("As senhas não coincidem.");
                                                return;
                                            }

                                            setLoading(true);
                                            try {
                                                const { error } = await supabase.auth.updateUser({ password: newPass });
                                                if (error) throw error;

                                                setSuccess(true);
                                                (document.getElementById('new-password') as HTMLInputElement).value = "";
                                                (document.getElementById('confirm-password') as HTMLInputElement).value = "";
                                                setTimeout(() => setSuccess(false), 3000);
                                            } catch (e: any) {
                                                alert("Erro ao atualizar senha: " + e.message);
                                            } finally {
                                                setLoading(false);
                                            }
                                        }}
                                        disabled={loading}
                                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 border-2 border-white/10"
                                    >
                                        {loading ? <Save size={20} className="animate-spin" strokeWidth={3} /> : <ShieldCheck size={20} strokeWidth={3} />}
                                        {loading ? 'ATUALIZANDO...' : 'ATUALIZAR SENHA'}
                                    </button>
                                </div>

                                <div className="pt-12 border-t-4 border-[var(--border)]">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-8 bg-rose-500/5 border-4 border-rose-500/20 rounded-[2.5rem]">
                                        <div className="space-y-2 text-center md:text-left">
                                            <h4 className="text-xl font-black text-rose-500 uppercase tracking-tighter">Zona de Perigo</h4>
                                            <p className="text-[11px] font-bold text-rose-500/60 uppercase tracking-widest">Uma vez que você deletar sua conta, não há volta. Por favor, tenha certeza.</p>
                                        </div>
                                        <button className="px-10 py-4 border-2 border-rose-500/30 text-rose-500 text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                                            ENCERRAR CONTA
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "precos" && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {/* Header Info */}
                                <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-3">
                                                <Tag size={24} strokeWidth={3} />
                                                Tabela de Preços
                                            </h3>
                                            <p className="text-xs font-bold text-[var(--muted)] max-w-xl leading-relaxed uppercase tracking-wider">
                                                Customize seus preços de venda. Os valores definidos aqui serão aplicados automaticamente em suas novas emissões.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-primary/10 shadow-sm">
                                            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <Award size={20} strokeWidth={3} />
                                            </div>
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Seu Nível Atual</p>
                                                <p className="text-sm font-black text-primary uppercase">{currentUser.level}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modern Table View */}
                                <div className="hidden md:block bg-[var(--background)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-[var(--border)]">
                                                <th className="px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-left">Produto / Categoria</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Preço Sugerido</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Seu Custo</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-center">Seu Preço (R$)</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest text-right">Ganho Líquido</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[var(--border)]">
                                            {products.map(product => {
                                                const userLevel = currentUser.level || 'Bronze';
                                                const currentPrice = customPrices[product.id] || product.price;

                                                const supplierProduct = product.supplier_products;
                                                const supplierData = supplierProduct ? {
                                                    base_cost: supplierProduct.base_cost,
                                                    tax_fixed: supplierProduct.supplier_tables?.tax_fixed || 0,
                                                    tax_percent: supplierProduct.supplier_tables?.tax_percent || 0
                                                } : undefined;

                                                const productLevelCosts = {
                                                    bronze: Number(product.commission_bronze) || 0,
                                                    prata: Number(product.commission_prata) || 0,
                                                    ouro: Number(product.commission_ouro) || 0
                                                };

                                                const commissionData = calculateCommission(
                                                    currentPrice,
                                                    userLevel,
                                                    product.category === 'CNPJ',
                                                    currentUser.equippedBadge,
                                                    supplierData,
                                                    productLevelCosts,
                                                    currentUser.tax_collection_by_user
                                                );

                                                const estimatedGain = commissionData.repasse;
                                                const isExpanded = expandedPriceId === product.id;

                                                return (
                                                    <Fragment key={product.id}>
                                                        <tr className="hover:bg-primary/5 transition-colors group">
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="size-10 rounded-xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-sm">
                                                                        <FileText size={18} strokeWidth={2.5} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tight leading-none mb-1">{product.name}</p>
                                                                        <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{product.category}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className="text-[11px] font-bold text-[var(--muted)]">R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                            </td>
                                                            <td className="px-6 py-5 text-center">
                                                                <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-500/20">
                                                                    R$ {commissionData.partnerCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex justify-center">
                                                                    <input
                                                                        type="number"
                                                                        step="0.01"
                                                                        value={currentPrice}
                                                                        onChange={(e) => setCustomPrices({ ...customPrices, [product.id]: parseFloat(e.target.value) })}
                                                                        className="w-28 px-3 py-2 bg-[var(--card)] border-2 border-[var(--border)] rounded-xl text-center text-sm font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                                                    />
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-5">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <div className={cn(
                                                                        "px-4 py-1.5 rounded-full border text-[11px] font-black tracking-widest",
                                                                        estimatedGain >= 0
                                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                                                                            : "bg-rose-500/10 border-rose-500/20 text-rose-600"
                                                                    )}>
                                                                        {estimatedGain >= 0 ? '+' : ''} R$ {estimatedGain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setExpandedPriceId(isExpanded ? null : product.id)}
                                                                        className={cn(
                                                                            "size-8 rounded-lg flex items-center justify-center transition-all",
                                                                            isExpanded ? "bg-primary text-white" : "bg-[var(--card)] text-[var(--muted)] border border-[var(--border)] hover:text-primary"
                                                                        )}
                                                                    >
                                                                        <AlertCircle size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr className="bg-primary/[0.02]">
                                                                <td colSpan={5} className="px-10 py-6">
                                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                                                                        {commissionData.calculationSteps.map((step, idx) => (
                                                                            <div key={idx} className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-[var(--border)] shadow-sm">
                                                                                <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-wider mb-1 opacity-70">{step.label}</p>
                                                                                <p className={cn(
                                                                                    "text-xs font-black tracking-tight",
                                                                                    step.type === "negative" ? "text-rose-500" :
                                                                                        step.type === "positive" ? "text-emerald-500" : "text-[var(--foreground)]"
                                                                                )}>
                                                                                    {step.value > 0 ? "+" : ""} {step.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                                </p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Fragment>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile View - Compact & Modern Cards */}
                                <div className="md:hidden space-y-4">
                                    {products.map(product => {
                                        const currentPrice = customPrices[product.id] || product.price;
                                        const userLevel = currentUser.level || 'Bronze';

                                        const supplierProduct = product.supplier_products;
                                        const supplierData = supplierProduct ? {
                                            base_cost: supplierProduct.base_cost,
                                            tax_fixed: supplierProduct.supplier_tables?.tax_fixed || 0,
                                            tax_percent: supplierProduct.supplier_tables?.tax_percent || 0
                                        } : undefined;

                                        const productLevelCosts = {
                                            bronze: Number(product.commission_bronze) || 0,
                                            prata: Number(product.commission_prata) || 0,
                                            ouro: Number(product.commission_ouro) || 0
                                        };

                                        const commissionData = calculateCommission(
                                            currentPrice,
                                            userLevel,
                                            product.category === 'CNPJ',
                                            currentUser.equippedBadge,
                                            supplierData,
                                            productLevelCosts,
                                            currentUser.tax_collection_by_user
                                        );

                                        const estimatedGain = commissionData.repasse;
                                        const isExpanded = expandedPriceId === product.id;

                                        return (
                                            <div key={product.id} className="bg-[var(--card)] border-2 border-[var(--border)] rounded-[2rem] overflow-hidden shadow-sm transition-all active:scale-[0.98]">
                                                {/* Card Header */}
                                                <div className="p-4 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                                                            <FileText size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black uppercase tracking-tight leading-none mb-0.5">{product.name}</p>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[7px] font-black text-primary uppercase bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10 tracking-widest">{product.category}</span>
                                                                <span className="text-[7px] font-bold text-[var(--muted)] uppercase tracking-widest italic">Sugerido: R$ {product.price.toLocaleString('pt-BR')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => setExpandedPriceId(isExpanded ? null : product.id)}
                                                        className={cn(
                                                            "size-8 rounded-lg flex items-center justify-center transition-all border",
                                                            isExpanded ? "bg-primary text-white border-primary" : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]"
                                                        )}
                                                    >
                                                        <AlertCircle size={14} strokeWidth={3} />
                                                    </button>
                                                </div>

                                                {/* Card Body - Main Action Area */}
                                                <div className="p-4 space-y-4">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <div className="flex-1 space-y-1.5">
                                                            <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em] px-1">Seu Preço de Venda</p>
                                                            <div className="relative">
                                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">R$</span>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={currentPrice}
                                                                    onChange={(e) => setCustomPrices({ ...customPrices, [product.id]: parseFloat(e.target.value) })}
                                                                    className="w-full pl-10 pr-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-lg font-black text-primary focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all outline-none shadow-inner"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                                                            <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-[0.2em]">Seu Ganho</p>
                                                            <div className={cn(
                                                                "w-full text-center py-2.5 rounded-xl border-2 font-black text-sm tracking-tight shadow-sm",
                                                                estimatedGain >= 0
                                                                    ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600"
                                                                    : "bg-rose-500/5 border-rose-500/10 text-rose-600"
                                                            )}>
                                                                {estimatedGain >= 0 ? '+' : ''} R$ {estimatedGain.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Cost Indicator Bar */}
                                                    <div className="flex items-center justify-between px-3 py-2 bg-[var(--background)] rounded-xl border border-[var(--border)] border-dashed">
                                                        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Custo para você ({userLevel})</p>
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase">R$ {commissionData.partnerCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                                    </div>

                                                    {/* Expanded Calculation Steps (Mobile) */}
                                                    {isExpanded && (
                                                        <div className="pt-2 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                                                            {commissionData.calculationSteps.map((step, idx) => (
                                                                <div key={idx} className="bg-[var(--background)] p-2 rounded-xl border border-[var(--border)]">
                                                                    <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-tight mb-0.5 truncate">{step.label}</p>
                                                                    <p className={cn(
                                                                        "text-[10px] font-black tracking-tight",
                                                                        step.type === "negative" ? "text-rose-500" :
                                                                            step.type === "positive" ? "text-emerald-500" : "text-[var(--foreground)]"
                                                                    )}>
                                                                        {step.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Save Button Footer */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-8 border-t border-[var(--border)]">
                                    <div className="flex items-center gap-3 text-amber-600 bg-amber-500/5 px-6 py-3 rounded-2xl border border-amber-500/20">
                                        <AlertCircle size={18} strokeWidth={3} />
                                        <p className="text-[10px] font-black uppercase tracking-wider leading-none">Confira seus ganhos antes de salvar sua nova tabela.</p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {success && (
                                            <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Tabela atualizada!</span>
                                        )}
                                        <button
                                            onClick={handleSavePrices}
                                            disabled={loading}
                                            className="w-full md:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-b-4 border-primary-dark"
                                        >
                                            {loading ? <RefreshCw size={20} className="animate-spin" strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
                                            {loading ? 'SALVANDO...' : 'SALVAR TABELA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "vendas" && (
                            <div className="space-y-12 animate-in fade-in duration-500">
                                {/* Mode Selection */}
                                <div className="bg-primary/5 border-2 border-primary/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row gap-8 items-center">
                                    <div className="size-20 rounded-3xl bg-primary text-white flex items-center justify-center shadow-xl border-4 border-white/20 shrink-0">
                                        <Globe size={40} strokeWidth={2.5} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div>
                                            <h4 className="text-xl font-black text-primary uppercase tracking-tighter leading-none mb-2">Seu Canal de Vendas</h4>
                                            <p className="text-sm font-bold text-[var(--muted)] leading-relaxed uppercase tracking-wider">
                                                Escolha como você quer ser visto. Você pode apenas indicar produtos via link direto ou ter sua própria página de vendas personalizada.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setIsPublicStoreActive(!isPublicStoreActive)}
                                            className={cn(
                                                "px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 border-2 mx-auto md:mx-0",
                                                isPublicStoreActive
                                                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20"
                                                    : "bg-[var(--background)] text-[var(--muted)] border-[var(--border)]"
                                            )}
                                        >
                                            {isPublicStoreActive ? <Check size={16} strokeWidth={3} /> : <div className="size-4 rounded-full border-2 border-current" />}
                                            {isPublicStoreActive ? "LOJA PÚBLICA ATIVADA" : "LOJA PÚBLICA DESATIVADA (MODO SILENCIOSO)"}
                                        </button>
                                    </div>
                                </div>

                                {isPublicStoreActive && (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-top-4">
                                        {/* Store Configuration */}
                                        <div className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Identificador da Loja (SLUG)</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--muted)] group-focus-within:text-primary">delta.com.br/loja/</div>
                                                    <input
                                                        type="text"
                                                        value={storeSlug}
                                                        onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                        placeholder="meu-nome"
                                                        className="w-full pl-32 pr-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-primary uppercase"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-widest px-2 italic">Apenas letras minúsculas, números e traços.</p>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Cor de Destaque da Sua Marca</label>
                                                <div className="flex items-center gap-4 p-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl">
                                                    <input
                                                        type="color"
                                                        value={storeBranding.primary_color}
                                                        onChange={(e) => setStoreBranding({ ...storeBranding, primary_color: e.target.value })}
                                                        className="size-12 rounded-xl cursor-pointer border-none bg-transparent"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-[11px] font-black text-[var(--foreground)] uppercase">{storeBranding.primary_color}</p>
                                                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase">ESTA COR SERÁ USADA NO SEU CHECKOUT</p>
                                                    </div>
                                                    <div className="size-8 rounded-full border-2 border-[var(--border)]" style={{ backgroundColor: storeBranding.primary_color }} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Sua Biografia / Mensagem de Boas-vindas</label>
                                                <textarea
                                                    value={storeBranding.bio}
                                                    onChange={(e) => setStoreBranding({ ...storeBranding, bio: e.target.value })}
                                                    placeholder="Olá! Sou especialista em certificados digitais. Como posso te ajudar hoje?"
                                                    rows={4}
                                                    className="w-full px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all text-[var(--foreground)] uppercase"
                                                />
                                            </div>
                                        </div>

                                        {/* Live Preview Concept */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 px-2">
                                                <Palette size={16} className="text-primary" />
                                                <h5 className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em]">Prévia da sua Identidade</h5>
                                            </div>
                                            <div className="bg-[var(--background)] border-4 border-[var(--border)] rounded-[2.5rem] p-8 relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center shadow-inner">
                                                <div className="absolute top-0 inset-x-0 h-2" style={{ backgroundColor: storeBranding.primary_color }} />

                                                <div className="size-20 rounded-2xl bg-white shadow-xl mb-6 flex items-center justify-center border-2 border-[var(--border)] overflow-hidden">
                                                    {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" /> : <User size={40} className="text-[var(--muted)]" />}
                                                </div>

                                                <h6 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tighter mb-2">{currentUser.name}</h6>
                                                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest max-w-[200px] leading-relaxed mb-6">
                                                    {storeBranding.bio || "Sua mensagem personalizada aparecerá aqui para seus clientes."}
                                                </p>

                                                <div className="flex gap-3">
                                                    <div className="px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-lg" style={{ backgroundColor: storeBranding.primary_color }}>
                                                        VER PRODUTOS
                                                    </div>
                                                </div>

                                                <div className="mt-12 p-4 bg-[var(--card)] rounded-2xl border border-[var(--border)] w-full flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <Globe size={14} className="text-primary" />
                                                        <span className="text-[9px] font-black text-[var(--muted)] uppercase">delta.com.br/loja/{storeSlug || '...'}</span>
                                                    </div>
                                                    <ExternalLink size={14} className="text-[var(--muted)]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isPublicStoreActive && (
                                    <div className="p-12 border-4 border-dashed border-[var(--border)] rounded-[3rem] text-center space-y-6">
                                        <div className="size-16 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center mx-auto text-[var(--muted)]">
                                            <ShieldCheck size={32} />
                                        </div>
                                        <div className="max-w-md mx-auto">
                                            <h5 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-2">Modo Silencioso Ativado</h5>
                                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider leading-relaxed">
                                                Neste modo, seus clientes serão redirecionados diretamente para o checkout padrão da plataforma. Sua identidade não será exibida publicamente, mas seus descontos e comissões continuarão sendo aplicados normalmente via ID.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-8 items-center gap-6 border-t-4 border-[var(--border)]">
                                    {success && (
                                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Configurações de venda salvas!</span>
                                    )}
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-white/10"
                                    >
                                        {loading ? <RefreshCw size={20} className="animate-spin" strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
                                        {loading ? 'SALVANDO...' : 'SALVAR CANAL DE VENDAS'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
