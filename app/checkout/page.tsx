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
import { calculateCommission, LEVEL_COSTS, SellerLevel, FINANCE_CONSTANTS } from "@/lib/rulesEngine";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const productId = searchParams.get("product");
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [attribution, setAttribution] = useState<any>(null);
    const [sellerProfile, setSellerProfile] = useState<any>(null);
    const [step, setStep] = useState(1);
    const [basePrice, setBasePrice] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [couponError, setCouponError] = useState("");

    const [formData, setForm] = useState({
        name: "",
        doc: "",
        rg: "",
        birthDate: "",
        fantasyName: "",
        cei: "",
        email: "",
        phone: "",
        zip: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        ibge: "",
        legalRepName: "",
        legalRepCpf: "",
        legalRepRg: "",
        legalRepBirthDate: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        const initCheckout = async () => {
            if (!productId) {
                router.push("/");
                return;
            }

            const { data: prod } = await supabase
                .from("products")
                .select("*, supplier_products(*, supplier_tables(*))")
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
                    .select("custom_prices, level, doc")
                    .eq("id", attr.vendedor_id)
                    .single();

                setSellerProfile(profile);
                const customPrice = Number(profile?.custom_prices?.[productId] || attr.custom_price || prod.price);                setBasePrice(customPrice);
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

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            setCouponError("Este cupom esta expirado.");
            return;
        }

        if (coupon.applicable_products && coupon.applicable_products.length > 0 && !coupon.applicable_products.includes(Number(productId))) {
            setCouponError("Este cupom nao e valido para este produto.");
            return;
        }

        const cleanDoc = formData.doc.replace(/\D/g, "");
        if (coupon.allowed_docs && coupon.allowed_docs.length > 0) {
            if (!cleanDoc) {
                setCouponError("Por favor, preencha o campo CPF ou CNPJ no Passo 1 para usar este cupom.");
                return;
            }
            if (!coupon.allowed_docs.includes(cleanDoc)) {
                setCouponError("Este cupom não está disponível para esse CNPJ/CPF.");
                return;
            }
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

        let newFinalPrice = Math.max(0, basePrice - discountAmount);

        // Previne prejuízo: aplica o desconto apenas até atingir o preço de custo (Margem Zero)
        // Usamos fallbacks caso dados do fornecedor ou perfil não estejam carregados para garantir proteção
        const isPJ = (sellerProfile?.doc?.replace(/\D/g, "") || "").length === 14;
        const level = (sellerProfile?.level as SellerLevel) || "Bronze";
        
        // Extrai dados do fornecedor com suporte a objeto ou array (Supabase Join)
        const supplierProd = Array.isArray(product?.supplier_products) 
            ? product.supplier_products[0] 
            : product?.supplier_products;
            
        const supplierTab = supplierProd?.supplier_tables;
        
        const taxPercent = supplierTab?.tax_percent 
            ? Number(supplierTab.tax_percent) / 100 
            : FINANCE_CONSTANTS.TAX_RATE;
            
        const fixedFee = supplierTab?.tax_fixed 
            ? Number(supplierTab.tax_fixed) 
            : (FINANCE_CONSTANTS.BASE_COST - 50);
        
        // Custo Base do Produto de acordo com o nível (O cadastro usa 'commission_X' como custo)
        let sellerCost = 0;
        if (product) {
            const levelKey = `commission_${level.toLowerCase()}`;
            sellerCost = Number(product[levelKey] || 0);
        }

        // Se o produto não tiver custo específico para o nível, usa o fallback global do rulesEngine
        if (sellerCost <= 0) {
            sellerCost = isPJ 
                ? LEVEL_COSTS[level]?.PJ || 95 
                : LEVEL_COSTS[level]?.PF || 85;
        }
        
        // Cálculo do Preço Mínimo (Break-even: Repasse = 0)
        // A fórmula inverte: SalePrice * (1 - taxPercent) - sellerCost - fixedFee = 0
        const minPrice = (sellerCost + fixedFee) / (1 - taxPercent);

        if (newFinalPrice < minPrice) {
            // Cap no desconto: não permitimos baixar além do preço de custo + taxas
            const maxAllowedDiscount = Math.max(0, basePrice - minPrice);
            discountAmount = maxAllowedDiscount;
            newFinalPrice = basePrice - discountAmount;
            
            // Se o desconto foi totalmente zerado ou reduzido a ponto de não poder ser aplicado
            if (newFinalPrice >= basePrice && basePrice <= minPrice) {
                setCouponError("Este cupom não pode ser aplicado pois o preço base já está no limite de custo.");
                return;
            }
        }

        newFinalPrice = Math.round(newFinalPrice * 100) / 100;
        setFinalPrice(newFinalPrice);
        setAppliedCoupon(coupon);
        setCouponCode(normalizedCode);
        localStorage.removeItem("delta_pending_coupon");
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponError("");
        setFinalPrice(basePrice);
    };

    const handleZipChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        const rawZip = val.replace(/\D/g, "");
        setForm(prev => ({ ...prev, zip: val }));

        if (rawZip.length === 8) {
            try {
                const res = await fetch(`https://viacep.com.br/ws/${rawZip}/json/`);
                const data = await res.json();
                if (!data.erro) {
                    setForm(prev => ({
                        ...prev,
                        street: data.logradouro || "",
                        neighborhood: data.bairro || "",
                        city: data.localidade || "",
                        state: data.uf || "",
                        ibge: data.ibge || "",
                    }));
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
            }
        }
    };

    const handleSubmitOrder = async () => {
        if (!formData.name || !formData.doc || !formData.email || !formData.phone || !formData.zip || !formData.street || !formData.number || !formData.neighborhood || !formData.city || !formData.state) {
            setSubmitError("Por favor, preencha todos os campos obrigatórios no Passo 1 e 2.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const formDataObj = new FormData();
            formDataObj.append("productId", productId || "");
            formDataObj.append("customPrice", finalPrice.toString());

            if (attribution && sellerProfile) {
                formDataObj.append("seller_id", attribution.vendedor_id);

                // Recalcula comissão e custos para persistência precisa
                const isPJ = (sellerProfile.doc?.replace(/\D/g, "") || "").length === 14;
                const level = sellerProfile.level || "Bronze";
                
                const supplierProd = Array.isArray(product?.supplier_products) 
                    ? product.supplier_products[0] 
                    : product?.supplier_products;
                
                const supplierData = supplierProd ? {
                    base_cost: Number(supplierProd.base_cost),
                    tax_fixed: Number(supplierProd.supplier_tables?.tax_fixed || 0),
                    tax_percent: Number(supplierProd.supplier_tables?.tax_percent || 0)
                } : undefined;

                const productLevelCosts = {
                    bronze: Number(product.commission_bronze || (isPJ ? LEVEL_COSTS.Bronze.PJ : LEVEL_COSTS.Bronze.PF)),
                    prata: Number(product.commission_prata || (isPJ ? LEVEL_COSTS.Prata.PJ : LEVEL_COSTS.Prata.PF)),
                    ouro: Number(product.commission_ouro || (isPJ ? LEVEL_COSTS.Ouro.PJ : LEVEL_COSTS.Ouro.PF))
                };

                const comm = calculateCommission(
                    finalPrice,
                    level as SellerLevel,
                    isPJ,
                    undefined, // Badge (Start etc) - Futuro
                    supplierData,
                    productLevelCosts
                );

                if (comm.isBlocked) {
                    setSubmitError("Erro de Margem: O preço final (R$ " + finalPrice.toFixed(2) + ") resultaria em prejuízo para o parceiro. Por favor, remova ou troque o cupom.");
                    setIsSubmitting(false);
                    return;
                }

                formDataObj.append("seller_commission", comm.repasse.toString());
                formDataObj.append("partner_cost", comm.partnerCost.toString());
                formDataObj.append("taxes", comm.taxes.toString());
                formDataObj.append("fixed_fees", comm.fixedFees.toString());
                formDataObj.append("calculation_memory", JSON.stringify(comm.calculationSteps));
            }

            formDataObj.append("name", formData.name);
            formDataObj.append("doc", formData.doc);
            formDataObj.append("rg", formData.rg);
            formDataObj.append("birthDate", formData.birthDate);
            formDataObj.append("fantasyName", formData.fantasyName);
            formDataObj.append("cei", formData.cei);
            formDataObj.append("email", formData.email);
            formDataObj.append("phone", formData.phone);
            formDataObj.append("cep", formData.zip);
            formDataObj.append("street", formData.street);
            formDataObj.append("number", formData.number);
            formDataObj.append("complement", formData.complement);
            formDataObj.append("neighborhood", formData.neighborhood);
            formDataObj.append("city", formData.city);
            formDataObj.append("state", formData.state);
            formDataObj.append("ibge", formData.ibge);

            if (formData.doc.replace(/\D/g, "").length === 14) {
                formDataObj.append("legalRepName", formData.legalRepName);
                formDataObj.append("legalRepCpf", formData.legalRepCpf);
                formDataObj.append("legalRepRg", formData.legalRepRg);
                formDataObj.append("legalRepBirthDate", formData.legalRepBirthDate);
            }

            formDataObj.append("videoConference", "true");

            const res = await fetch("/api/integracao/vendas", {
                method: "POST",
                body: formDataObj
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Erro ao processar pedido.");
            }

            if (data.paymentLink) {
                window.location.href = data.paymentLink;
            } else {
                setSubmitError("Link de pagamento não retornado pela API.");
                setIsSubmitting(false);
            }

        } catch (error: any) {
            console.error("Erro no checkout:", error);
            setSubmitError(error.message || "Erro desconhecido.");
            setIsSubmitting(false);
        }
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
            <div className="w-full max-w-6xl mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shrink-0">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tight">Compra Segura</h1>
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

            <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 lg:gap-12 items-start">
                {/* Detalhes do Produto - Mini Landing Page */}
                <div className="w-full lg:w-[40%] space-y-4 lg:space-y-6 lg:sticky lg:top-8 order-1 lg:order-1">
                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 md:p-8 shadow-xl">
                        <div className="hidden lg:flex size-16 bg-primary/10 text-primary rounded-2xl items-center justify-center mb-6">
                            <ShieldCheck size={32} />
                        </div>
                        <h2 className="text-xl lg:text-2xl font-black text-[var(--foreground)] tracking-tight mb-2 lg:mb-3">
                            {product.name}
                        </h2>
                        <p className="text-[11px] lg:text-sm text-[var(--muted)] mb-5 lg:mb-8 font-medium leading-relaxed">
                            {product.description || "O Certificado Digital ideal para sua empresa. Segurança, validade jurídica e praticidade em um único produto com emissão 100% online."}
                        </p>
                        
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 lg:gap-4 mb-5 lg:mb-8">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 bg-[var(--background)] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none border lg:border-0 border-[var(--border)]">
                                <div className="size-6 lg:size-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-3 lg:size-4 text-emerald-500" />
                                </div>
                                <span className="text-[9px] lg:text-sm font-bold text-[var(--foreground)] leading-tight uppercase tracking-wider lg:tracking-normal lg:normal-case">Emissão 100% Online</span>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 bg-[var(--background)] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none border lg:border-0 border-[var(--border)]">
                                <div className="size-6 lg:size-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-3 lg:size-4 text-emerald-500" />
                                </div>
                                <span className="text-[9px] lg:text-sm font-bold text-[var(--foreground)] leading-tight uppercase tracking-wider lg:tracking-normal lg:normal-case">Pronto no mesmo dia</span>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 bg-[var(--background)] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none border lg:border-0 border-[var(--border)]">
                                <div className="size-6 lg:size-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-3 lg:size-4 text-emerald-500" />
                                </div>
                                <span className="text-[9px] lg:text-sm font-bold text-[var(--foreground)] leading-tight uppercase tracking-wider lg:tracking-normal lg:normal-case">Suporte Incluso</span>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 bg-[var(--background)] lg:bg-transparent p-3 lg:p-0 rounded-2xl lg:rounded-none border lg:border-0 border-[var(--border)]">
                                <div className="size-6 lg:size-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="size-3 lg:size-4 text-emerald-500" />
                                </div>
                                <span className="text-[9px] lg:text-sm font-bold text-[var(--foreground)] leading-tight uppercase tracking-wider lg:tracking-normal lg:normal-case">Validade Jurídica</span>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 lg:p-5 flex items-center lg:items-start gap-3 lg:gap-4">
                            <Zap className="size-5 lg:size-6 text-primary shrink-0 lg:mt-1" />
                            <div>
                                <h4 className="text-[10px] lg:text-sm font-black text-[var(--foreground)] uppercase tracking-tight mb-0 lg:mb-1">Aprovação Imediata</h4>
                                <p className="hidden lg:block text-xs text-[var(--muted)] font-medium">Pagamentos no PIX ou Cartão de Crédito são aprovados na hora, agilizando sua emissão.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-[60%] bg-[var(--card)] rounded-[2rem] sm:rounded-[3rem] border-2 border-[var(--border)] overflow-hidden shadow-2xl flex flex-col order-2 lg:order-2">
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
                            <div className="grid grid-cols-2 gap-4 sm:gap-5">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CPF ou CNPJ</label>
                                    <input
                                        type="text"
                                        value={formData.doc}
                                        onChange={e => setForm({ ...formData, doc: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        placeholder="Apenas numeros"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">{formData.doc.replace(/\D/g, "").length === 14 ? "Razão Social" : "Nome Completo"}</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setForm({ ...formData, name: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Ex: Joao Silva"
                                    />
                                </div>

                                {formData.doc.replace(/\D/g, "").length === 14 ? (
                                    <>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Nome Fantasia (Opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.fantasyName}
                                                onChange={e => setForm({ ...formData, fantasyName: e.target.value })}
                                                className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                                placeholder="Nome fantasia da empresa"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CEI / CAEPF (Opcional)</label>
                                            <input
                                                type="text"
                                                value={formData.cei}
                                                onChange={e => setForm({ ...formData, cei: e.target.value })}
                                                className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2 truncate block">Nascimento</label>
                                            <input
                                                type="date"
                                                value={formData.birthDate}
                                                onChange={e => setForm({ ...formData, birthDate: e.target.value })}
                                                className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[13px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2 col-span-1">
                                            <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">RG</label>
                                            <input
                                                type="text"
                                                value={formData.rg}
                                                onChange={e => setForm({ ...formData, rg: e.target.value })}
                                                className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[13px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">E-mail de Recebimento</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setForm({ ...formData, email: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all lowercase"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                                
                                {formData.doc.replace(/\D/g, "").length === 14 && (
                                    <div className="col-span-2 border-t border-[var(--border)] pt-4 mt-2">
                                        <h4 className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-widest mb-4 px-2">Representante Legal</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Nome do Representante</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalRepName}
                                                    onChange={e => setForm({ ...formData, legalRepName: e.target.value })}
                                                    className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                                    placeholder="Nome"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-2">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CPF do Representante</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalRepCpf}
                                                    onChange={e => setForm({ ...formData, legalRepCpf: e.target.value })}
                                                    className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                    placeholder="Apenas números"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-1">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2 block truncate">Nascimento</label>
                                                <input
                                                    type="date"
                                                    value={formData.legalRepBirthDate}
                                                    onChange={e => setForm({ ...formData, legalRepBirthDate: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[13px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-1">
                                                <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">RG</label>
                                                <input
                                                    type="text"
                                                    value={formData.legalRepRg}
                                                    onChange={e => setForm({ ...formData, legalRepRg: e.target.value })}
                                                    className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-[13px] font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={cn(
                                "border-2 p-5 sm:p-6 rounded-[2rem] space-y-5 transition-all relative overflow-hidden",
                                appliedCoupon
                                    ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_-15px_rgba(16,185,129,0.3)]"
                                    : "bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-orange-500/10 border-amber-500/30 shadow-[0_0_40px_-15px_rgba(245,158,11,0.4)]"
                            )}>
                                {!appliedCoupon && (
                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-orange-500/20 blur-[50px] -z-10 rounded-full animate-pulse" />
                                )}
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                    <div className={cn(
                                        "size-12 rounded-2xl flex items-center justify-center border shrink-0 relative z-10",
                                        appliedCoupon
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            : "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-orange-500/20 shadow-lg shadow-orange-500/30"
                                    )}>
                                        {appliedCoupon ? <CheckCircle2 size={24} /> : <Tag size={24} />}
                                    </div>
                                    <div className="flex-1 space-y-1 relative z-10">
                                        <p className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            appliedCoupon ? "text-emerald-600" : "text-amber-600 dark:text-amber-500"
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
                                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-stretch relative z-10">
                                        <div className="bg-[var(--background)] border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Código</p>
                                                <p className="text-sm sm:text-base font-black text-emerald-600 uppercase tracking-widest">{appliedCoupon.code}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-[var(--muted)] uppercase tracking-widest">Economia</p>
                                                <p className="text-sm sm:text-base font-black text-emerald-600">
                                                    R$ {couponSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="min-h-12 px-5 rounded-2xl border-2 border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:text-rose-500 hover:border-rose-500/40 font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                        >
                                            <X size={14} strokeWidth={3} />
                                            <span className="hidden sm:inline">Remover</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={e => {
                                                setCouponCode(e.target.value.toUpperCase());
                                                setCouponError("");
                                            }}
                                            placeholder="CÓDIGO DO CUPOM"
                                            className="min-h-12 flex-1 px-5 bg-white dark:bg-slate-900 border-2 border-amber-500/30 rounded-2xl text-xs font-black uppercase tracking-widest focus:border-amber-500 focus:ring-8 focus:ring-amber-500/10 outline-none transition-all shadow-inner"
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            className="min-h-12 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-7 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-orange-500/30 border border-orange-400/50"
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

                                <div className="flex flex-col gap-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] p-4 sm:p-5 relative z-10">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-[var(--muted)] font-black uppercase tracking-widest">Subtotal</span>
                                        <span className="font-black text-[var(--foreground)]">R$ {basePrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    
                                    {couponSavings > 0 && (
                                        <div className="flex justify-between items-center text-xs text-emerald-600">
                                            <span className="font-black uppercase tracking-widest">Desconto</span>
                                            <span className="font-black">- R$ {couponSavings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    )}
                                    
                                    <div className="h-px w-full bg-[var(--border)] my-1" />
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-primary uppercase tracking-widest">Total</span>
                                        <span className="text-base sm:text-lg font-black text-primary">R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="grid grid-cols-4 gap-4 sm:gap-5">
                                <div className="space-y-2 col-span-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CEP</label>
                                    <input
                                        type="text"
                                        value={formData.zip}
                                        onChange={handleZipChange}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        placeholder="00000-000"
                                    />
                                </div>
                                <div className="space-y-2 col-span-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">WhatsApp / Celular</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setForm({ ...formData, phone: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                                        placeholder="(00) 00000-0000"
                                    />
                                </div>
                                <div className="space-y-2 col-span-4 md:col-span-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Rua / Logradouro</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={e => setForm({ ...formData, street: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Sua rua"
                                    />
                                </div>
                                <div className="space-y-2 col-span-1 md:col-span-1">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2 truncate block">Número</label>
                                    <input
                                        type="text"
                                        value={formData.number}
                                        onChange={e => setForm({ ...formData, number: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Nº"
                                    />
                                </div>
                                <div className="space-y-2 col-span-3 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Complemento</label>
                                    <input
                                        type="text"
                                        value={formData.complement}
                                        onChange={e => setForm({ ...formData, complement: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Opcional"
                                    />
                                </div>
                                <div className="space-y-2 col-span-4 md:col-span-2">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Bairro</label>
                                    <input
                                        type="text"
                                        value={formData.neighborhood}
                                        onChange={e => setForm({ ...formData, neighborhood: e.target.value })}
                                        className="w-full px-5 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Seu bairro"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-3">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Cidade</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => setForm({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="Sua cidade"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 md:col-span-1">
                                    <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Estado</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => setForm({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-3 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl text-sm font-black focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all uppercase"
                                        placeholder="UF"
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

                            {submitError && (
                                <div className="max-w-md mx-auto mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-[10px] font-black text-rose-500 uppercase tracking-wider text-left">
                                    {submitError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                    className="p-6 bg-[var(--background)] border-2 border-primary rounded-[2rem] flex items-center justify-between group hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="size-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                                            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-tight">Pagar via PIX</p>
                                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Liberacao instantanea</p>
                                        </div>
                                    </div>
                                    <ArrowRight size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                    className="p-6 bg-[var(--background)] border-2 border-[var(--border)] rounded-[2rem] flex items-center justify-between group hover:border-primary transition-all opacity-80 disabled:opacity-50 disabled:cursor-not-allowed">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="size-12 rounded-2xl bg-[var(--border)] text-[var(--foreground)] flex items-center justify-center shadow-sm">
                                            {isSubmitting ? <Loader2 className="animate-spin text-[var(--muted)]" size={24} /> : <CreditCard className="text-[var(--muted)]" size={24} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[var(--foreground)] uppercase tracking-tight">Cartao de Credito</p>
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
                        <div className="flex items-center gap-3 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                            <ShieldCheck size={16} className={isSubmitting ? "text-primary animate-pulse" : ""} />
                            {isSubmitting ? "Gerando link de pagamento..." : "Aguardando pagamento"}
                        </div>
                    )}
                </div>
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
