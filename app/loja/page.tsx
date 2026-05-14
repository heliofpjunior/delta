"use client";

import {
    Store,
    Plus,
    Share2,
    ExternalLink,
    QrCode,
    Edit3,
    Copy,
    Tag,
    CircleDollarSign,
    Package,
    Layers,
    Trash2,
    Link as LinkIcon,
    Link2,
    ChartBar,
    Zap,
    MousePointer2,
    Filter,
    Check,
    RefreshCw,
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useSimulation } from "@/components/SimulationProvider";
import { supabase } from "@/lib/supabase";

export default function LojaPage() {
    const { currentUser } = useSimulation();
    const { data: products, error: productsError } = useSWR("/api/products", fetcher);
    const { data: salesLinks, error: linksError, mutate: mutateLinks } = useSWR("sales_links", async () => {
        const { data, error } = await supabase
            .from('sales_links')
            .select('*, products(*)')
            .eq('vendedor_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    });

    const [activeTab, setActiveTab] = useState("Marketplace");
    const [categoryFilter, setCategoryFilter] = useState("Todos");
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedProductForLink, setSelectedProductForLink] = useState<any>(null);
    const [customLinkPrice, setCustomLinkPrice] = useState(0);
    const [customLinkSlug, setCustomLinkSlug] = useState("");
    const [isGenerating, setIsLinkGenerating] = useState(false);

    const categoryMap = {
        "Todos": "Todos",
        "CPF": "Pessoa Física",
        "CNPJ": "Pessoa Jurídica",
        "Específicos": "Específicos"
    };

    const handleGenerateLink = (product: any) => {
        setSelectedProductForLink(product);
        setCustomLinkPrice(currentUser.custom_prices?.[product.id] || product.price);
        setCustomLinkSlug(`${product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Math.random().toString(36).substring(2, 7)}`);
        setIsLinkModalOpen(true);
    };

    const saveSalesLink = async () => {
        setIsLinkGenerating(true);
        try {
            const { error } = await supabase.from('sales_links').insert({
                vendedor_id: currentUser.id,
                product_id: selectedProductForLink.id,
                custom_price: customLinkPrice,
                slug: customLinkSlug
            });
            if (error) throw error;
            setIsLinkModalOpen(false);
            mutateLinks();
            setActiveTab("Meus Links");
        } catch (e: any) {
            alert("Erro ao gerar link: " + e.message);
        } finally {
            setIsLinkGenerating(false);
        }
    };

    const deleteSalesLink = async (id: string) => {
        if (confirm("Deseja remover este link de venda?")) {
            await supabase.from('sales_links').delete().eq('id', id);
            mutateLinks();
        }
    };

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 bg-[var(--background)] min-h-screen">
            {/* ── Hub Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mx-4 -mt-8 p-10 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-[3rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white/20">
                            <Zap size={20} strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none">CENTRAL DE VENDAS</p>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase italic">Hub de Performance</h1>
                </div>

                {/* Quick Stats Header */}
                <div className="relative z-10 flex gap-4">
                    <div className="px-6 py-3 bg-[var(--card)] rounded-2xl border-2 border-[var(--border)] shadow-sm flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
                            <ChartBar size={18} />
                        </div>
                        <div>
                            <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Total de Cliques</p>
                            <p className="text-lg font-black text-[var(--foreground)]">{(salesLinks || []).reduce((acc: number, link: any) => acc + (link.clicks || 0), 0)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Navigation Tabs ── */}
            <div className="flex justify-center -mt-12 relative z-20">
                <div className="flex bg-[var(--card)] p-2 rounded-2xl border-2 border-[var(--border)] shadow-xl backdrop-blur-xl gap-2">
                    {["Marketplace", "Meus Links"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3",
                                activeTab === tab
                                    ? "bg-primary text-white shadow-lg scale-105"
                                    : "text-[var(--muted)] hover:text-primary hover:bg-[var(--background)]"
                            )}
                        >
                            {tab === "Marketplace" ? <Store size={16} strokeWidth={3} /> : <LinkIcon size={16} strokeWidth={3} />}
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Marketplace View ── */}
            {activeTab === "Marketplace" && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Produtos Disponíveis</h2>
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Escolha um produto para gerar seu link de venda personalizado.</p>
                        </div>

                        {/* Category Filter */}
                        <div className="flex p-1 bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-x-auto no-scrollbar">
                            {["Todos", "CPF", "CNPJ"].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        "px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                        categoryFilter === cat ? "bg-primary/10 text-primary" : "text-[var(--muted)] hover:text-primary"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {products?.filter((p: any) => categoryFilter === "Todos" || p.category === categoryFilter).map((product: any) => (
                            <div key={product.id} className="group bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-sm hover:shadow-2xl flex flex-col relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all" />

                                <div className="p-8 space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="size-14 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            <Package size={24} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest opacity-60 mb-1">Preço Público</p>
                                            <p className="text-xl font-black text-[var(--foreground)] tracking-tighter">R$ {product.price.toLocaleString('pt-BR')}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="px-3 py-1 bg-primary/10 text-primary text-[8px] font-black uppercase tracking-[0.2em] rounded-full border border-primary/20">{product.category}</span>
                                        <h3 className="text-lg font-black text-[var(--foreground)] uppercase tracking-tighter leading-tight pt-2">{product.name}</h3>
                                    </div>

                                    <div className="bg-[var(--background)] rounded-2xl border border-[var(--border)] p-4 flex items-center justify-between shadow-inner">
                                        <div>
                                            <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-60">Seu Repasse Padrão</p>
                                            <p className="text-base font-black text-emerald-500 tracking-tight">R$ {product.commission.toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-60">Sua Margem</p>
                                            <p className="text-sm font-black text-primary tracking-widest italic">{Math.round((product.commission/product.price)*100)}%</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleGenerateLink(product)}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg group-hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-primary-dark"
                                    >
                                        <Link2 size={16} strokeWidth={3} />
                                        GERAR LINK DE VENDA
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── My Links View ── */}
            {activeTab === "Meus Links" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 gap-4">
                        {!salesLinks && (
                            <div className="py-20 flex flex-col items-center justify-center text-[var(--muted)]">
                                <RefreshCw className="animate-spin mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Carregando seus links...</p>
                            </div>
                        )}

                        {salesLinks?.length === 0 && (
                            <div className="py-32 border-4 border-dashed border-[var(--border)] rounded-[3rem] text-center space-y-6">
                                <div className="size-16 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center mx-auto text-[var(--muted)]">
                                    <LinkIcon size={32} />
                                </div>
                                <div className="max-w-md mx-auto">
                                    <h5 className="text-sm font-black text-[var(--foreground)] uppercase tracking-widest mb-2">Nenhum Link Gerado</h5>
                                    <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider leading-relaxed">
                                        Vá até o Marketplace e comece a gerar seus primeiros links de venda personalizados para aumentar sua conversão.
                                    </p>
                                </div>
                            </div>
                        )}

                        {salesLinks?.map((link: any) => (
                            <div key={link.id} className="bg-[var(--card)] rounded-3xl border-2 border-[var(--border)] p-6 hover:border-primary/30 transition-all flex flex-col md:flex-row items-center gap-8 group shadow-sm">
                                <div className="size-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                    <Link2 size={28} />
                                </div>

                                <div className="flex-1 space-y-1 text-center md:text-left">
                                    <h4 className="text-sm font-black text-[var(--foreground)] uppercase tracking-tighter">{link.products?.name}</h4>
                                    <div className="flex items-center justify-center md:justify-start gap-4">
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">R$ {link.custom_price.toLocaleString('pt-BR')}</p>
                                        <span className="text-[9px] text-[var(--muted)] opacity-30">•</span>
                                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">{link.slug}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-center">
                                        <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Cliques</p>
                                        <div className="flex items-center justify-center gap-2">
                                            <MousePointer2 size={12} className="text-primary" />
                                            <span className="text-sm font-black">{link.clicks || 0}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://delta.com.br/l/${link.slug}`);
                                                alert("Link copiado!");
                                            }}
                                            className="px-6 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-primary hover:border-primary transition-all flex items-center gap-2"
                                        >
                                            <Copy size={12} strokeWidth={3} />
                                            COPIAR
                                        </button>
                                        <button
                                            onClick={() => deleteSalesLink(link.id)}
                                            className="size-10 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                                        >
                                            <Trash2 size={16} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Link Generation Modal ── */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-[var(--card)] w-full max-w-xl rounded-[3rem] border-2 border-primary/20 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tighter">Gerar Novo Link</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">PRODUTO: {selectedProductForLink?.name}</p>
                                </div>
                                <button onClick={() => setIsLinkModalOpen(false)} className="size-10 rounded-full hover:bg-primary/5 flex items-center justify-center text-[var(--muted)]">
                                    <Plus className="rotate-45" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Defina o Preço de Venda (R$)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-[var(--muted)] group-focus-within:text-primary transition-colors">R$</div>
                                        <input
                                            type="number"
                                            value={customLinkPrice}
                                            onChange={(e) => setCustomLinkPrice(parseFloat(e.target.value))}
                                            className="w-full pl-14 pr-8 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-xl font-black text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <div className="px-4 flex justify-between">
                                        <p className="text-[8px] font-bold text-[var(--muted)] uppercase italic">Sugerido: R$ {selectedProductForLink?.price}</p>
                                        <p className="text-[8px] font-bold text-emerald-500 uppercase">Seu Lucro Estimado: R$ {(customLinkPrice - (selectedProductForLink?.price - selectedProductForLink?.commission)).toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.3em] px-2">Identificador do Link (Personalizado)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-[var(--muted)] group-focus-within:text-primary transition-colors italic">delta.com.br/l/</div>
                                        <input
                                            type="text"
                                            value={customLinkSlug}
                                            onChange={(e) => setCustomLinkSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="w-full pl-32 pr-8 py-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black text-primary focus:ring-8 focus:ring-primary/5 focus:border-primary transition-all outline-none uppercase"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={saveSalesLink}
                                disabled={isGenerating}
                                className="w-full py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 border-b-4 border-primary-dark"
                            >
                                {isGenerating ? <RefreshCw className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                                {isGenerating ? "GERANDO..." : "CONFIRMAR E GERAR LINK"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
