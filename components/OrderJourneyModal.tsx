"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import SearchSelect from "./ui/SearchSelect";
import { useSWRConfig } from "swr";
import {
    Cloud,
    HardDrive,
    MonitorCheck,
    Users,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    DollarSign,
    Target,
    Calendar,
    Clock,
    Flame,
    Sparkles,
    MapPin,
    User,
    FileUp,
    Briefcase,
    Zap,
    XCircle,
    ChevronDown,
    ChevronUp,
    ReceiptText,
    Save,
    FileEdit
} from "lucide-react";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useSimulation } from "@/components/SimulationProvider";
import { calculateCommission } from "@/lib/rulesEngine";

const orderSchema = z.object({
    // Step 1
    productId: z.number().min(1, "Selecione um produto"),
    customPrice: z.number().min(1, "Preço inválido"),
    doc: z.string().min(11, "Documento inválido"),
    name: z.string().min(3, "Razão Social/Nome Completo obrigatório"),
    fantasyName: z.string().optional(),
    legalRepName: z.string().optional(),
    legalRepCpf: z.string().optional(),
    email: z.string().email("E-mail inválido"),
    phone: z.string().min(10, "Telefone inválido"),
    cep: z.string().min(8, "CEP inválido"),
    street: z.string().min(3, "Logradouro obrigatório"),
    number: z.string().min(1, "Número obrigatório"),
    neighborhood: z.string().min(2, "Bairro obrigatório"),
    city: z.string().min(2, "Cidade obrigatória"),
    state: z.string().length(2, "UF deve ter 2 caracteres"),
    complement: z.string().optional(),
    // Step 2
    mediaType: z.enum(["Nuvem", "Token", "Cartão", "Arquivo"]),
    validity: z.string(),
    videoConference: z.boolean(),
    appointmentDate: z.string().optional(),
    appointmentTime: z.string().optional(),
    // Step 3
    billingType: z.enum(["Mesmo", "Diferente"]),
    billingDoc: z.string().optional(),
    billingName: z.string().optional(),
    billingEmail: z.string().optional(),
    billingPhone: z.string().optional(),
    billingCep: z.string().optional(),
    billingStreet: z.string().optional(),
    billingNumber: z.string().optional(),
    billingNeighborhood: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    coupon: z.string().optional(),
    ibge: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface OrderJourneyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    products: any[];
    error?: any;
    isLoading?: boolean;
    editingOrder?: any;
}

export default function OrderJourneyModal({ isOpen, onClose, onSubmit, products, error, isLoading, editingOrder }: OrderJourneyModalProps) {
    const { currentUser, updateUser } = useSimulation();
    const { mutate } = useSWRConfig();
    const [step, setStep] = useState(editingOrder ? 4 : 1);
    const [isConsulting, setIsConsulting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<"PF" | "PJ" | null>(
        editingOrder ? (editingOrder.category === "CPF" ? "PF" : "PJ") : null
    );
    const [isSuccess, setIsSuccess] = useState(false);
    const [protocol, setProtocol] = useState("");
    const [paymentLink, setPaymentLink] = useState("");
    const [scheduleLink, setScheduleLink] = useState("");
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [showCalcMemory, setShowCalcMemory] = useState(false);
    const [identifiedCustomer, setIdentifiedCustomer] = useState<any>(null);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors, isValid }
    } = useForm<OrderFormData>({
        resolver: zodResolver(orderSchema),
        defaultValues: editingOrder ? {
            productId: editingOrder.product_id || 0,
            customPrice: editingOrder.final_price || 0,
            doc: editingOrder.doc || "",
            name: editingOrder.holder_name || "",
            fantasyName: editingOrder.fantasyName || "",
            legalRepName: editingOrder.legalRepName || "",
            legalRepCpf: editingOrder.legalRepCpf || "",
            email: editingOrder.email || "",
            phone: editingOrder.phone || "",
            cep: editingOrder.address_details?.cep || "",
            street: editingOrder.address_details?.street || "",
            number: editingOrder.address_details?.number || "",
            neighborhood: editingOrder.address_details?.neighborhood || "",
            city: editingOrder.address_details?.city || "",
            state: editingOrder.address_details?.state || "",
            complement: editingOrder.address_details?.complement || "",
            mediaType: editingOrder.technical_details?.mediaType || "Nuvem",
            validity: editingOrder.validity || "12 Meses",
            videoConference: editingOrder.technical_details?.videoConference ?? true,
            billingType: editingOrder.billing_details?.billingType || "Mesmo",
            coupon: editingOrder.coupon || "",
            ibge: editingOrder.ibge || "",
        } : {
            productId: 0,
            customPrice: 0,
            doc: "",
            name: "",
            fantasyName: "",
            legalRepName: "",
            legalRepCpf: "",
            email: "",
            phone: "",
            cep: "",
            street: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            complement: "",
            mediaType: "Nuvem",
            validity: "12 Meses",
            videoConference: true,
            billingType: "Mesmo",
            coupon: "",
            ibge: "",
        }
    });

    const selectedProductId = watch("productId");
    const selectedProduct = products.find(p => p.id === selectedProductId);

    // Sync media type AND price when product changes
    useEffect(() => {
        if (selectedProduct) {
            if (selectedProduct.media_type) setValue("mediaType", selectedProduct.media_type);

            // Use custom price if available in user profile, otherwise use product default
            const customPrices = currentUser?.custom_prices || {};
            const defaultPrice = customPrices[selectedProduct.id] || selectedProduct.price;
            setValue("customPrice", defaultPrice);
        }
    }, [selectedProductId, selectedProduct, setValue, currentUser]);

    const customPrice = watch("customPrice");
    const cepValue = watch("cep");
    const docValue = watch("doc");
    const videoConference = watch("videoConference");
    const billingType = watch("billingType");
    const isPJ = selectedCategory === "PJ";

    // Filter products based on selected category (Ultra-Robust version)
    const filteredProducts = (products || []).filter(p => {
        if (!selectedCategory) return false;
        const cat = String(p.category || "").toUpperCase().trim();
        // Support both naming conventions: PF/CPF and PJ/CNPJ
        if (selectedCategory === "PF") {
            return cat === "CPF" || cat === "PF" || cat.includes("FISICA") || cat.includes("FÍSICA");
        }
        if (selectedCategory === "PJ") {
            return cat === "CNPJ" || cat === "PJ" || cat.includes("JURIDICA") || cat.includes("JURÍDICA");
        }
        return true;
    });

    // Dynamic Commission Logic
    const commissionData = selectedProduct ? calculateCommission(
        customPrice || selectedProduct.price,
        currentUser.level,
        isPJ,
        currentUser.equippedBadge,
        selectedProduct.supplier_products ? {
            base_cost: selectedProduct.supplier_products.base_cost,
            tax_fixed: selectedProduct.supplier_products.supplier_tables?.tax_fixed || 0,
            tax_percent: selectedProduct.supplier_products.supplier_tables?.tax_percent || 0
        } : undefined,
        {
            bronze: Number(selectedProduct.commission_bronze) || 0,
            prata: Number(selectedProduct.commission_prata) || 0,
            ouro: Number(selectedProduct.commission_ouro) || 0
        }
    ) : null;

    // Auto-fill logic for CPF/CNPJ
    useEffect(() => {
        const fetchCustomer = async () => {
            const cleanDoc = docValue?.replace(/[^0-9]/g, '');
            if (cleanDoc && (cleanDoc.length === 11 || cleanDoc.length === 14)) {
                setIsConsulting(true);
                try {
                    const { data } = await axios.get(`/api/consulta/clientes?doc=${cleanDoc}`);

                    if (data && !data.error) {
                        setIdentifiedCustomer(data);
                        setValue("name", data.name);
                        setValue("email", data.email);
                        setValue("phone", data.phone);

                        // Auto-fill Address if available
                        if (data.address_zip) setValue("cep", data.address_zip);
                        if (data.address_street) setValue("street", data.address_street);
                        if (data.address_number) setValue("number", data.address_number);
                        if (data.address_neighborhood) setValue("neighborhood", data.address_neighborhood);
                        if (data.address_city) setValue("city", data.address_city);
                        if (data.address_state) setValue("state", data.address_state);
                        if (data.address_complement) setValue("complement", data.address_complement);
                    } else {
                        setIdentifiedCustomer(null);
                    }
                } catch (e) {
                    setIdentifiedCustomer(null);
                    // Not found or error
                } finally {
                    setIsConsulting(false);
                }
            } else {
                setIdentifiedCustomer(null);
            }
        };

        const timer = setTimeout(fetchCustomer, 500);
        return () => clearTimeout(timer);
    }, [docValue, setValue]);

    // Auto-fill logic for CEP
    useEffect(() => {
        const fetchAddress = async () => {
            const cleanCep = cepValue?.replace(/[^0-9]/g, '');
            if (cleanCep && cleanCep.length === 8) {
                try {
                    const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
                    if (!data.erro) {
                        setValue("street", data.logradouro);
                        setValue("neighborhood", data.bairro);
                        setValue("city", data.localidade);
                        setValue("state", data.uf);
                        setValue("ibge", data.ibge);
                    }
                } catch (e) {
                    // Silent error
                }
            }
        };

        const timer = setTimeout(fetchAddress, 500);
        return () => clearTimeout(timer);
    }, [cepValue, setValue]);

    const handleNext = () => setStep(s => Math.min(s + 1, 4));
    const handleBack = () => setStep(s => Math.max(s - 1, 1));

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            setAttachedFiles(prev => [...prev, ...Array.from(files)]);
        }
    };

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="group/section">
                <div className="flex items-center gap-3 mb-4">
                    <div className="size-6 rounded-none bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black">1</div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Inicie o Pedido</h3>
                </div>

                {/* Category Selection - More compact grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategory("PF");
                            setValue("productId", 0);
                        }}
                        className={cn(
                            "p-6 rounded-[2rem] border-4 text-left transition-all relative group overflow-hidden shadow-sm",
                            selectedCategory === "PF"
                                ? "border-primary bg-primary/[0.05] scale-[1.02]"
                                : "border-[var(--border)] hover:border-primary/20 bg-[var(--card)]"
                        )}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "size-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                selectedCategory === "PF" ? "bg-primary text-white scale-110" : "bg-[var(--background)] text-[var(--muted)]"
                            )}>
                                <User size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tight">Pessoa Física</p>
                                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest leading-none opacity-60">Para CPFs</p>
                            </div>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedCategory("PJ");
                            setValue("productId", 0);
                        }}
                        className={cn(
                            "p-6 rounded-[2rem] border-4 text-left transition-all relative group overflow-hidden shadow-sm",
                            selectedCategory === "PJ"
                                ? "border-primary bg-primary/[0.05] scale-[1.02]"
                                : "border-[var(--border)] hover:border-primary/20 bg-[var(--card)]"
                        )}
                    >
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={cn(
                                "size-12 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                                selectedCategory === "PJ" ? "bg-primary text-white scale-110" : "bg-[var(--background)] text-[var(--muted)]"
                            )}>
                                <Briefcase size={24} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tight">Pessoa Jurídica</p>
                                <p className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest leading-none opacity-60">Para Empresas</p>
                            </div>
                        </div>
                    </button>
                </div>

                {selectedCategory && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                            Produtos Disponíveis {selectedCategory && `(${filteredProducts.length} de ${products?.length || 0} carregados)`}
                        </h3>

                        {isLoading && (
                            <div className="p-10 text-center animate-pulse">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Carregando Catálogo...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-none text-center">
                                <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Erro de Conexão</p>
                                <p className="text-[8px] text-rose-400 font-bold uppercase">{error.message || "Falha ao consultar banco de dados"}</p>
                            </div>
                        )}

                        {!isLoading && !error && products?.length === 0 && (
                            <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-none text-center">
                                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-1">Base de Dados Vazia</p>
                                <p className="text-[8px] text-slate-400 font-bold uppercase">Nenhum produto cadastrado na tabela 'products'.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => setValue("productId", product.id)}
                                    className={cn(
                                        "p-4 rounded-2xl border-2 text-left transition-all relative group shadow-sm",
                                        selectedProductId === product.id
                                            ? "border-primary bg-primary/[0.05] ring-4 ring-primary/10"
                                            : "border-[var(--border)] hover:border-primary/20 bg-[var(--card)]"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center transition-all shadow-md",
                                            selectedProductId === product.id ? "bg-primary text-white" : "bg-[var(--background)] text-[var(--muted)]"
                                        )}>
                                            {product.type === "A1" ? <Cloud size={20} strokeWidth={3} /> : <HardDrive size={20} strokeWidth={3} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-[var(--foreground)] uppercase tracking-tight truncate leading-tight">{product.name}</p>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{product.type}</p>
                                        </div>
                                        {selectedProductId === product.id && <CheckCircle2 className="text-primary animate-in zoom-in" size={20} strokeWidth={3} />}
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-2 p-10 border-4 border-dashed border-[var(--border)] rounded-[2rem] text-center bg-[var(--background)]">
                                    <p className="text-[12px] text-[var(--muted)] font-black uppercase tracking-[0.2em]">Nenhum produto em estoque para esta categoria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <div className="bg-primary/[0.05] rounded-[2rem] p-8 border-4 border-primary/10 animate-in zoom-in-95 duration-500 shadow-xl shadow-primary/5">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-primary mb-1">Engenharia de Preço</h4>
                            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest opacity-60">Ajuste o valor final para o consumidor</p>
                        </div>
                        <div className="flex items-center bg-[var(--card)] rounded-2xl border-4 border-primary/20 p-1 shadow-2xl">
                            <span className="px-5 text-sm font-black text-primary">R$</span>
                            <input
                                type="number"
                                {...register("customPrice", { valueAsNumber: true })}
                                className="w-28 bg-transparent border-0 focus:ring-0 text-xl font-black text-[var(--foreground)] p-3"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="group/section p-8 bg-primary/[0.02] rounded-[2.5rem] border-2 border-[var(--border)] transition-all hover:border-primary/20 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">02</div>
                    <h3 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.3em]">IDENTIFICAÇÃO DO TITULAR</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label={isPJ ? "CNPJ DA EMPRESA" : "CPF DO TITULAR"}
                            {...register("doc")}
                            error={errors.doc?.message}
                            placeholder="DIGITE O DOCUMENTO PARA BUSCA..."
                            helpText={isConsulting ? "CONSULTANDO BIG DATA..." : identifiedCustomer ? "✅ PERFIL ENCONTRADO NO DELTA CRM" : ""}
                            className={cn("py-4 rounded-2xl border-4 font-black uppercase", identifiedCustomer && "border-emerald-500/30 bg-emerald-500/[0.02]")}
                        />
                        {identifiedCustomer && (
                            <div className="mt-4 flex items-center gap-3 px-6 py-3 bg-emerald-500 text-white rounded-2xl animate-in slide-in-from-top-2 shadow-lg shadow-emerald-500/20">
                                <Sparkles size={16} strokeWidth={3} className="animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    CLIENTE FIDELIDADE: {identifiedCustomer.total_spent?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} EM COMPRAS
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Input label={isPJ ? "NOME EMPRESARIAL" : "NOME COMPLETO"} {...register("name")} error={errors.name?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                    </div>

                    {isPJ && (
                        <>
                            <Input label="INSCRIÇÃO ESTADUAL" {...register("fantasyName")} placeholder="ISENTO" className="py-4 rounded-2xl border-4 font-black uppercase" />
                            <div className="md:col-span-2 pt-8 border-t-4 border-[var(--border)] mt-4">
                                <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-6">REPRESENTAÇÃO LEGAL</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="NOME DO REPRESENTANTE" {...register("legalRepName")} placeholder="NOME" className="py-4 rounded-2xl border-4 font-black uppercase" />
                                    <Input label="CPF DO REPRESENTANTE" {...register("legalRepCpf")} placeholder="000.000.000-00" className="py-4 rounded-2xl border-4 font-black uppercase" />
                                </div>
                            </div>
                        </>
                    )}

                    <Input label="WHATSAPP / CELULAR" {...register("phone")} error={errors.phone?.message} className="py-4 rounded-2xl border-4 font-black uppercase text-blue-600" />
                    <Input label="E-MAIL DE NOTIFICAÇÃO" {...register("email")} error={errors.email?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                </div>
            </div>

            <div className="group/section p-8 bg-[var(--background)] rounded-[2.5rem] border-2 border-[var(--border)] transition-all hover:border-primary/20 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">03</div>
                    <h3 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.3em]">LOCALIZAÇÃO E LOGÍSTICA</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Input label="CEP" {...register("cep")} error={errors.cep?.message} placeholder="00000-000" className="py-4 rounded-2xl border-4 font-black uppercase" />
                    <div className="md:col-span-3">
                        <Input label="LOGRADOURO" {...register("street")} error={errors.street?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                    </div>
                    <Input label="Nº" {...register("number")} error={errors.number?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                    <Input label="BAIRRO" {...register("neighborhood")} error={errors.neighborhood?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                    <Input label="CIDADE" {...register("city")} error={errors.city?.message} className="py-4 rounded-2xl border-4 font-black uppercase" />
                    <Input label="UF" {...register("state")} error={errors.state?.message} maxLength={2} className="py-4 rounded-2xl border-4 font-black uppercase text-center" />
                </div>
            </div>

            {/* Multi-Document Attachment */}
            <div className="p-8 bg-indigo-500/[0.03] rounded-[2.5rem] border-4 border-indigo-500/10">
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.3em] leading-none">DOCUMENTAÇÃO OBRIGATÓRIA (FOTOS/PDF)</p>
                        <label className="cursor-pointer px-8 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all border-2 border-white/20">
                            EFETUAR UPLOAD
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" multiple />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {attachedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-[var(--card)] border-2 border-emerald-500/30 rounded-2xl shadow-sm group">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="size-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 group-hover:rotate-6 transition-transform">
                                        <FileUp size={24} strokeWidth={3} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-black text-[var(--foreground)] uppercase truncate tracking-tight">{file.name}</p>
                                        <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeFile(idx)} className="size-10 flex items-center justify-center text-[var(--muted)] hover:text-rose-500 transition-all hover:bg-rose-500/10 rounded-xl">
                                    <XCircle size={20} strokeWidth={3} />
                                </button>
                            </div>
                        ))}
                        {attachedFiles.length === 0 && (
                            <div className="col-span-2 p-12 border-4 border-dashed border-indigo-500/20 rounded-[2rem] text-center bg-white/30">
                                <p className="text-[12px] text-indigo-400 font-black uppercase tracking-[0.25em]">NENHUM DOCUMENTO ANEXADO</p>
                                <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest mt-2 whitespace-nowrap opacity-60 italic">ANEXE O CPF/CNPJ E CNH/RG DO TITULAR</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="group/section p-8 bg-primary/[0.02] rounded-[2.5rem] border-2 border-[var(--border)] transition-all hover:border-primary/20 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">04</div>
                    <h3 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.3em]">ESPECIFICAÇÕES TÉCNICAS</h3>
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-indigo-600 text-white rounded-[2rem] border-4 border-white/10 shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rotate-45 transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                        <p className="text-[11px] font-black uppercase text-indigo-100 tracking-[0.3em] mb-3 opacity-80 relative z-10">Mídia & Validade</p>
                        <p className="text-2xl font-black uppercase tracking-tighter relative z-10">{watch("mediaType")} — Ciclo de 12 Meses</p>
                        <p className="text-[9px] text-indigo-200 font-black uppercase tracking-widest mt-2 relative z-10 italic">Configuração otimizada para o produto selecionado.</p>
                    </div>

                    <div className="p-2 bg-[var(--background)] rounded-[2rem] border-2 border-[var(--border)]">
                        <SegmentedControl
                            label="MODALIDADE DE EMISSÃO"
                            value={videoConference ? "video" : "presencial"}
                            onChange={(v) => setValue("videoConference", v === "video")}
                            options={[
                                { label: "VIDEOCONFERÊNCIA (ONLINE)", value: "video" },
                                { label: "PRESENCIAL (PONTO FÍSICO)", value: "presencial" },
                            ]}
                        />
                    </div>

                    {!videoConference && (
                        <div className="p-6 bg-amber-500/10 border-4 border-amber-500/20 rounded-[2rem] flex items-center gap-6 animate-in zoom-in-95">
                            <div className="size-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
                                <MapPin size={28} strokeWidth={3} />
                            </div>
                            <p className="text-[11px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-relaxed">
                                ATENÇÃO: A EMISSÃO PRESENCIAL REQUER AGENDAMENTO POSTERIOR NO HUB FÍSICO MAIS PRÓXIMO.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="group/section p-8 bg-[var(--background)] rounded-[2.5rem] border-2 border-[var(--border)] transition-all hover:border-primary/20 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="size-10 rounded-2xl bg-primary text-white flex items-center justify-center text-sm font-black shadow-lg shadow-primary/20">05</div>
                    <h3 className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.3em]">FLUXO DE FATURAMENTO</h3>
                </div>

                <div className="space-y-8">
                    <div className="p-2 bg-[var(--accent)]/30 rounded-[2rem] border-2 border-[var(--border)]">
                        <SegmentedControl
                            label="DESTINO DA NOTA FISCAL:"
                            value={billingType}
                            onChange={(v) => setValue("billingType", v as any)}
                            options={[
                                { label: "REPETIR DADOS DO TITULAR", value: "Mesmo" },
                                { label: "FATURAR PARA TERCEIRO", value: "Diferente" },
                            ]}
                        />
                    </div>

                    {billingType === "Diferente" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-4 duration-500">
                            <Input label="CPF/CNPJ DO PAGADOR" {...register("billingDoc")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                            <Input label="NOME COMPLETO / RAZÃO" {...register("billingName")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                            <Input label="E-MAIL PARA XML/DANFE" {...register("billingEmail")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                            <Input label="TELEFONE DE COBRANÇA" {...register("billingPhone")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-6 gap-6 pt-4">
                                <div className="sm:col-span-2">
                                    <Input label="CEP" {...register("billingCep")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                                </div>
                                <div className="sm:col-span-4">
                                    <Input label="ENDEREÇO COMPLETO" {...register("billingStreet")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                                </div>
                                <Input label="Nº" {...register("billingNumber")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                                <div className="sm:col-span-2">
                                    <Input label="BAIRRO" {...register("billingNeighborhood")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="CIDADE" {...register("billingCity")} className="py-4 rounded-2xl border-4 font-black uppercase" />
                                </div>
                                <Input label="UF" {...register("billingState")} className="py-4 rounded-2xl border-4 font-black uppercase text-center" maxLength={2} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200 text-center">
            <div className="bg-primary/[0.03] border-2 border-primary/10 rounded-none p-8 relative overflow-hidden">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="size-16 rounded-none bg-primary/10 text-primary flex items-center justify-center mb-4 shadow-sm">
                        <DollarSign size={32} />
                    </div>

                    <h3 className="text-3xl font-black text-[var(--foreground)] mb-2 tracking-tighter uppercase">REVISÃO ESTRATÉGICA</h3>
                    <p className="text-[11px] text-[var(--muted)] max-w-xs mx-auto mb-10 font-black uppercase tracking-[0.3em] opacity-60">CONFIRME OS DETALHES E ASSEGURE SUA PERFORMANCE</p>

                    <div className="w-full bg-[var(--card)] rounded-[2rem] border-4 border-primary/10 overflow-hidden shadow-2xl">
                        <table className="w-full text-left text-[10px] uppercase font-black text-[var(--muted)]">
                            <thead className="bg-primary text-white border-b-4 border-white/10">
                                <tr>
                                    <th className="px-8 py-5 tracking-[0.2em]">PRODUTO SELECIONADO</th>
                                    <th className="px-8 py-5 text-right tracking-[0.2em]">VALOR FINAL</th>
                                    <th className="px-8 py-5 text-right text-emerald-300 tracking-[0.2em]">SEU REPASSE</th>
                                </tr>
                            </thead>
                            <tbody className="text-[var(--foreground)]">
                                <tr>
                                    <td className="px-8 py-6 truncate max-w-[200px] border-b-2 border-[var(--border)]">{selectedProduct?.name}</td>
                                    <td className="px-8 py-6 text-right font-black border-b-2 border-[var(--border)]">{customPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-8 py-6 text-right font-black text-emerald-600 dark:text-emerald-400 text-lg border-b-2 border-[var(--border)]">
                                        {commissionData?.repasse?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shadow-inner">
                            <div className="flex items-center gap-3">
                                <Sparkles size={20} className="animate-pulse" />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">RECOMPENSA: +{selectedProduct && Math.floor(customPrice)} XP PARA EVOLUÇÃO</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 space-y-6 text-left">
                    <div className="p-8 bg-[var(--card)] border-4 border-[var(--border)] rounded-[2.5rem] shadow-xl hover:border-primary/20 transition-all">
                        <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-6">IDENTIFICAÇÃO DO TITULAR</p>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mb-1 opacity-60">NOME / RAZÃO SOCIAL</p>
                                <p className="text-[13px] font-black text-[var(--foreground)] truncate uppercase tracking-tight">{watch("name")}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mb-1 opacity-60">NÚMERO DO DOCUMENTO</p>
                                <p className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-tight">{watch("doc")}</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t-2 border-[var(--border)]">
                                <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest mb-1 opacity-60">LOGRADOURO DE REGISTRO</p>
                                <p className="text-[13px] font-black text-[var(--foreground)] truncate uppercase tracking-tight">
                                    {watch("street")}, {watch("number")} — {watch("city")}/{watch("state")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--card)] border-4 border-[var(--border)] rounded-[2.5rem] shadow-xl overflow-hidden transition-all hover:border-indigo-500/30">
                        <button
                            type="button"
                            onClick={() => setShowCalcMemory(!showCalcMemory)}
                            className="w-full flex items-center justify-between p-8 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-lg">
                                    <ReceiptText size={24} strokeWidth={3} />
                                </div>
                                <p className="text-[12px] font-black text-[var(--foreground)] uppercase tracking-[0.2em]">MEMÓRIA TÉCNICA DE CÁLCULO</p>
                            </div>
                            {showCalcMemory ? <ChevronUp size={24} strokeWidth={3} className="text-indigo-500" /> : <ChevronDown size={24} strokeWidth={3} className="text-slate-400" />}
                        </button>

                        {showCalcMemory && (
                            <div className="px-8 pb-8 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-4 pt-6 border-t-4 border-[var(--border)]">
                                    {commissionData?.calculationSteps.map((step, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                                            <span className="text-[var(--muted)] opacity-60">{step.label}</span>
                                            <span className={cn(
                                                "px-3 py-1 rounded-lg",
                                                step.type === "positive" ? "bg-emerald-500/10 text-emerald-600" :
                                                    step.type === "negative" ? "bg-rose-500/10 text-rose-600" :
                                                        "bg-indigo-500/10 text-indigo-600"
                                            )}>
                                                {step.value > 0 ? "+" : ""}{step.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-6 mt-4 border-t-4 border-[var(--border)] flex justify-between items-center bg-emerald-500/[0.02] p-4 rounded-2xl">
                                        <span className="text-[13px] font-black text-[var(--foreground)] uppercase tracking-[0.1em]">LUCRO LÍQUIDO PROJETADO</span>
                                        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                            {commissionData?.repasse.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-xl hover:scale-[1.01] transition-all border-4 border-white/10 group">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] mb-6 opacity-80">CONFIGURAÇÕES DE ENTREGA</p>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">MÍDIA ATIVA</p>
                                <p className="text-sm font-black uppercase tracking-tighter">{watch("mediaType")}</p>
                            </div>
                            <div className="h-10 w-px bg-white/20" />
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">MODALIDADE</p>
                                <p className="text-sm font-black uppercase tracking-tighter">{videoConference ? "VIDEOCONFERÊNCIA" : "PRESENCIAL"}</p>
                            </div>
                            <div className="h-10 w-px bg-white/20" />
                            <div className="text-right">
                                <p className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-70">DOCUMENTOS</p>
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="text-sm font-black uppercase tracking-tighter">{attachedFiles.length} ANEXOS</span>
                                    <CheckCircle2 size={16} strokeWidth={3} className="text-emerald-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] border-4 border-white/5 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-1000" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="size-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/20 border-2 border-white/10">
                        <Flame size={32} strokeWidth={3} className="animate-bounce" />
                    </div>
                    <div className="text-left">
                        <p className="text-[14px] font-black uppercase tracking-tight mb-1">MULTIPLICADOR DE PERFORMANCE</p>
                        <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest opacity-80">SEQUÊNCIA DE 5 DIAS ATIVA NO SISTEMA</p>
                    </div>
                </div>
                <div className="text-xl font-black text-white bg-indigo-600 px-6 py-3 rounded-2xl uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/30 border-2 border-white/20 relative z-10">
                    2x XP
                </div>
            </div>
        </div >
    );

    const onSubmitAction = async (data: OrderFormData, isDraft: boolean = false) => {
        setIsConsulting(true);
        try {
            const formData = new FormData();

            // Append all form data
            Object.entries(data).forEach(([key, val]) => {
                if (val !== undefined && val !== null) {
                    formData.append(key, String(val));
                }
            });

            // Metadata
            formData.append('origin', 'Venda Direta');
            formData.append('seller_id', currentUser.id);
            formData.append('seller_commission', String(commissionData?.repasse || 0));
            formData.append('xp_reward', String(Math.floor(data.customPrice)));

            if (isDraft) formData.append('isDraft', 'true');
            if (editingOrder?.id) formData.append('id', editingOrder.id);

            if (commissionData) {
                formData.append('partner_cost', String(commissionData.partnerCost));
                formData.append('taxes', String(commissionData.taxes));
                formData.append('fixed_fees', String(commissionData.fixedFees));
            }

            if (commissionData?.calculationSteps) {
                formData.append('calculation_memory', JSON.stringify(commissionData.calculationSteps));
            }

            // Files
            attachedFiles.forEach((file) => {
                formData.append('files', file);
            });

            const response = await axios.post('/api/integracao/vendas', formData);

            if (response.data.success) {
                setProtocol(response.data.protocol);
                setPaymentLink(response.data.paymentLink);
                setScheduleLink(response.data.scheduleLink);

                // For drafts, we don't show the success screen with payment links, 
                // we just close and notify or show a simpler success
                if (isDraft) {
                    alert("Rascunho salvo com sucesso!");
                    onClose();
                    mutate('/api/certificates');
                    return;
                }

                setIsSuccess(true);

                // Update metrics locally (Only for real sales)
                if (commissionData) {
                    updateUser({
                        xp: currentUser.xp + Math.floor(data.customPrice),
                        wallet: currentUser.wallet + (commissionData.repasse || 0)
                    });
                }
                mutate('/api/certificates');
            }
        } catch (error: any) {
            console.error("Submission error:", error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || "Erro desconhecido";
            alert(`Erro ao finalizar pedido: ${errorMsg}`);
        } finally {
            setIsConsulting(false);
        }
    };

    if (isSuccess) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="PEDIDO DISPARADO!" width="2xl">
                <div className="p-10 flex flex-col items-center text-center space-y-10 animate-in zoom-in-95 duration-700">
                    <div className="size-24 bg-emerald-500/10 text-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 border-4 border-emerald-500/20 scale-110 active:scale-95 transition-transform">
                        <CheckCircle2 size={56} strokeWidth={3} className="animate-in zoom-in duration-500 delay-200" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-4xl font-black text-[var(--foreground)] tracking-tighter uppercase leading-tight">OPERAÇÃO CONCLUÍDA</h2>
                        <p className="text-[var(--muted)] text-[11px] font-black uppercase tracking-[0.3em] opacity-60">O PROTOCOLO <span className="text-primary font-black px-2 py-0.5 bg-primary/10 rounded-lg">{protocol}</span> FOI REGISTRADO NA BLOCKCHAIN DE VENDAS.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        <a
                            href={paymentLink}
                            target="_blank"
                            className="flex flex-col items-center p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/30 hover:scale-[1.05] transition-all group border-4 border-white/10"
                        >
                            <DollarSign size={32} strokeWidth={3} className="mb-4 group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">COBRANÇA VIA PIX/CARTÃO</span>
                            <span className="text-sm font-black uppercase tracking-tighter">LINK DE PAGAMENTO</span>
                        </a>

                        <button
                            onClick={() => window.open(scheduleLink || `https://agenda.delta.com.br/schedule/${protocol}`, '_blank')}
                            className="flex flex-col items-center p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-black/30 hover:scale-[1.05] transition-all group border-4 border-white/5"
                        >
                            <Calendar size={32} strokeWidth={3} className="mb-4 group-hover:-rotate-12 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">RESERVAR HORÁRIO</span>
                            <span className="text-sm font-black uppercase tracking-tighter">LINK DE AGENDAMENTO</span>
                        </button>

                        <div className="md:col-span-2 p-8 bg-blue-600 text-white rounded-3xl border-4 border-white/10 text-left flex items-start gap-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                            <div className="size-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 border-2 border-white/20 shadow-lg">
                                <Clock size={28} strokeWidth={3} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-[13px] font-black uppercase tracking-[0.1em] mb-1">STATUS DO PEDIDO: AGUARDANDO PAGAMENTO</h4>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-relaxed italic">A LIBERAÇÃO DA EMISSÃO OCORRE INSTANTANEAMENTE APÓS A CONFIRMAÇÃO DO RECEBIMENTO.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-12 py-5 rounded-2xl border-4 border-[var(--border)] text-[11px] font-black text-[var(--muted)] uppercase tracking-[0.5em] hover:text-[var(--foreground)] hover:border-primary/40 transition-all active:scale-95 shadow-lg"
                    >
                        RETORNAR AO PAINEL
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nova Emissão de Certificado"
            width="2xl"
        >
            <div className="flex flex-col h-auto md:h-auto min-h-[600px] -m-4 md:-m-8 bg-[var(--background)]">
                {/* Premium Top Stepper */}
                <div className="px-10 pt-10 pb-6 border-b-4 border-[var(--border)] bg-primary/[0.02]">
                    <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex-1 flex flex-col gap-3 group">
                                <div className={cn(
                                    "h-2 rounded-full transition-all duration-700 shadow-sm",
                                    step >= s ? "bg-primary" : "bg-[var(--border)]"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-[0.4em] text-center transition-all duration-300",
                                    step === s ? "text-primary scale-110" : "text-[var(--muted)] opacity-40 group-hover:opacity-60"
                                )}>
                                    PASSO 0{s}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-10 md:p-14 max-w-4xl mx-auto w-full custom-scrollbar">
                        {/* Mobile Stepper Indicator */}
                        <div className="flex md:hidden flex-col gap-4 mb-10 pb-6 border-b-4 border-[var(--border)]">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black uppercase text-primary tracking-[0.4em] leading-none mb-1">PROCESSO: {step}/04</p>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={cn("h-2 w-8 rounded-full transition-all duration-500", step === i ? "bg-primary w-14" : step > i ? "bg-emerald-500" : "bg-[var(--border)]")} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">
                                {step === 1 ? "ESCOLHA DO PRODUTO" : step === 2 ? "DADOS DO TITULAR" : step === 3 ? "TÉCNICO & FATURA" : "CONFERÊNCIA FINAL"}
                            </p>
                        </div>

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>

                    <div className="p-10 md:p-12 bg-[var(--card)] border-t-4 border-[var(--border)] flex flex-col md:flex-row gap-6 justify-between items-center shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.1)]">
                        <button
                            type="button"
                            onClick={step === 1 ? onClose : handleBack}
                            className="order-3 md:order-1 w-full md:w-auto px-10 py-5 text-[11px] font-black uppercase tracking-[0.4em] text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/5 rounded-2xl transition-all border-2 border-transparent active:scale-95"
                        >
                            {step === 1 ? "ABANDONAR FLUXO" : "VOLTAR ETAPA"}
                        </button>

                        <div className="order-1 md:order-2 w-full md:w-auto flex flex-col md:flex-row gap-4">
                            <button
                                type="button"
                                onClick={() => onSubmitAction(watch() as any, true)}
                                disabled={isConsulting}
                                className="w-full md:w-auto px-10 py-5 rounded-2xl bg-[var(--background)] text-[var(--muted)] text-[11px] font-black uppercase tracking-[0.3em] hover:text-[var(--foreground)] hover:border-primary/40 border-2 border-[var(--border)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 active:scale-95 shadow-lg"
                            >
                                <Save size={18} strokeWidth={3} className="group-hover:scale-125 transition-transform" />
                                SALVAR RASCUNHO
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (step === 4) {
                                        handleSubmit((data) => onSubmitAction(data, false), (errors) => {
                                            const errorFields = Object.keys(errors).join(", ");
                                            alert(`OPS! CAMPOS INVÁLIDOS: ${errorFields}. POR FAVOR, REVISE OS PASSOS ANTERIORES.`);
                                        })();
                                    } else {
                                        handleNext();
                                    }
                                }}
                                disabled={isConsulting || (step === 1 && !selectedProductId) || (step === 2 && attachedFiles.length === 0)}
                                className={cn(
                                    "w-full md:w-80 px-12 py-5 rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] transition-all shadow-2xl active:scale-95 disabled:opacity-50 flex items-center justify-center border-2 border-white/10 group",
                                    step === 4
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                                        : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
                                )}
                            >
                                {isConsulting ? (
                                    <div className="size-5 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {step === 4 ? "FINALIZAR EMISSÃO" : "AVANÇAR AGORA"}
                                        <ArrowRight size={18} strokeWidth={3} className="ml-3 group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
