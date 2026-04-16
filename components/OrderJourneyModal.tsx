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
            let defaultPrice = customPrices[selectedProduct.id] || selectedProduct.price;
            
            // Garantir cast numérico seguro, evitando que strings fiquem como 0 no valueAsNumber
            setValue("customPrice", Number(defaultPrice) || 0);
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
                    <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicie o Pedido</h3>
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
                            "p-5 rounded-2xl border-2 text-left transition-all relative group overflow-hidden shadow-sm",
                            selectedCategory === "PF"
                                ? "border-primary bg-primary/[0.05] ring-2 ring-primary/20 scale-[1.01]"
                                : "border-[var(--border)] hover:border-primary/20 bg-[var(--card)]"
                        )}
                    >
                        <div className="flex flex-col gap-3 relative z-10">
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center transition-all",
                                selectedCategory === "PF" ? "bg-primary text-white" : "bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]"
                            )}>
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)] uppercase">Pessoa Física</p>
                                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide opacity-80">Para CPFs</p>
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
                            "p-5 rounded-2xl border-2 text-left transition-all relative group overflow-hidden shadow-sm",
                            selectedCategory === "PJ"
                                ? "border-primary bg-primary/[0.05] ring-2 ring-primary/20 scale-[1.01]"
                                : "border-[var(--border)] hover:border-primary/20 bg-[var(--card)]"
                        )}
                    >
                        <div className="flex flex-col gap-3 relative z-10">
                            <div className={cn(
                                "size-10 rounded-xl flex items-center justify-center transition-all",
                                selectedCategory === "PJ" ? "bg-primary text-white" : "bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]"
                            )}>
                                <Briefcase size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[var(--foreground)] uppercase">Pessoa Jurídica</p>
                                <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide opacity-80">Para Empresas</p>
                            </div>
                        </div>
                    </button>
                </div>

                {selectedCategory && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                            Produtos Disponíveis {selectedCategory && `(${filteredProducts.length} de ${products?.length || 0} carregados)`}
                        </h3>

                        {isLoading && (
                            <div className="p-10 text-center animate-pulse">
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Carregando Catálogo...</p>
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl text-center">
                                <p className="text-xs font-bold text-rose-500 uppercase tracking-wide mb-1">Erro de Conexão</p>
                                <p className="text-[10px] text-rose-400 font-medium">{error.message || "Falha ao consultar banco de dados"}</p>
                            </div>
                        )}

                        {!isLoading && !error && products?.length === 0 && (
                            <div className="p-6 border border-dashed border-[var(--border)] rounded-xl text-center">
                                <p className="text-xs text-amber-500 font-bold uppercase tracking-wide mb-1">Base de Dados Vazia</p>
                                <p className="text-[10px] text-slate-400 font-medium">Nenhum produto cadastrado na tabela 'products'.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredProducts.map((product) => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => setValue("productId", product.id)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all relative group",
                                        selectedProductId === product.id
                                            ? "border-primary bg-primary/[0.05] ring-2 ring-primary/20"
                                            : "border-[var(--border)] hover:border-primary/30 bg-[var(--card)]"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "size-9 rounded-lg flex items-center justify-center transition-all",
                                            selectedProductId === product.id ? "bg-primary text-white" : "bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]"
                                        )}>
                                            {product.type === "A1" ? <Cloud size={18} strokeWidth={2.5} /> : <HardDrive size={18} strokeWidth={2.5} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-[var(--foreground)] uppercase truncate">{product.name}</p>
                                            <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">{product.type}</p>
                                        </div>
                                        {selectedProductId === product.id && <CheckCircle2 className="text-primary animate-in zoom-in" size={20} strokeWidth={2.5} />}
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-2 p-8 border-2 border-dashed border-[var(--border)] rounded-2xl text-center bg-[var(--background)]/50">
                                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">Nenhum produto em estoque para esta categoria.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {selectedProduct && (
                <div className="bg-[var(--card)] rounded-2xl p-6 border-2 border-primary/20 animate-in zoom-in-95 duration-500 shadow-sm mt-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Engenharia de Preço</h4>
                            <p className="text-[10px] text-[var(--muted)] font-medium">Ajuste o valor final para o consumidor</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                            <div className={cn(
                                "flex items-center bg-[var(--background)] rounded-xl border-2 p-1 transition-all shadow-sm",
                                commissionData && commissionData.repasse < 0 ? "border-rose-500 shadow-rose-500/10" : "border-[var(--border)] focus-within:border-primary/50 text-[var(--foreground)]"
                            )}>
                                <span className={cn(
                                    "px-4 text-xs font-bold opacity-80",
                                    commissionData && commissionData.repasse < 0 ? "text-rose-500" : "text-[var(--foreground)]"
                                )}>R$</span>
                                <input
                                    type="number"
                                    min="0"
                                    {...register("customPrice", { valueAsNumber: true })}
                                    className={cn(
                                        "w-24 bg-transparent border-0 focus:ring-0 text-lg font-bold p-2 transition-colors",
                                        commissionData && commissionData.repasse < 0 ? "text-rose-500" : "text-[var(--foreground)]"
                                    )}
                                />
                            </div>
                            {commissionData && commissionData.repasse < 0 && (
                                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest animate-in slide-in-from-top-1">
                                    Margem Negativa Detectada!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="group/section p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] transition-all hover:border-primary/30 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">02</div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">IDENTIFICAÇÃO DO TITULAR</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label={isPJ ? "CNPJ DA EMPRESA" : "CPF DO TITULAR"}
                            {...register("doc")}
                            error={errors.doc?.message}
                            placeholder="DIGITE O DOCUMENTO..."
                            helpText={isConsulting ? "CONSULTANDO SERASA..." : identifiedCustomer ? "✅ PERFIL ENCONTRADO NO CRM" : ""}
                            className={cn("py-2.5 rounded-xl border-2 font-medium uppercase", identifiedCustomer && "border-emerald-500/30 bg-emerald-500/[0.02]")}
                        />
                        {identifiedCustomer && (
                            <div className="mt-3 flex items-center gap-3 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl animate-in slide-in-from-top-2">
                                <Sparkles size={16} strokeWidth={2.5} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">
                                    CLIENTE FIDELIDADE: {identifiedCustomer.total_spent?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} EM COMPRAS
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-2">
                        <Input label={isPJ ? "NOME EMPRESARIAL" : "NOME COMPLETO"} {...register("name")} error={errors.name?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    </div>

                    {isPJ && (
                        <>
                            <Input label="INSCRIÇÃO ESTADUAL" {...register("fantasyName")} placeholder="ISENTO" className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                            <div className="md:col-span-2 pt-6 border-t border-[var(--border)] mt-2">
                                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-4">Representação Legal</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input label="NOME DO REPRESENTANTE" {...register("legalRepName")} placeholder="NOME" className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                    <Input label="CPF DO REPRESENTANTE" {...register("legalRepCpf")} placeholder="000.000.000-00" className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                </div>
                            </div>
                        </>
                    )}

                    <Input label="WHATSAPP / CELULAR" {...register("phone")} error={errors.phone?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase text-blue-600" />
                    <Input label="E-MAIL DE NOTIFICAÇÃO" {...register("email")} error={errors.email?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                </div>
            </div>

            <div className="group/section p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] transition-all hover:border-primary/30 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">03</div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">LOCALIZAÇÃO E LOGÍSTICA</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input label="CEP" {...register("cep")} error={errors.cep?.message} placeholder="00000-000" className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    <div className="md:col-span-3">
                        <Input label="LOGRADOURO" {...register("street")} error={errors.street?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    </div>
                    <Input label="Nº" {...register("number")} error={errors.number?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    <Input label="BAIRRO" {...register("neighborhood")} error={errors.neighborhood?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    <Input label="CIDADE" {...register("city")} error={errors.city?.message} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                    <Input label="UF" {...register("state")} error={errors.state?.message} maxLength={2} className="py-2.5 rounded-xl border-2 font-medium uppercase text-center" />
                </div>
            </div>

            {/* Multi-Document Attachment */}
            <div className="p-6 bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">DOCUMENTAÇÃO ANEXA</p>
                            <p className="text-xs text-[var(--muted)]">CNH, Contrato Social, etc.</p>
                        </div>
                        <label className="cursor-pointer px-6 py-2.5 bg-[var(--background)] hover:bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-xl text-xs font-bold uppercase transition-all shadow-sm">
                            ADICIONAR ARQUIVOS
                            <input type="file" className="hidden" onChange={handleFileChange} accept="image/*,application/pdf" multiple />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {attachedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-sm group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                                        <FileUp size={20} strokeWidth={2} />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-semibold text-[var(--foreground)] truncate">{file.name}</p>
                                        <p className="text-[10px] text-[var(--muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button type="button" onClick={() => removeFile(idx)} className="size-8 flex items-center justify-center text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                                    <XCircle size={18} strokeWidth={2.5} />
                                </button>
                            </div>
                        ))}
                        {attachedFiles.length === 0 && (
                            <div className="col-span-2 p-8 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center bg-transparent">
                                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Nenhum Documento Anexado</p>
                                <p className="text-[10px] text-slate-400 opacity-80">Você pode anexar comprovação posteriormente via app também.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="group/section p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] transition-all hover:border-primary/30 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">04</div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">ESPECIFICAÇÕES TÉCNICAS</h3>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-indigo-600 text-white rounded-2xl border border-indigo-500 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rotate-45 transform translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                        <p className="text-xs font-semibold uppercase text-indigo-200 tracking-wider mb-2 relative z-10">Mídia & Validade</p>
                        <p className="text-xl font-bold uppercase tracking-tight relative z-10">{watch("mediaType")} — Ciclo de 12 Meses</p>
                        <p className="text-[10px] text-indigo-200 font-medium uppercase tracking-widest mt-1 relative z-10 opacity-80">Configuração otimizada para o produto selecionado.</p>
                    </div>

                    <div className="p-2 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-sm">
                        <SegmentedControl
                            label="MODALIDADE DE EMISSÃO"
                            value={videoConference ? "video" : "presencial"}
                            onChange={(v) => setValue("videoConference", v === "video")}
                            options={[
                                { label: "VIDEOCONFERÊNCIA", value: "video" },
                                { label: "PRESENCIAL (FÍSICO)", value: "presencial" },
                            ]}
                        />
                    </div>

                    {!videoConference && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-4 animate-in zoom-in-95">
                            <div className="size-10 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                                <MapPin size={20} strokeWidth={2.5} />
                            </div>
                            <p className="text-xs font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wide leading-relaxed">
                                ATENÇÃO: A EMISSÃO PRESENCIAL REQUER AGENDAMENTO POSTERIOR NO HUB FÍSICO MAIS PRÓXIMO.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <div className="group/section p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] transition-all hover:border-primary/30 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center text-sm font-bold shadow-sm">05</div>
                    <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wider">FLUXO DE FATURAMENTO</h3>
                </div>

                <div className="space-y-6">
                    <div className="p-2 bg-[var(--background)] rounded-2xl border border-[var(--border)] shadow-sm">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500">
                            <Input label="CPF/CNPJ DO PAGADOR" {...register("billingDoc")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                            <Input label="NOME COMPLETO / RAZÃO" {...register("billingName")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                            <Input label="E-MAIL PARA XML/DANFE" {...register("billingEmail")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                            <Input label="TELEFONE DE COBRANÇA" {...register("billingPhone")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-6 gap-4 pt-4">
                                <div className="sm:col-span-2">
                                    <Input label="CEP" {...register("billingCep")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                </div>
                                <div className="sm:col-span-4">
                                    <Input label="ENDEREÇO COMPLETO" {...register("billingStreet")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                </div>
                                <Input label="Nº" {...register("billingNumber")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                <div className="sm:col-span-2">
                                    <Input label="BAIRRO" {...register("billingNeighborhood")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                </div>
                                <div className="sm:col-span-2">
                                    <Input label="CIDADE" {...register("billingCity")} className="py-2.5 rounded-xl border-2 font-medium uppercase" />
                                </div>
                                <Input label="UF" {...register("billingState")} className="py-2.5 rounded-xl border-2 font-medium uppercase text-center" maxLength={2} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden shadow-sm">
                <div className="relative z-10 flex flex-col items-center">
                    <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                        <DollarSign size={24} />
                    </div>

                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-1 uppercase tracking-wider">Revisão Estratégica</h3>
                    <p className="text-xs text-[var(--muted)] font-medium mb-8">Confirme os detalhes e assegure o repasse</p>

                    <div className="w-full bg-[var(--background)] rounded-xl border border-[var(--border)] overflow-hidden">
                        <table className="w-full text-left text-xs uppercase font-semibold text-[var(--muted)]">
                            <thead className="bg-[var(--card)] border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-6 py-4">Produto Selecionado</th>
                                    <th className="px-6 py-4 text-right">Valor Final</th>
                                    <th className="px-6 py-4 text-right text-emerald-600 dark:text-emerald-400">Seu Repasse</th>
                                </tr>
                            </thead>
                            <tbody className="text-[var(--foreground)]">
                                <tr>
                                    <td className="px-6 py-4 truncate max-w-[200px] border-b border-[var(--border)]">{selectedProduct?.name}</td>
                                    <td className="px-6 py-4 text-right font-bold border-b border-[var(--border)]">{customPrice?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400 text-base border-b border-[var(--border)]">
                                        {commissionData?.repasse?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 flex justify-between items-center text-xs font-bold uppercase tracking-wide">
                            <div className="flex items-center gap-2">
                                <Sparkles size={16} />
                                <span>Recompensa: +{selectedProduct && Math.floor(customPrice)} XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-4 text-left">
                    <div className="p-6 bg-[var(--background)] border border-[var(--border)] rounded-xl">
                        <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-4">Identificação do Titular</p>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Nome / Razão Social</p>
                                <p className="text-sm font-semibold truncate">{watch("name")}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Número do Documento</p>
                                <p className="text-sm font-semibold uppercase">{watch("doc")}</p>
                            </div>
                            <div className="col-span-2 pt-4 border-t border-[var(--border)]">
                                <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Endereço</p>
                                <p className="text-sm font-semibold truncate">
                                    {watch("street")}, {watch("number")} — {watch("city")}/{watch("state")}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[var(--background)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                        <button
                            type="button"
                            onClick={() => setShowCalcMemory(!showCalcMemory)}
                            className="w-full flex items-center justify-between p-6 hover:bg-[var(--card)] transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                                    <ReceiptText size={20} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs font-bold uppercase tracking-wide">Memória Técnica de Cálculo</p>
                            </div>
                            {showCalcMemory ? <ChevronUp size={20} className="text-indigo-500" /> : <ChevronDown size={20} className="text-[var(--muted)]" />}
                        </button>

                        {showCalcMemory && (
                            <div className="px-6 pb-6 animate-in slide-in-from-top-4 duration-500">
                                <div className="space-y-3 pt-4 border-t border-[var(--border)]">
                                    {commissionData?.calculationSteps.map((step, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-[11px] font-semibold">
                                            <span className="text-[var(--muted)]">{step.label}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded",
                                                step.type === "positive" ? "text-emerald-600 bg-emerald-500/10" :
                                                    step.type === "negative" ? "text-rose-600 bg-rose-500/10" :
                                                        "text-indigo-600 bg-indigo-500/10"
                                            )}>
                                                {step.value > 0 ? "+" : ""}{step.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    ))}
                                    <div className="pt-4 mt-3 border-t border-[var(--border)] flex justify-between items-center bg-[var(--card)] p-3 rounded-lg">
                                        <span className="text-xs font-bold uppercase">Lucro Líquido Projetado</span>
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            {commissionData?.repasse.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-xl flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">Configurações Base</p>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-[9px] text-[var(--muted)] uppercase">Mídia</p>
                                    <p className="text-xs font-semibold">{watch("mediaType")}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-[var(--muted)] uppercase">Modal</p>
                                    <p className="text-xs font-semibold uppercase">{videoConference ? "Vídeo" : "Presencial"}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] text-[var(--muted)] uppercase">Anexos</p>
                                    <div className="flex items-center gap-1">
                                        <span className="text-xs font-semibold">{attachedFiles.length} arq</span>
                                        {attachedFiles.length > 0 && <CheckCircle2 size={12} className="text-emerald-500" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--card)] p-6 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Flame size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-indigo-900 dark:text-indigo-100">Multiplicador</p>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">Bônus de constância (5 dias)</p>
                    </div>
                </div>
                <div className="text-sm font-bold text-white bg-indigo-500 px-4 py-2 rounded-lg">
                    2x XP
                </div>
            </div>
        </div>
    );

    const onSubmitAction = async (data: OrderFormData, isDraft: boolean = false) => {
        if (commissionData && commissionData.repasse < 0) {
            alert("Erro: O Valor Final está abaixo do mínimo permitido (Margem Negativa). Aumente o valor de venda.");
            return;
        }

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
                        xp: currentUser.xp + Math.floor(data.customPrice)
                        // A carteira NÃO deve ser atualizada aqui, pois o pagamento ainda não foi efetuado.
                        // O saldo será atualizado automaticamente pelo webhook da plataforma quando o status mudar para 'Pago'.
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
            <Modal isOpen={isOpen} onClose={onClose} title="Pedido Disparado" width="2xl">
                <div className="p-8 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-700 mt-4">
                    <div className="size-20 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10 border-2 border-emerald-500/20 scale-110 active:scale-95 transition-transform">
                        <CheckCircle2 size={40} strokeWidth={3} className="animate-in zoom-in duration-500 delay-200" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold text-[var(--foreground)] tracking-tight uppercase">Operação Concluída</h2>
                        <p className="text-[var(--muted)] text-xs font-medium uppercase tracking-wider">Protocolo gerado: <span className="text-primary font-bold px-2 py-1 bg-primary/10 rounded-md tracking-widest">{protocol}</span></p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        <a
                            href={paymentLink}
                            target="_blank"
                            className="flex flex-col items-center p-6 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all group border border-white/10"
                        >
                            <DollarSign size={24} strokeWidth={3} className="mb-2 group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">COBRANÇA VIA PIX/CARTÃO</span>
                            <span className="text-sm font-bold uppercase">LINK DE PAGAMENTO</span>
                        </a>

                        <button
                            onClick={() => window.open(scheduleLink || `https://agenda.delta.com.br/schedule/${protocol}`, '_blank')}
                            className="flex flex-col items-center p-6 bg-slate-900 text-white rounded-2xl shadow-lg shadow-black/20 hover:scale-[1.02] transition-all group border border-slate-700"
                        >
                            <Calendar size={24} strokeWidth={3} className="mb-2 group-hover:-rotate-12 transition-transform" />
                            <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-80">RESERVAR HORÁRIO</span>
                            <span className="text-sm font-bold uppercase">LINK DE AGENDAMENTO</span>
                        </button>

                        <div className="md:col-span-2 p-6 bg-blue-600 text-white rounded-2xl border border-white/10 text-left flex items-center gap-4 shadow-md relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-125 transition-transform duration-1000" />
                            <div className="size-12 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                                <Clock size={24} strokeWidth={2.5} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="text-sm font-bold uppercase tracking-wider mb-1">Status: Aguardando Pagamento</h4>
                                <p className="text-[10px] font-medium uppercase tracking-wide opacity-80 leading-relaxed">A liberação da emissão ocorre instantaneamente após a confirmação do pagamento.</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl border-2 border-[var(--border)] text-xs font-bold text-[var(--muted)] uppercase tracking-widest hover:text-[var(--foreground)] hover:border-primary/40 transition-all active:scale-95 shadow-sm mt-4"
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
            title="Nova Emissão"
            width="2xl"
        >
            <div className="flex flex-col h-auto md:h-auto min-h-[600px] -m-4 md:-m-6 bg-[var(--background)]">
                {/* Clean Top Stepper */}
                <div className="px-6 md:px-10 pt-8 pb-4 border-b border-[var(--border)] bg-[var(--card)]">
                    <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex-1 flex flex-col gap-2 group">
                                <div className={cn(
                                    "h-1.5 rounded-full transition-all duration-500",
                                    step >= s ? "bg-primary" : "bg-[var(--border)]"
                                )} />
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest text-center transition-all duration-300",
                                    step === s ? "text-primary" : "text-[var(--muted)] opacity-50"
                                )}>
                                    PASSO 0{s}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-4xl mx-auto w-full custom-scrollbar">
                        {/* Mobile Stepper Indicator */}
                        <div className="flex md:hidden flex-col gap-2 mb-8 pb-4 border-b border-[var(--border)]">
                            <p className="text-[10px] font-bold uppercase text-primary tracking-widest leading-none mb-1">PROCESSO: {step}/04</p>
                            <p className="text-lg font-bold text-[var(--foreground)] uppercase tracking-tight">
                                {step === 1 ? "Produto" : step === 2 ? "Titular" : step === 3 ? "Logística" : "Revisão Final"}
                            </p>
                        </div>

                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>

                    <div className="p-6 md:p-8 bg-[var(--card)] border-t border-[var(--border)] flex flex-col md:flex-row gap-4 justify-between items-center z-10">
                        <button
                            type="button"
                            onClick={step === 1 ? onClose : handleBack}
                            className="order-3 md:order-1 w-full md:w-auto px-6 py-3 text-xs font-bold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] rounded-xl transition-all active:scale-95"
                        >
                            {step === 1 ? "Cancelar" : "Voltar"}
                        </button>

                        <div className="order-1 md:order-2 w-full md:w-auto flex flex-col md:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => onSubmitAction(watch() as any, true)}
                                disabled={isConsulting}
                                className="w-full md:w-auto px-6 py-3 rounded-xl bg-[var(--background)] text-[var(--muted)] text-xs font-bold uppercase tracking-wider hover:text-[var(--foreground)] hover:border-primary/40 border-2 border-[var(--border)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 active:scale-95"
                            >
                                <Save size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                                Salvar Rascunho
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
                                disabled={isConsulting || (step === 1 && !selectedProductId) || (step === 1 && commissionData && commissionData.repasse < 0) || (step === 2 && attachedFiles.length === 0)}
                                className={cn(
                                    "w-full md:w-64 px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center group",
                                    step === 4
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
                                        : "bg-primary text-white hover:bg-primary/90 shadow-primary/20"
                                )}
                            >
                                {isConsulting ? (
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {step === 4 ? "FINALIZAR EMISSÃO" : "AVANÇAR AGORA"}
                                        <ArrowRight size={16} strokeWidth={3} className="ml-2 group-hover:translate-x-1 transition-transform" />
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
