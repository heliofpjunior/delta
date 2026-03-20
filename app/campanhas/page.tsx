"use client";

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
    Trash2
} from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import useSWR, { mutate } from "swr";
import { useSimulation } from "@/components/SimulationProvider";
import axios from "axios";
import CouponModal from "@/components/CouponModal";

export default function CampanhasPage() {
    const { currentUser } = useSimulation();
    const { data: coupons, error } = useSWR(`/api/campanhas?seller=${currentUser.role === 'admin' ? 'admin' : currentUser.name}`, fetcher);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
    const [modalTitle, setModalTitle] = useState("Novo Cupom");

    const filteredCoupons = (coupons || []).filter((c: any) =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.influencer.toLowerCase().includes(searchTerm.toLowerCase())
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

    const handleDelete = async (id: number) => {
        if (confirm("Deseja realmente excluir este cupom?")) {
            await axios.delete(`/api/campanhas?id=${id}`);
            mutate(`/api/campanhas?seller=${currentUser.role === 'admin' ? 'admin' : currentUser.name}`);
        }
    };

    const handleModalSubmit = async (data: any) => {
        if (selectedCoupon) {
            await axios.put("/api/campanhas", { ...data, id: selectedCoupon.id });
        } else {
            await axios.post("/api/campanhas", { ...data, seller: currentUser.name });
        }
        setIsModalOpen(false);
        mutate(`/api/campanhas?seller=${currentUser.role === 'admin' ? 'admin' : currentUser.name}`);
    };

    return (
        <div className="p-4 lg:p-12 space-y-12">
            {/* ── High-Realce Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 -mx-8 -mt-10 p-12 bg-[var(--background)] border-b-8 border-[var(--border)] rounded-b-[4rem] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white/20">
                            <Ticket size={16} strokeWidth={3} />
                        </div>
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.5em] leading-none">PROGRAMA DE AFILIADOS</p>
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter text-[var(--foreground)] leading-none uppercase">Campanhas & Cupons</h1>
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
                    <button
                        onClick={handleAdd}
                        className="bg-primary text-white px-10 py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] flex items-center justify-center gap-4 shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.05] border-2 border-white/10 active:scale-95 transition-all"
                    >
                        <Plus size={22} strokeWidth={3} />
                        CRIAR NOVO CUPOM
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--card)] rounded-[3rem] border-4 border-[var(--border)] overflow-hidden shadow-2xl flex flex-col">
                        {/* Header & Search */}
                        <div className="p-10 border-b-4 border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-6 bg-[var(--background)]/50">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4">
                                <div className="size-3 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                                Cupons Ativos
                            </h3>
                            <div className="relative w-full sm:w-72 group focus-within:w-80 transition-all">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" size={18} strokeWidth={3} />
                                <input
                                    type="text"
                                    placeholder="FILTRAR CUPONS..."
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-primary/40 transition-all placeholder:opacity-30"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Table / List */}
                        <div className="overflow-x-auto">
                            {!coupons && !error && (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Carregando Campanhas...</p>
                                </div>
                            )}
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)]/30 border-b-2 border-[var(--border)]">
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-50">Código / Desconto</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-50">Influenciador</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-50 text-center">Usos</th>
                                        <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-50 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-[var(--border)]">
                                    {filteredCoupons.map((coupon: any) => (
                                        <tr key={coupon.id} className="group hover:bg-[var(--background)]/50 transition-all">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-white/20 group-hover:scale-110 transition-transform">
                                                        <Ticket size={24} strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-[var(--foreground)] uppercase tracking-tighter leading-none group-hover:text-primary transition-colors">{coupon.code}</p>
                                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">{coupon.discount} OFF</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-black text-[var(--foreground)] uppercase tracking-tight opacity-80">{coupon.influencer}</span>
                                                    <span className="inline-flex items-center text-[9px] font-black text-primary uppercase tracking-widest opacity-40">{coupon.products}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-center">
                                                <div className="inline-flex flex-col items-center px-4 py-2 bg-[var(--background)] rounded-xl border border-[var(--border)] shadow-inner">
                                                    <p className="text-lg font-black text-[var(--foreground)] leading-none">{coupon.usages}</p>
                                                    <p className="text-[8px] text-[var(--muted)] font-black uppercase tracking-widest opacity-40 mt-1">TOTAL</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => handleEdit(coupon)}
                                                        className="size-12 rounded-xl flex items-center justify-center text-primary bg-primary/5 hover:bg-primary hover:text-white border-2 border-primary/20 hover:border-primary transition-all shadow-lg active:scale-90"
                                                    >
                                                        <Edit3 size={18} strokeWidth={2.5} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="size-12 rounded-xl flex items-center justify-center text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white border-2 border-rose-500/20 hover:border-rose-500 transition-all shadow-lg active:scale-90"
                                                    >
                                                        <Trash2 size={18} strokeWidth={2.5} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Performance Card */}
                    <div className="bg-primary rounded-[3rem] p-10 text-white shadow-[0_20px_50px_-10px_rgba(var(--primary-rgb),0.4)] border-4 border-white/20 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 size-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <div className="relative z-10 flex justify-between items-start mb-10">
                            <div className="size-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-xl">
                                <TrendingUp size={28} strokeWidth={3} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">PERFORMANCE</span>
                        </div>
                        <div className="relative z-10 space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">VENDAS VIA CUPOM</p>
                            <h4 className="text-5xl font-black tracking-tighter mb-6">R$ 12.450</h4>
                            <div className="inline-flex items-center gap-3 px-4 py-2 bg-emerald-400 text-emerald-950 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg">
                                <ArrowUpRight size={14} strokeWidth={3} />
                                <span>+24% ESTE MÊS</span>
                            </div>
                        </div>
                    </div>

                    {/* Insights Card */}
                    <div className="bg-[var(--card)] rounded-[3rem] border-4 border-[var(--border)] p-10 shadow-2xl space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-4">
                            <div className="size-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />
                            Insights de Campanha
                        </h3>
                        <div className="space-y-5">
                            <div className="p-8 bg-[var(--background)] rounded-[2rem] border-2 border-[var(--border)] shadow-inner space-y-4 hover:border-primary/40 transition-all group">
                                <div className="flex gap-3 items-center">
                                    <Users size={20} strokeWidth={3} className="text-primary/40 group-hover:text-primary transition-colors" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60">Influenciador Top</p>
                                </div>
                                <p className="text-lg font-black text-[var(--foreground)] uppercase group-hover:text-primary transition-colors">@contabilidade_vlog</p>
                            </div>
                            <div className="p-8 bg-[var(--background)] rounded-[2rem] border-2 border-[var(--border)] shadow-inner space-y-4 hover:border-emerald-500/40 transition-all group">
                                <div className="flex gap-3 items-center">
                                    <Calendar size={20} strokeWidth={3} className="text-emerald-500/40 group-hover:text-emerald-500 transition-colors" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--muted)] opacity-60">Pico de Conversão</p>
                                </div>
                                <p className="text-lg font-black text-[var(--foreground)] uppercase group-hover:text-emerald-500 transition-colors">Segundas-feiras <span className="text-[10px] opacity-40">(09h-11h)</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CouponModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                initialData={selectedCoupon}
                title={modalTitle}
            />
        </div>
    );
}
