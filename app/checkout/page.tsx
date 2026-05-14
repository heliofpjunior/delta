"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    CheckCircle2,
    CreditCard,
    ShieldCheck,
    Zap,
    ArrowRight,
    ChevronLeft,
    Tag,
    Loader2,
    Lock,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get("product");
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [attribution, setAttribution] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [basePrice, setBasePrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");

    const [formData, setForm] = useState({
        name: "",
        doc: "",
        email: "",
        phone: "",
        zip: ""
    });

    useEffect(() => {
        const initCheckout = async () => {
            if (!productId) {
                router.push("/");
                return;
            }

            const { data: prod } = await supabase
                .from("products")
                .select("*")
                .eq("id", productId)
                .single();

            if (!prod) {
                router.push("/");
                return;
            }

            setProduct(prod);

            const attrJson = localStorage.getItem("delta_attribution");
            if (attrJson) {
                const attr = JSON.parse(attrJson);
                setAttribution(attr);

                const { data: profile } = await supabase
                    .from("profiles")
                    .select("custom_prices")
                    .eq("id", attr.vendedor_id)
                    .single();

                const customPrice = Number(profile?.custom_prices?.[productId] || attr.custom_price || prod.price);
                setBasePrice(customPrice);
                setFinalPrice(customPrice);
            } else {
                setBasePrice(Number(prod.price));
                setFinalPrice(Number(prod.price));
            }

            const pendingCoupon = localStorage.getItem("delta_pending_coupon");
            if (pendingCoupon) setCouponCode(pendingCoupon);

            setLoading(false);
        };

        initCheckout();
    }, [productId, router]);

    const handleApplyCoupon = async () => {
        const normalizedCode = couponCode.trim().toUpperCase();
        setCouponError("");

        if (appliedCoupon) {
            setCouponError("Um cupom ja foi aplicado neste pedido. Remova o cupom atual para usar outro.");
            return;
        }

        if (!normalizedCode) {
            setCouponError("Informe um codigo de cupom.");
            return;
        }

        const { data: coupon, error } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", normalizedCode)
            .eq("active", true)
            .single();

        if (error || !coupon) {
            setCouponError("Cupom invalido ou expirado.");
            return;
        }

        if (attribution && coupon.vendedor_id !== attribution.vendedor_id) {
            setCouponError("Este cupom nao pertence a este parceiro.");
            return;
        }

        if (coupon.min_purchase && basePrice < Number(coupon.min_purchase)) {
            setCouponError(`Compra minima de R$ ${Number(coupon.min_purchase).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`);
            return;
        }

        let discountAmount = 0;
        if (coupon.discount_type === "percent") {
            discountAmount = basePrice * (Number(coupon.discount_value) / 100);
            if (coupon.max_discount) {
                discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
            }
        } else {
            discountAmount = Number(coupon.discount_value);
        }

        setAppliedCoupon(coupon);
        setCouponCode(normalizedCode);
        setFinalPrice(Math.max(0, basePrice - discountAmount));
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
        setFinalPrice(basePrice);
    };

    const couponSavings = appliedCoupon ? Math.max(0, basePrice - finalPrice) : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--background)] py-8 sm:py-12 px-4 sm:px-6 flex flex-col items-center">
            <div className="w-full max-w-4xl mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Checkout Seguro</h1>
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest flex items-center gap-2">
                            <ShieldCheck size={12} className="text-emerald-500" />
                            Ambiente 100% criptografado
                        </p>
                    </div>
                </div>

                <div className="w-full md:w-auto grid grid-cols-[1fr_auto_1fr] md:flex items-center gap-4 md:gap-6 bg-[var(--card)] md:bg-transparent border md:border-0 border-[var(--border)] rounded-2xl md:rounded-none p-4 md:p-0">
                    <div className="text-left md:text-right min-w-0">
                        <p className="text-[8px] sm:text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Voce esta comprando</p>
                        <p className="text-xs sm:text-sm font-black text-[var(--foreground)] uppercase tracking-tight truncate">{product.name}</p>
                    </div>
                    <div className="h-10 w-px bg-[var(--border)]" />
                    <div className="text-right">
                        <p className="text-[8px] sm:text-[9px] font-black text-primary uppercase tracking-widest">Total</p>
                        <p className="text-xl sm:text-2xl font-black text-primary tracking-tight">R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-3xl bg-[var(--card)] rounded-[2rem] sm:rounded-[3rem] border-2 border-[var(--border)] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-5 sm:p-8 bg-[var(--background)]/50 border-b border-[var(--border)] flex justify-between relative">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-3 relative z-10">
                            <div className={cn(
                                "size-10 rounded-full flex items-center justify-center font-black text-sm transition-all border-4",
                                step === s ? "bg-primary text-white border-white dark:border-slate-900 shadow-xl" :
                                    step > s ? "bg-emerald-500 text-white border-white dark:border-slate-900" :
                                        "bg-[var(--card)] text-[var(--muted)] border-[var(--border)]"
                            )}>
                                {step > s ? <CheckCircle2 size={18} /> : s}
                            </div>
                            <span className={cn(
                                "text-[8px] sm:text-[9px] font-black uppercase tracking-widest",
                                step === s ? "text-primary" : "text-[var(--muted)]"
                            )}>
                                {s === 1 ? "Identificacao" : s === 2 ? "Contato" : "Pagamento"}
                            </span>
                        </div>
                    ))}
                    <div className="absolute top-[2.8rem] sm:top-[3.2rem] inset-x-12 sm:inset-x-20 h-1 bg-[var(--border)] -z-0 rounded-full">
                        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step - 1) * 50}%` }} />
                    </div>
                </div>

                <div className="p-5 sm:p-10 min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setForm({ ...formData, name: e.target.value })}
                                        className="w-full px-5 sm:px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Ex: Joao Silva"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CPF ou CNPJ</label>
                                    <input
                                        type="text"
                                        value={formData.doc}
                                        onChange={e => setForm({ ...formData, doc: e.target.value })}
                                        className="w-full px-5 sm:px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                        placeholder="Apenas numeros"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">E-mail de Recebimento</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setForm({ ...formData, email: e.target.value })}
                                        className="w-full px-5 sm:px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all lowercase"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div className={cn(
                                "border-2 p-5 sm:p-6 rounded-[2rem] space-y-5 transition-all",
                                appliedCoupon ? "bg-emerald-500/5 border-emerald-500/20" : "bg-primary/5 border-primary/10"
                            )}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center border shrink-0",
                                        appliedCoupon ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {appliedCoupon ? <CheckCircle2 size={24} /> : <Tag size={24} />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            appliedCoupon ? "text-emerald-600" : "text-primary"
                                        )}>
                                            {appliedCoupon ? "Cupom aplicado" : "Tem um cupom de desconto?"}
                                        </p>
                                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider leading-relaxed">
                                            {appliedCoupon
                                                ? "Este pedido ja possui um cupom ativo. Para usar outro, remova o cupom atual primeiro."
                                                : "Use apenas um cupom por pedido. O desconto e calculado sobre o valor original da compra."}
                                        </p>
                                    </div>
                                </div>

                                {appliedCoupon ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-stretch">
                                        <div className="bg-[var(--card)] border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Codigo</p>
                                                <p className="text-lg font-black text-emerald-600 uppercase tracking-widest">{appliedCoupon.code}</p>
                                            </div>
                                            <div className="text-left sm:text-right">
                                                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest">Economia</p>
                                                <p className="text-lg font-black text-emerald-600">
                                                    R$ {couponSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="min-h-12 px-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/40 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={14} strokeWidth={3} />
                                            Remover
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={e => {
                                                setCouponCode(e.target.value.toUpperCase());
                                                setCouponError("");
                                            }}
                                            placeholder="CODIGO DO CUPOM"
                                            className="min-h-12 flex-1 px-5 bg-white dark:bg-slate-900 border-2 border-[var(--border)] rounded-2xl text-xs font-black uppercase tracking-widest focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="min-h-12 bg-primary text-white px-7 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                )}

                                {couponError && (
                                    <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-[10px] font-black text-rose-500 uppercase tracking-wider">
                                        {couponError}
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-3">
                                        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Subtotal</p>
                                        <p className="text-xs sm:text-sm font-black text-[var(--foreground)]">R$ {basePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-[var(--border)] p-3">
                                        <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Desconto</p>
                                        <p className="text-xs sm:text-sm font-black text-emerald-600">R$ {couponSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                    <div className="rounded-2xl bg-[var(--background)] border border-primary/20 p-3">
                                        <p className="text-[8px] font-black text-primary uppercase tracking-widest">Total</p>
                                        <p className="text-xs sm:text-sm font-black text-primary">R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CEP</label>
                                    <input
                                        type="text"
                                        value={formData.zip}
                                        onChange={e => setForm({ ...formData, zip: e.target.value })}
                                        className="w-full px-5 sm:px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">WhatsApp / Celular</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setForm({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 sm:px-6 py-4 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-8 text-center animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="size-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                                <CreditCard size={40} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-[var(--foreground)] uppercase tracking-tight">Escolha o Pagamento</h3>
                                <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-widest">Finalize seu pedido com total seguranca.</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                                <button className="p-6 bg-[var(--background)] border-2 border-primary rounded-[2rem] flex items-center justify-between group hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-tight">Pagar via PIX</p>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Liberacao instantanea</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-[2rem] flex items-center justify-between group hover:border-primary transition-all opacity-60">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="size-12 rounded-2xl bg-[var(--border)] text-[var(--muted)] flex items-center justify-center shadow-sm">
                                            <CreditCard size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[var(--muted)] uppercase tracking-tight">Cartao de Credito</p>
                                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Em ate 12x</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-[var(--muted)] group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-5 sm:p-8 bg-[var(--background)]/50 border-t border-[var(--border)] flex items-center justify-between gap-4">
                    <button
                        onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                        className="min-h-12 px-4 sm:px-8 rounded-xl font-black text-[10px] text-[var(--muted)] uppercase tracking-widest hover:text-primary transition-all flex items-center gap-2 sm:gap-3"
                    >
                        <ChevronLeft size={16} strokeWidth={3} />
                        Voltar
                    </button>

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="min-h-12 px-5 sm:px-12 bg-primary text-white rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.16em] sm:tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center gap-3 border-b-4 border-primary-dark"
                        >
                            Proximo
                            <ArrowRight size={18} strokeWidth={3} />
                        </button>
                    ) : (
                        <div className="flex items-center gap-3 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">
                            <ShieldCheck size={16} />
                            Pedido em processamento
                        </div>
                    )}
                </div>
            </div>

            {attribution && (
                <div className="mt-8 sm:mt-12 px-5 sm:px-6 py-2 bg-white dark:bg-slate-900 border border-[var(--border)] rounded-full text-[8px] sm:text-[9px] font-black text-[var(--muted)] uppercase tracking-[0.2em] shadow-sm animate-in fade-in duration-1000">
                    Consultor Parceiro: <span className="text-primary">{attribution.vendedor_id.substring(0, 8)}...</span>
                </div>
            )}
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
