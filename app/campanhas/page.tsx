"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import {
    Plus,
    Search,
    Ticket,
    TrendingUp,
    ArrowUpRight,
    Users,
    Calendar,
    Edit3,
    Trash2,
    RefreshCw,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useSimulation } from "@/components/SimulationProvider";
import { supabase } from "@/lib/supabase";
import CouponModal from "@/components/CouponModal";

export default function CampanhasPage() {
    const { currentUser } = useSimulation();
    const { data: coupons, error, mutate: mutateCoupons } = useSWR("coupons_fetch", async () => {
        const { data, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('vendedor_id', currentUser.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    });

    const { data: products } = useSWR("products_fetch", async () => {
        const { data, error } = await supabase
            .from('products')
            .select('id, name, type')
            .order('name', { ascending: true });
        if (error) throw error;
        return data;
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("Novo Cupom");

    const filteredCoupons = (coupons || []).filter((c: any) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAdd = () => {
        setSelectedCoupon(null);
        setModalTitle("Novo Cupom");
        setIsModalOpen(true);
    };

    const handleEdit = (coupon: any) => {
        setSelectedCoupon(coupon);
        setModalTitle("Editar Cupom");
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Deseja realmente excluir este cupom?")) {
            await supabase.from('coupons').delete().eq('id', id);
            mutateCoupons();
        }
    };

    const handleModalSubmit = async (data: any) => {
        try {
            // Conversao dos campos opcionais
            const parseProducts = data.applicableProducts 
                ? data.applicableProducts.split(',').map((p: string) => parseInt(p.trim())).filter((p: number) => !isNaN(p)) 
                : [];
                
            const parseDocs = data.allowedDocs 
                ? data.allowedDocs.split(',').map((d: string) => d.replace(/\D/g, '')).filter((d: string) => d.length > 0) 
                : [];

            const couponData = {
                vendedor_id: currentUser.id,
                code: data.code.toUpperCase(),
                discount_value: parseFloat(data.discountValue),
                discount_type: data.discountType,
                active: true,
                expires_at: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
                applicable_products: parseProducts,
                allowed_docs: parseDocs
            };

            if (selectedCoupon) {
                const { error } = await supabase.from('coupons').update(couponData).eq('id', selectedCoupon.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('coupons').insert(couponData);
                if (error) throw error;
            }
            setIsModalOpen(false);
            mutateCoupons();
        } catch (e: any) {
            alert("Erro ao salvar cupom: " + e.message);
        }
    };

    const totalUsages = (coupons || []).reduce((acc: number, c: any) => acc + (c.usage_count || 0), 0);

    return (
        <div className="p-4 lg:p-8 space-y-8 animate-in fade-in duration-700 bg-[var(--background)] min-h-screen">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 -mx-4 -mt-8 p-10 bg-gradient-to-br from-[var(--background)] to-emerald-500/5 border-b border-[var(--border)] rounded-b-[3rem] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white/20">
                            <Ticket size={20} strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] leading-none">INCENTIVOS E CUPONS</p>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase italic">Campanhas de Desconto</h1>
                </div>

                <button
                    onClick={handleAdd}
                    className="relative z-10 bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all border-b-4 border-emerald-700"
                >
                    <Plus size={20} strokeWidth={3} />
                    CRIAR NOVO CUPOM
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] overflow-hidden shadow-sm">
                        <div className="p-8 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--background)]/50">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] flex items-center gap-3">
                                <Sparkles size={14} className="text-emerald-500" />
                                Cupons Disponíveis
                            </h3>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-emerald-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="BUSCAR CÓDIGO..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/40 transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-[var(--border)]">
                            {!coupons && !error && (
                                <div className="py-20 flex flex-col items-center justify-center">
                                    <RefreshCw className="animate-spin text-emerald-500 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)]">Sincronizando Cupons...</p>
                                </div>
                            )}

                            {filteredCoupons.length === 0 && (
                                <div className="py-20 text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--muted)] opacity-50 italic">Nenhum cupom encontrado</p>
                                </div>
                            )}

                            {filteredCoupons.map((coupon: any) => (
                                <div key={coupon.id} className="p-6 md:p-8 hover:bg-emerald-500/[0.02] transition-colors group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="size-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white/20 group-hover:scale-110 transition-transform">
                                            <Ticket size={28} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">{coupon.code}</h4>
                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded border border-emerald-500/20">ATIVO</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                                                {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `R$ ${coupon.discount_value} OFF`}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-center">
                                            <p className="text-[7px] font-black text-[var(--muted)] uppercase tracking-widest mb-1 opacity-60">Utilizações</p>
                                            <p className="text-lg font-black text-[var(--foreground)]">{coupon.usage_count || 0}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleEdit(coupon)}
                                                className="size-11 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-sm"
                                            >
                                                <Edit3 size={18} strokeWidth={2.5} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coupon.id)}
                                                className="size-11 rounded-xl bg-[var(--background)] border-2 border-[var(--border)] flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-600 transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-emerald-500 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-500/20 border-4 border-white/10 relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 size-40 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10 space-y-6">
                            <div className="size-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <TrendingUp size={28} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Impacto de Campanhas</p>
                                <h4 className="text-4xl font-black tracking-tighter mb-4">{totalUsages} <span className="text-sm opacity-60">USOS</span></h4>
                                <div className="inline-flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10">
                                    <ArrowUpRight size={14} />
                                    Crescimento Contínuo
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] rounded-[2.5rem] border-2 border-[var(--border)] p-10 space-y-8 shadow-sm">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 flex items-center gap-3">
                            <Sparkles size={14} />
                            Dicas de Conversão
                        </h3>
                        <div className="space-y-4">
                            <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] group hover:border-emerald-500/30 transition-colors">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">Estratégia</p>
                                <p className="text-xs font-bold text-[var(--foreground)] uppercase leading-relaxed">Use cupons de valor fixo (R$) para fechamentos rápidos no WhatsApp.</p>
                            </div>
                            <div className="p-6 bg-[var(--background)] rounded-2xl border border-[var(--border)] group hover:border-emerald-500/30 transition-colors">
                                <p className="text-[9px] font-black text-emerald-500 uppercase mb-2">Urgência</p>
                                <p className="text-xs font-bold text-[var(--foreground)] uppercase leading-relaxed">Crie cupons com o nome do mês para passar a ideia de tempo limitado.</p>
                            </div>
                        </div>
                        <button className="w-full py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white hover:border-emerald-600 transition-all flex items-center justify-center gap-3 group">
                            Ver Relatório Detalhado
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedCoupon}
                title={modalTitle}
                products={products || []}
            />
        </div>
    );
}
