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
    Moon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import { supabase } from "@/lib/supabase";

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
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase.from('products').select('*').order('name');
            if (!error && data) setProducts(data);
        };
        fetchProducts();
    }, []);

    const handleSaveProfile = async () => {
        setLoading(true);
        setSuccess(false);

        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error("Usuário não autenticado");

            const { data: updated, error } = await supabase
                .from('profiles')
                .update({
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
                    address_state: addressState
                })
                .eq('id', session.user.id)
                .select()
                .single();

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
                custom_prices: updated.custom_prices
            });
            setSuccess(true);

            setTimeout(() => setSuccess(false), 3000);
        } catch (error: any) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar perfil: " + (error.message || "Erro desconhecido"));
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

    return (
        <div className="p-4 lg:p-6 space-y-8 min-h-screen bg-[var(--background)]">
            {/* ── High-Realce Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mx-4 -mt-6 p-8 bg-[var(--background)] border-b-2 border-[var(--border)] rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border border-white/20">
                            <Tag size={14} strokeWidth={3} />
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
                        { id: 'precos', icon: Tag, label: 'Preços' }
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

            <div className="bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] overflow-hidden shadow-xl relative">
                <div className="p-8 md:p-10">
                    {activeTab === "perfil" && (
                        <div className="space-y-12 animate-in fade-in duration-500">
                            {/* Avatar Section */}
                            <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b-2 border-[var(--border)]">
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
                            <div className="pt-6 border-t-2 border-[var(--border)] space-y-4">
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
                        <div className="space-y-12 animate-in fade-in duration-500">
                            <div className="bg-primary/5 border-4 border-primary/20 p-10 rounded-[3rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
                                <div className="relative z-10 space-y-4">
                                    <h3 className="text-2xl font-black text-primary uppercase tracking-tighter flex items-center gap-4 leading-none">
                                        <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white/20">
                                            <Tag size={20} strokeWidth={3} />
                                        </div>
                                        Sua Tabela Personalizada
                                    </h3>
                                    <p className="text-sm font-bold text-[var(--muted)] max-w-2xl leading-relaxed">
                                        Defina seus preços de venda padrão. Quando você iniciar uma nova emissão, o sistema usará automaticamente estes valores para agilizar seu fluxo de trabalho.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {products.map(product => (
                                    <div key={product.id} className="flex flex-col md:flex-row md:items-center justify-between p-8 bg-[var(--background)] rounded-[2.5rem] border-4 border-[var(--border)] group hover:border-primary/30 transition-all shadow-lg hover:shadow-2xl">
                                        <div className="mb-6 md:mb-0 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                                    <FileText size={16} strokeWidth={3} />
                                                </div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{product.category}</p>
                                            </div>
                                            <h4 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">{product.name}</h4>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-[var(--card)] border-2 border-[var(--border)] rounded-full w-fit">
                                                <span className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest">Sugestão:</span>
                                                <span className="text-[9px] text-primary font-black uppercase tracking-widest">R$ {product.price.toLocaleString('pt-BR')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="relative group/input">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xs font-black text-[var(--muted)] group-focus-within/input:text-primary transition-colors">R$</div>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={customPrices[product.id] || product.price}
                                                    onChange={(e) => setCustomPrices({ ...customPrices, [product.id]: parseFloat(e.target.value) })}
                                                    className="pl-14 pr-8 py-5 bg-[var(--card)] border-2 border-[var(--border)] rounded-2xl text-xl font-black text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary w-52 text-right shadow-inner transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-8 items-center gap-6 border-t-4 border-[var(--border)]">
                                {success && (
                                    <span className="text-emerald-500 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">✓ Preços salvos com sucesso!</span>
                                )}
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        try {
                                            const { data: { session } } = await supabase.auth.getSession();
                                            const { error } = await supabase
                                                .from('profiles')
                                                .update({ custom_prices: customPrices })
                                                .eq('id', session?.user.id);

                                            if (error) throw error;

                                            updateUser({ custom_prices: customPrices });
                                            setSuccess(true);
                                            setTimeout(() => setSuccess(false), 3000);
                                        } catch (e: any) {
                                            alert("Erro ao salvar preços: " + e.message);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    disabled={loading}
                                    className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 border-2 border-white/10"
                                >
                                    {loading ? <Save size={20} className="animate-spin" strokeWidth={3} /> : <Save size={20} strokeWidth={3} />}
                                    {loading ? 'SALVANDO...' : 'SALVAR TABELA DE PREÇOS'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
