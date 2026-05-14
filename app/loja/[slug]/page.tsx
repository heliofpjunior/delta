"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    Store,
    Package,
    Zap,
    ShieldCheck,
    Star,
    Award,
    CheckCircle2,
    ArrowRight,
    Loader2
} from "lucide-react";

const getSupabaseErrorMessage = (error: any) => {
    if (!error) return "Sem detalhes";
    if (typeof error === "string") return error;

    const parts = [
        error.message,
        error.details,
        error.hint,
        error.code ? `Codigo: ${error.code}` : null
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" | ") : JSON.stringify(error);
};

export default function BrandedStorePage() {
    const { slug } = useParams();
    const router = useRouter();
    const [vendor, setVendor] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const fetchStoreData = async () => {
            try {
                const { data: profile, error: profileError } = await supabase
                    .from("profiles")
                    .select("id, full_name, avatar_url, store_slug, store_branding, custom_prices, is_public_store_active")
                    .eq("store_slug", slug)
                    .eq("is_public_store_active", true)
                    .single();

                if (profileError || !profile) {
                    console.error("Loja nao encontrada ou indisponivel:", getSupabaseErrorMessage(profileError), profileError);
                    setNotFound(true);
                    return;
                }

                const { data: productsData, error: productsError } = await supabase
                    .from("products")
                    .select("id, name, description, price, commission, category, type, is_active")
                    .eq("is_active", true)
                    .order("name");

                if (productsError) {
                    throw productsError;
                }

                setVendor(profile);
                setProducts(productsData || []);

                localStorage.setItem("delta_attribution", JSON.stringify({
                    vendedor_id: profile.id,
                    timestamp: new Date().getTime()
                }));
            } catch (e) {
                console.error("Erro ao carregar loja:", getSupabaseErrorMessage(e), e);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchStoreData();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4 px-6">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Carregando loja</p>
            </div>
        );
    }

    if (notFound || !vendor) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6 px-6 text-center">
                <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                    <Store size={40} className="text-primary" />
                </div>
                <div className="space-y-2 max-w-md">
                    <h1 className="text-2xl font-black text-[var(--foreground)] uppercase leading-tight">Loja indisponivel</h1>
                    <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest leading-relaxed">
                        Este canal de vendas nao foi encontrado ou ainda nao esta ativo.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="min-h-12 px-8 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg"
                >
                    Voltar ao inicio
                </button>
            </div>
        );
    }

    const branding = vendor.store_branding || {};
    const primaryColor = branding.primary_color || "#3B82F6";

    return (
        <div className="min-h-screen bg-[var(--background)] font-sans overflow-x-hidden">
            <header className="relative overflow-hidden px-4 pt-8 pb-24 sm:pt-12 sm:pb-28 lg:pt-20 lg:pb-32">
                <div className="absolute inset-0 bg-primary/5 blur-[120px] -z-10" />
                <div className="max-w-6xl mx-auto flex flex-col items-center text-center space-y-6 sm:space-y-8">
                    <div className="size-20 sm:size-24 lg:size-28 rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem] bg-white shadow-2xl border-4 border-[var(--border)] overflow-hidden flex items-center justify-center relative animate-in zoom-in-50 duration-700 shrink-0">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: primaryColor }} />
                        {vendor.avatar_url ? (
                            <img src={vendor.avatar_url} alt={vendor.full_name} className="w-full h-full object-cover" />
                        ) : (
                            <Store className="size-9 sm:size-11 lg:size-12" style={{ color: primaryColor }} />
                        )}
                    </div>

                    <div className="space-y-4 max-w-3xl">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 leading-none">
                                Parceiro Oficial Delta
                            </span>
                            <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                                ))}
                            </div>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--foreground)] uppercase leading-[0.95] break-words">
                            {vendor.full_name}
                        </h1>
                        <p className="text-xs sm:text-sm font-bold text-[var(--muted)] uppercase tracking-wider leading-relaxed max-w-2xl mx-auto">
                            {branding.bio || "Especialista em Certificacao Digital. Emita seu certificado com seguranca e atendimento personalizado."}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 pt-2 sm:pt-4 w-full max-w-2xl">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--card)]/70 border border-[var(--border)]">
                            <ShieldCheck size={18} className="text-emerald-500 shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Seguranca ICP-Brasil</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[var(--card)]/70 border border-[var(--border)]">
                            <Zap size={18} className="text-primary shrink-0" />
                            <span className="text-[9px] sm:text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Emissao Instantanea</span>
                        </div>
                    </div>

                    <a
                        href="#produtos"
                        className="inline-flex min-h-12 items-center justify-center gap-3 px-7 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Ver produtos
                        <ArrowRight size={16} strokeWidth={3} />
                    </a>
                </div>
            </header>

            <main id="produtos" className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 pb-14 sm:pb-20 scroll-mt-6">
                {products.length === 0 && (
                    <div className="bg-[var(--card)] rounded-[2rem] border-2 border-[var(--border)] p-8 sm:p-12 text-center shadow-xl">
                        <div className="size-14 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center mx-auto mb-5 text-primary">
                            <Package size={28} />
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] uppercase tracking-tight mb-2">Nenhum produto disponivel</h2>
                        <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest leading-relaxed max-w-md mx-auto">
                            Esta loja esta ativa, mas ainda nao possui produtos liberados para venda publica.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {products.map((product) => {
                        const customPrice = vendor.custom_prices?.[product.id] || product.price;
                        const savings = product.price - customPrice;

                        return (
                            <article key={product.id} className="group bg-[var(--card)] rounded-[1.75rem] sm:rounded-[2rem] lg:rounded-[2.5rem] border-2 border-[var(--border)] overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-xl flex flex-col relative">
                                <div className="p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="size-12 sm:size-14 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                                            <Package className="size-5 sm:size-6" strokeWidth={2.5} />
                                        </div>
                                        {savings > 0 && (
                                            <div className="bg-emerald-500 text-white px-3 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                                                -{Math.round((savings / product.price) * 100)}% OFF
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2 min-h-[92px] sm:min-h-[108px]">
                                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] break-words">{product.category}</p>
                                        <h2 className="text-lg sm:text-xl font-black text-[var(--foreground)] uppercase leading-tight break-words">{product.name}</h2>
                                        {product.description && (
                                            <p className="text-[11px] font-bold text-[var(--muted)] leading-relaxed line-clamp-2">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        {savings > 0 && (
                                            <p className="text-xs font-bold text-[var(--muted)] line-through">
                                                R$ {product.price.toLocaleString("pt-BR")}
                                            </p>
                                        )}
                                        <p className="text-3xl sm:text-4xl font-black text-[var(--foreground)] leading-none">
                                            <span className="text-sm font-bold align-top mt-1 mr-1">R$</span>
                                            {customPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                                        <div className="flex items-start gap-3 text-[9px] font-black text-[var(--muted)] uppercase tracking-widest leading-relaxed">
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            Validade de {product.type === "PF" ? "12 a 36 meses" : "12 meses"}
                                        </div>
                                        <div className="flex items-start gap-3 text-[9px] font-black text-[var(--muted)] uppercase tracking-widest leading-relaxed">
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            Suporte VIP incluso
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => router.push(`/checkout?product=${product.id}`)}
                                        className="w-full min-h-14 mt-auto rounded-[1.25rem] sm:rounded-[1.5rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.18em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-white border-b-4 px-4"
                                        style={{ backgroundColor: primaryColor, borderColor: "rgba(0,0,0,0.1)" }}
                                    >
                                        Comprar agora
                                        <ArrowRight size={18} strokeWidth={3} />
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <footer className="mt-12 sm:mt-20 pt-12 sm:pt-20 border-t border-[var(--border)] text-center space-y-10 sm:space-y-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
                        <div className="min-h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-2 flex flex-col items-center justify-center">
                            <Award size={28} className="text-primary opacity-50" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Certificadora<br />Autorizada</p>
                        </div>
                        <div className="min-h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-2 flex flex-col items-center justify-center">
                            <ShieldCheck size={28} className="text-primary opacity-50" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Criptografia<br />de Ponta</p>
                        </div>
                        <div className="min-h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-2 flex flex-col items-center justify-center">
                            <Zap size={28} className="text-primary opacity-50" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Atendimento<br />via WhatsApp</p>
                        </div>
                        <div className="min-h-28 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-4 space-y-2 flex flex-col items-center justify-center">
                            <CheckCircle2 size={28} className="text-primary opacity-50" />
                            <p className="text-[8px] font-black uppercase tracking-widest text-[var(--muted)]">Aprovacao<br />Garantida</p>
                        </div>
                    </div>

                    <p className="text-[8px] font-bold text-[var(--muted)] uppercase tracking-[0.22em] sm:tracking-[0.4em] opacity-40 leading-relaxed px-3">
                        &copy; 2026 Delta Plataforma de Certificacao Digital. Todos os direitos reservados.
                    </p>
                </footer>
            </main>
        </div>
    );
}
