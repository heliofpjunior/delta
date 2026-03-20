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
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { fetcher } from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useSimulation } from "@/components/SimulationProvider";
import { supabase } from "@/lib/supabase";
import ProductModal from "@/components/ProductModal";
import axios from "axios";

export default function LojaPage() {
    const { currentUser } = useSimulation();
    const { data: products, error } = useSWR("/api/products", fetcher);
    const { data: supplierProducts } = useSWR("supplier_products_list", async () => {
        const { data, error } = await supabase.from('supplier_products').select('*');
        if (error) throw error;
        return data;
    });
    const [activeTab, setActiveTab] = useState("Todos");

    // Management state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("Novo Produto");

    const isAdmin = currentUser.role === "admin";
    const categoryMap = {
        "Todos": "Todos",
        "CPF": "Pessoa Física",
        "CNPJ": "Pessoa Jurídica",
        "Específicos": "Específicos"
    };

    const handleAdd = () => {
        setSelectedProduct(null);
        setModalTitle("Novo Produto");
        setIsModalOpen(true);
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setModalTitle("Editar Produto");
        setIsModalOpen(true);
    };

    const handleDelete = async (id: any) => {
        if (confirm("Tem certeza que deseja excluir este produto do catálogo?")) {
            await axios.delete(`/api/sales?id=${id}`);
            mutate("/api/sales");
        }
    };

    const handleModalSubmit = async (data: any) => {
        if (selectedProduct) {
            await axios.put("/api/sales", { ...data, id: selectedProduct.id });
        } else {
            await axios.post("/api/sales", data);
        }
        setIsModalOpen(false);
        mutate("/api/sales");
    };

    return (
        <div className="p-3.5 space-y-1.5 animate-in fade-in duration-700">
            {/* High-Realce Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-3.5 -mt-3.5 p-6 bg-gradient-to-br from-[var(--background)] to-primary/5 border-b border-[var(--border)] rounded-b-xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border border-white/20">
                            <Store size={14} strokeWidth={3} />
                        </div>
                        <p className="text-[8px] font-black text-primary uppercase tracking-[0.4em] leading-none opacity-80">MARKETPLACE</p>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] leading-none uppercase">Links de Venda</h1>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-[9px] uppercase tracking-[0.15em] flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.02] border border-white/10 active:scale-95 transition-all text-center"
                    >
                        <Plus size={16} strokeWidth={3} />
                        NOVO PRODUTO
                    </button>
                )}
            </div>

            {/* High-Realce Category Filter */}
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-1.5 shadow-sm inline-flex max-w-full mt-1.5">
                <div className="flex p-0.5 bg-[var(--background)] rounded-lg border border-[var(--border)] overflow-x-auto no-scrollbar shadow-inner">
                    {["Todos", "CPF", "CNPJ", "Específicos"].map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveTab(category)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-[8px] font-bold uppercase tracking-[0.15em] transition-all whitespace-nowrap flex items-center gap-2",
                                activeTab === category
                                    ? "bg-primary text-white shadow-sm scale-105"
                                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)] opacity-60"
                            )}
                        >
                            {category === "Todos" && <Layers size={12} strokeWidth={3} />}
                            {category === "CPF" && <Tag size={12} strokeWidth={3} />}
                            {category === "CNPJ" && <Package size={12} strokeWidth={3} />}
                            {category === "Específicos" && <Store size={12} strokeWidth={3} />}
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* High-Realce Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!products && !error && (
                    <div className="col-span-full py-40 flex flex-col items-center justify-center gap-6">
                        <div className="size-16 border-8 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-primary font-black uppercase tracking-[0.5em] text-xs">Sincronizando Marketplace...</p>
                    </div>
                )}

                {error && (
                    <div className="col-span-full p-8 bg-rose-600 text-white rounded-2xl border-2 border-white/20 flex items-center gap-6 shadow-xl shadow-rose-600/30">
                        <Package size={28} strokeWidth={3} />
                        <div className="text-sm font-black uppercase tracking-[0.2em]">
                            ERRO AO CARREGAR CATÁLOGO. VERIFIQUE AS TABELAS DO BANCO.
                        </div>
                    </div>
                )}

                {(products || []).filter((p: any) => activeTab === "Todos" || p.category === categoryMap[activeTab as keyof typeof categoryMap] || p.category === activeTab).map((product: any) => (
                    <div key={product.id} className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden shadow-sm hover:border-primary/40 transition-all duration-500 flex flex-col group relative">
                        <div className="p-5 flex-1 space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="size-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <Package size={20} strokeWidth={3} />
                                </div>
                                <div className="text-right flex flex-col items-end gap-0.5">
                                    <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-[0.2em] opacity-40 italic">Preço Sugerido</p>
                                    <p className="text-lg font-bold text-[var(--foreground)] tracking-tight leading-none">
                                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>

                                    {isAdmin && (
                                        <div className="flex gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="size-6 flex items-center justify-center bg-[var(--background)] text-blue-500 border border-[var(--border)] rounded-md hover:bg-blue-500 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                                            >
                                                <Edit3 size={11} strokeWidth={3} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="size-6 flex items-center justify-center bg-[var(--background)] text-rose-500 border border-[var(--border)] rounded-md hover:bg-rose-500 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                                            >
                                                <Trash2 size={11} strokeWidth={3} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <h3 className="text-base font-bold text-[var(--foreground)] uppercase tracking-tight leading-none">{product.name}</h3>
                                <div className="flex items-center gap-1.5">
                                    <span className="px-2 py-0.5 bg-[var(--background)] border border-[var(--border)] rounded-md text-[6px] font-bold text-[var(--muted)] uppercase tracking-widest shadow-sm">{product.category}</span>
                                    <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md text-[6px] font-bold text-primary uppercase tracking-widest shadow-sm">{product.type}</span>
                                </div>
                            </div>

                            <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-3 flex items-center justify-between shadow-inner">
                                <div className="space-y-0.5">
                                    <p className="text-[7px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] opacity-40">Seu Repasse</p>
                                    <p className="text-sm font-bold text-emerald-600 tracking-tight">
                                        {product.commission.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </p>
                                </div>
                                <div className="h-6 w-px bg-[var(--border)] rounded-full opacity-30 shadow-inner"></div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-[7px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] opacity-40">Margem</p>
                                    <p className="text-sm font-bold text-indigo-500 tracking-tight">
                                        {(product.commission / product.price * 100).toFixed(0)}%
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border)]">
                                <button className="flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-lg font-bold text-[8px] uppercase tracking-[0.1em] shadow-md border border-white/10 hover:scale-[1.02] active:scale-95 transition-all">
                                    <Copy size={12} strokeWidth={3} />
                                    Copiar Link
                                </button>
                                <button className="flex items-center justify-center gap-2 py-2.5 bg-[var(--background)] text-[var(--foreground)] border border-[var(--border)] rounded-lg font-bold text-[8px] uppercase tracking-[0.1em] shadow-sm hover:bg-[var(--card)] hover:border-primary/40 active:scale-95 transition-all">
                                    <QrCode size={12} strokeWidth={3} />
                                    QR Code
                                </button>
                            </div>

                            <div className="flex items-center justify-between pt-2 opacity-30 hover:opacity-100 transition-opacity">
                                <button className="text-[7px] font-bold uppercase tracking-widest text-[var(--muted)] hover:text-primary transition-colors flex items-center gap-1.5">
                                    <Edit3 size={11} strokeWidth={3} />
                                    Customizar
                                </button>
                                <div className="flex gap-2.5">
                                    <button className="size-6 rounded-md bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-primary transition-all">
                                        <Share2 size={11} strokeWidth={3} />
                                    </button>
                                    <button className="size-6 rounded-md bg-[var(--background)] border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-primary transition-all">
                                        <ExternalLink size={11} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {products?.length === 0 && (
                <div className="py-32 flex flex-col items-center justify-center text-center px-8 bg-[var(--card)] rounded-3xl border-4 border-dashed border-[var(--border)] shadow-inner relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/5 blur-[150px] pointer-events-none" />
                    <div className="size-20 rounded-2xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--muted)] mb-8 shadow-xl">
                        <Store size={40} strokeWidth={2.5} className="opacity-20" />
                    </div>
                    <h2 className="text-3xl font-black mb-3 uppercase tracking-tighter text-[var(--foreground)]">Marketplace Vazio</h2>
                    <p className="text-[var(--muted)] text-xs max-w-sm mb-10 font-black uppercase tracking-[0.15em] opacity-40 leading-relaxed italic">Nenhum produto está disponível para venda direta neste momento.</p>
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedProduct}
                supplierProducts={supplierProducts || []}
                title={modalTitle}
            />
        </div>
    );
}
