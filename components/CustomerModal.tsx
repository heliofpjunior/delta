import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import SearchSelect from "./ui/SearchSelect";
import { Plus, Trash2, MapPin, Paperclip, Users, Building2, User, MessageCircle, Shield, AlertCircle, Tag, CheckCircle2, Circle, Clock, FileText, ExternalLink, X, UploadCloud, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const contactSchema = z.object({
    id: z.string().optional(),
    type: z.enum(["WhatsApp", "Email", "Telefone", "Outro"]),
    tag: z.string().optional().or(z.literal("")),
    value: z.string().optional().or(z.literal("")),
});

const customerSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    doc: z.string().min(11, "CPF/CNPJ é obrigatório (mínimo 11 dígitos)"),
    email: z.string().email("E-mail inválido").nullish().or(z.literal("")),
    phone: z.string().nullish().or(z.literal("")),
    status: z.enum(["Lead", "Oportunidade", "Ativo", "Vencido", "Arquivado"]).optional(),
    origin: z.enum(["Renovação", "Migração"]).optional(),
    certificate_type: z.string().optional().or(z.literal("")),
    expiry_date: z.string().optional().or(z.literal("")),

    // Endereço
    address_zip: z.string().nullish().or(z.literal("")),
    address_street: z.string().nullish().or(z.literal("")),
    address_number: z.string().nullish().or(z.literal("")),
    address_complement: z.string().nullish().or(z.literal("")),
    address_neighborhood: z.string().nullish().or(z.literal("")),
    address_city: z.string().nullish().or(z.literal("")),
    address_state: z.string().nullish().or(z.literal("")),

    document_url: z.string().nullish().or(z.literal("")), // Store as JSON string of array
    responsible_cpf: z.string().nullish().or(z.literal("")),
    parent_id: z.string().nullish().or(z.literal("")),

    contacts: z.array(contactSchema).optional().default([]),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CustomerFormData) => void;
    initialData?: any;
    title: string;
    submissionError?: string | null;
}

export default function CustomerModal({ isOpen, onClose, onSubmit, initialData, title, submissionError }: CustomerModalProps) {
    const [activeSection, setActiveSection] = useState<"dados" | "endereco" | "documentos">("dados");
    const [newContact, setNewContact] = useState<{ type: "WhatsApp" | "Email" | "Telefone" | "Outro", tag: string, value: string }>({
        type: "WhatsApp",
        tag: "",
        value: ""
    });
    const [showTagInput, setShowTagInput] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { data: allCustomers } = useSWR('/api/customers', fetcher);
    const [isPFRapidoOpen, setIsPFRapidoOpen] = useState(false);
    const [newPF, setNewPF] = useState({ name: "", doc: "" });

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        control,
        formState: { errors, isSubmitting }
    } = useForm<CustomerFormData>({
        resolver: zodResolver(customerSchema) as any,
        defaultValues: {
            status: "Lead",
            origin: "Renovação",
            contacts: [],
            address_zip: "",
            address_street: "",
            address_number: "",
            address_complement: "",
            address_neighborhood: "",
            address_city: "",
            address_state: ""
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "contacts"
    });

    const docValue = watch("doc");
    const contactsValue = watch("contacts") || [];

    // Debugging errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("Form Errors:", errors);
        }
    }, [errors]);

    // Fetch order history for the sales lifecycle
    const { data: orders } = useSWR(
        docValue && docValue.length >= 11 ? `/api/consulta/pedidos?doc=${docValue.replace(/\D/g, '')}` : null,
        fetcher
    );

    const latestOrder = orders && Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

    useEffect(() => {
        if (initialData) {
            // Map legacy phone/email and contacts to the unified list if needed
            // But for now, just load what we have
            reset({
                ...initialData,
                expiry_date: initialData.expiry_date ? new Date(initialData.expiry_date).toISOString().split('T')[0] : "",
                contacts: initialData.contacts && Array.isArray(initialData.contacts) ? initialData.contacts.map((c: any) => ({
                    id: c.id,
                    type: c.phone ? (c.phone.includes('wa') ? 'WhatsApp' : 'Telefone') : c.email ? 'Email' : 'Outro',
                    tag: c.department || c.tag || '',
                    value: c.phone || c.email || c.value || ''
                })) : []
            });
        } else {
            reset({
                name: "",
                doc: "",
                email: "",
                phone: "",
                status: "Lead",
                origin: "Renovação",
                contacts: [],
                address_zip: "",
                address_street: "",
                address_number: "",
                address_complement: "",
                address_neighborhood: "",
                address_city: "",
                address_state: ""
            });
        }
    }, [initialData, reset, isOpen]);

    // Parse document URLs from JSON string
    const getDocumentUrls = (): string[] => {
        const value = watch("document_url");
        if (!value) return [];
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return value ? [value] : [];
        }
    };

    const documentUrls = getDocumentUrls();

    const pfList = ((allCustomers as any[]) || []).filter((c: any) => c.doc?.replace(/\D/g, '').length === 11);

    const handleFormSubmit = (data: CustomerFormData) => {
        let finalContacts = [...(data.contacts || [])];

        // Intelligent Auto-Add: If list is empty and user left something in the input, add it!
        if (finalContacts.length === 0 && newContact.value.trim() !== "") {
            console.log("CustomerModal: Auto-adding pending contact", newContact);
            finalContacts.push({ ...newContact });
            // Update form state too
            setValue("contacts" as any, finalContacts);
        }

        if (finalContacts.length === 0) {
            handleFormError({ contacts: { message: "Adicione pelo menos um meio de contato (clique no OK azul)" } });
            return;
        }

        console.log("CustomerModal: Valid data submitted", { ...data, contacts: finalContacts });
        onSubmit({ ...data, contacts: finalContacts });
    };

    const handleFormError = (err: any) => {
        console.error("CustomerModal: Validation Errors Detail:", JSON.stringify(err, null, 2));
    };

    const isPJ = docValue?.replace(/\D/g, '').length === 14;
    const statusValue = watch("status") || "Lead";

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newUrls = [...documentUrls];
        let hasError = false;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 3 * 1024 * 1024) {
                alert(`O arquivo "${file.name}" ultrapassa o limite de 3MB.`);
                hasError = true;
                continue;
            }

            setIsUploading(true);
            // Simulation
            await new Promise(resolve => setTimeout(resolve, 800));
            const mockUrl = URL.createObjectURL(file);
            newUrls.push(mockUrl);
        }

        setValue("document_url", JSON.stringify(newUrls));
        setIsUploading(false);
        if (event.target) event.target.value = ""; // Reset input
    };

    const removeDocument = (urlToRemove: string) => {
        const filtered = documentUrls.filter(url => url !== urlToRemove);
        setValue("document_url", filtered.length > 0 ? JSON.stringify(filtered) : "");
    };

    const LifecycleTracker = () => {
        const stages = [
            { id: "Lead", label: "Lead", icon: User },
            { id: "Oportunidade", label: "Oportunidade", icon: Clock },
            { id: "Ativo", label: "Ativo", icon: Shield },
        ];

        // Determine progress based on status
        const getProgress = () => {
            if (statusValue === "Lead") return 0;
            if (statusValue === "Oportunidade") return 50;
            if (statusValue === "Ativo") return 100;
            if (statusValue === "Vencido") return 100;
            return 0;
        };

        return (
            <div className="relative mb-8 pt-2 px-2">
                <div className="absolute top-[26px] left-10 right-10 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />
                <div
                    className="absolute top-[26px] left-10 h-0.5 bg-primary transition-all duration-500 ease-out -z-0"
                    style={{ width: `calc(${getProgress()}% - 20px)` }}
                />

                <div className="flex justify-between relative z-10">
                    {stages.map((stage, idx) => {
                        const isActive = statusValue === stage.id || (idx === 0 && (statusValue === "Oportunidade" || statusValue === "Ativo")) || (idx === 1 && statusValue === "Ativo");
                        const isCurrent = statusValue === stage.id;

                        return (
                            <div key={stage.id} className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "size-9 rounded-full flex items-center justify-center border-4 transition-all duration-300",
                                    isCurrent ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110" :
                                        isActive ? "bg-primary/10 text-primary border-primary/20" : "bg-white dark:bg-slate-900 text-slate-300 border-slate-100 dark:border-slate-800"
                                )}>
                                    <stage.icon size={16} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    isActive ? "text-primary" : "text-slate-400"
                                )}>
                                    {stage.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const sections = [
        { id: "dados", label: "Dados Básicos", icon: Users },
        { id: "endereco", label: "Endereço", icon: MapPin },
        { id: "documentos", label: "Documentos", icon: Paperclip },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {/* Tabs Navigation - Denser */}
            <div className="flex p-0.5 bg-slate-100 dark:bg-slate-900 rounded-none mb-4 overflow-x-auto no-scrollbar">
                {sections.map((section) => (
                    <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id as any)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-none text-[10px] font-bold transition-all whitespace-nowrap flex-1 justify-center",
                            activeSection === section.id
                                ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        <section.icon size={14} />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Loud error box if validation fails */}
            {(Object.keys(errors).length > 0 || (contactsValue.length === 0 && activeSection === "dados")) && (
                <div className="mb-4 p-3 bg-rose-500/10 border-2 border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-black uppercase animate-pulse">
                    <AlertCircle size={14} />
                    <span>
                        {contactsValue.length === 0 ? "Faltou adicionar o contato! Digite e clique no OK azul." : "Cadastro incompleto: verifique os campos em vermelho."}
                    </span>
                </div>
            )}

            {submissionError && (
                <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-rose-600 text-[10px] font-bold uppercase">
                    <AlertCircle size={14} />
                    <span>Erro ao salvar: {submissionError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit, handleFormError)} className="space-y-4">
                {activeSection === "dados" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Summary Header - Sales Focused */}
                        <LifecycleTracker />
                        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none mb-2">
                            <div className={cn(
                                "size-12 rounded-xl flex items-center justify-center font-black text-lg",
                                isPJ ? "bg-primary/10 text-primary" : "bg-emerald-500/10 text-emerald-600"
                            )}>
                                {isPJ ? <Building2 size={24} /> : <User size={24} />}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status do Ciclo de Vida</h3>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border",
                                        latestOrder ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" : "bg-slate-500/10 text-slate-500 border-slate-500/10"
                                    )}>
                                        {latestOrder ? `Ativo: ${latestOrder.product_name}` : "Sem Certificado"}
                                    </span>
                                    {latestOrder && (
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            Vence {new Date(latestOrder.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label="Identificação (Nome/Razão)"
                                {...register("name")}
                                error={errors.name?.message}
                                placeholder="Ex: João Silva ou Empresa LTDA"
                            />
                            <Input
                                label="CPF / CNPJ"
                                {...register("doc")}
                                error={errors.doc?.message}
                                placeholder="000.000.000-00"
                            />
                        </div>

                        {/* Consolidated Contacts UI */}
                        <div className="p-5 bg-slate-50 dark:bg-slate-900/50 rounded-none border border-slate-200 dark:border-slate-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Meios de Contato (WhatsApp, Email, etc)</h3>
                            </div>

                            {/* Quick Add Form - Now with Conditional Tag */}
                            <div className="flex flex-col gap-2 mb-4">
                                <div className="flex gap-2 items-center">
                                    <select
                                        className="px-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-black uppercase w-[90px] shrink-0"
                                        value={newContact.type}
                                        onChange={(e) => setNewContact({ ...newContact, type: e.target.value as any })}
                                    >
                                        <option value="WhatsApp">WhatsApp</option>
                                        <option value="Email">Email</option>
                                        <option value="Telefone">Telefone</option>
                                        <option value="Outro">Outro</option>
                                    </select>
                                    <input
                                        type="text"
                                        placeholder="Valor (Email ou Tel)"
                                        className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
                                        value={newContact.value}
                                        onChange={(e) => setNewContact({ ...newContact, value: e.target.value })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowTagInput(!showTagInput)}
                                        className={cn(
                                            "size-9 rounded-lg flex items-center justify-center transition-all border",
                                            showTagInput ? "bg-primary/10 text-primary border-primary/20" : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800"
                                        )}
                                        title="Adicionar Etiqueta"
                                    >
                                        <Tag size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newContact.value) {
                                                append(newContact);
                                                setNewContact({ ...newContact, tag: "", value: "" });
                                                setShowTagInput(false);
                                            }
                                        }}
                                        className="px-4 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                                    >
                                        OK
                                    </button>
                                </div>

                                {showTagInput && (
                                    <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                                        <div className="w-[90px] shrink-0" /> {/* Alignment spacer */}
                                        <input
                                            type="text"
                                            placeholder="Etiqueta / Tag (ex: Financeiro, Pessoal)"
                                            className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold placeholder:italic"
                                            value={newContact.tag}
                                            onChange={(e) => setNewContact({ ...newContact, tag: e.target.value })}
                                            autoFocus
                                        />
                                        <div className="w-[88px] shrink-0" /> {/* Alignment spacer */}
                                    </div>
                                )}
                            </div>
                            {errors.contacts && (
                                <p className="text-[10px] text-rose-500 font-bold mt-1 animate-pulse">
                                    {errors.contacts.message}
                                </p>
                            )}

                            {/* Contact List - Now Below Form */}
                            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 border border-slate-100 dark:border-slate-700/50 rounded-lg group animate-in fade-in zoom-in-95">
                                        <div className="size-8 rounded-lg bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400">
                                            {fields[index].type === 'WhatsApp' ? <MessageCircle size={14} className="text-emerald-500" /> :
                                                fields[index].type === 'Email' ? <Paperclip size={14} className="text-blue-500" /> : <User size={14} />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold truncate">{fields[index].value}</span>
                                                <span className="text-[8px] font-black uppercase tracking-tighter bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{fields[index].tag || 'Geral'}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="size-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {fields.length === 0 && (
                                    <div className="py-8 text-center border-2 border-dashed border-slate-200/50 dark:border-slate-800 rounded-xl">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum meio de contato</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tipo de Abordagem</label>
                                <SegmentedControl
                                    options={["Renovação", "Migração"]}
                                    value={watch("origin") || "Renovação"}
                                    onChange={(v) => setValue("origin", v as any)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estágio no Funil</label>
                                <SegmentedControl
                                    options={["Lead", "Oportunidade", "Ativo", "Vencido", "Arquivado"]}
                                    value={watch("status") || "Lead"}
                                    onChange={(v) => setValue("status", v as any)}
                                />
                            </div>
                        </div>

                        {/* Manual Certificate Input for Migrations */}
                        {watch("origin") === "Migração" && (
                            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-rose-500" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600">Certificado Atual (Concorrência)</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input
                                        label="Tipo do Certificado"
                                        {...register("certificate_type")}
                                        placeholder="Ex: e-CPF A1"
                                    />
                                    <Input
                                        label="Data de Vencimento"
                                        type="date"
                                        {...register("expiry_date")}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Order History - Opportunity Helper */}
                        {orders && Array.isArray(orders) && orders.length > 0 && (
                            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-primary" />
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Histórico de Certificados</h3>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {orders.slice(0, 3).map((order: any) => (
                                        <div key={order.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800/50 rounded-lg group hover:border-primary/30 transition-all">
                                            <div className="flex-1">
                                                <p className="text-[11px] font-black text-slate-700 dark:text-slate-200">{order.product_name}</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase">Emitido em {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[8px] font-black uppercase">R$ {order.total_amount?.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeSection === "endereco" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <Input label="CEP" {...register("address_zip")} error={errors.address_zip?.message} placeholder="00000-000" />
                            </div>
                            <div className="sm:col-span-2">
                                <Input label="Logradouro" {...register("address_street")} error={errors.address_street?.message} placeholder="Rua, Av..." />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Input label="Número" {...register("address_number")} error={errors.address_number?.message} placeholder="123" />
                            <div className="sm:col-span-2">
                                <Input label="Complemento" {...register("address_complement")} error={errors.address_complement?.message} placeholder="Apto, Sala..." />
                            </div>
                        </div>

                        <Input label="Bairro" {...register("address_neighborhood")} error={errors.address_neighborhood?.message} placeholder="Centro" />

                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Cidade" {...register("address_city")} error={errors.address_city?.message} placeholder="São Paulo" />
                            <Input label="Estado" {...register("address_state")} error={errors.address_state?.message} placeholder="SP" />
                        </div>
                    </div>
                )}

                {activeSection === "documentos" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="application/pdf,image/*"
                            multiple
                        />

                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                                "p-8 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer transition-all group",
                                isUploading ? "bg-slate-50 dark:bg-slate-900 border-primary/20" : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/[0.02]"
                            )}
                        >
                            <div className={cn(
                                "size-16 rounded-3xl flex items-center justify-center mb-3 transition-all",
                                isUploading ? "bg-primary/20 text-primary animate-pulse" : "bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                            )}>
                                {isUploading ? <UploadCloud size={28} /> : <Paperclip size={28} />}
                            </div>
                            <h3 className="text-[11px] font-black uppercase tracking-widest mb-1">
                                {isUploading ? "Sincronizando..." : "Adicionar Documentos (CNH/RG/Contrato)"}
                            </h3>
                            <p className="text-[9px] text-slate-500 font-bold max-w-[200px] mb-4 lowercase tracking-tight">
                                Limite de 3MB por arquivo. PDF ou Imagem.
                            </p>
                            <div className="px-5 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10">
                                {documentUrls.length > 0 ? "Anexar Mais" : "Selecionar Arquivos"}
                            </div>
                        </div>

                        {documentUrls.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Anexos Vinculados ({documentUrls.length})</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {documentUrls.map((url, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 animate-in zoom-in-95 group hover:border-primary/30 transition-all">
                                            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                                <CheckCircle2 size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-900 dark:text-white truncate">Documento #{idx + 1}</p>
                                                <p className="text-[8px] text-slate-400 font-bold uppercase">Disponível para visualização</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); window.open(url, '_blank'); }}
                                                    className="size-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-lg transition-all"
                                                    title="Visualizar"
                                                >
                                                    <ExternalLink size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeDocument(url); }}
                                                    className="size-8 flex items-center justify-center bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/10"
                                                    title="Remover"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {isPJ && (
                            <div className="space-y-4">
                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                            <User size={14} />
                                            Responsável Legal (PF)
                                        </div>
                                        {watch("responsible_cpf") && (
                                            <button
                                                type="button"
                                                onClick={() => setValue("responsible_cpf", "")}
                                                className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                            >
                                                Remover Vínculo
                                            </button>
                                        )}
                                    </div>

                                    {!watch("responsible_cpf") ? (
                                        <div className="space-y-4">
                                            <SearchSelect
                                                label="Vincular Responsável Existente"
                                                placeholder="Busque por Nome ou CPF..."
                                                options={((allCustomers as any[]) || [])
                                                    .filter((c: any) => c.doc?.length === 11)
                                                    .map((c: any) => ({ label: `${c.name} (${c.doc})`, value: c.doc }))
                                                }
                                                value={watch("responsible_cpf") || ""}
                                                onChange={(val) => setValue("responsible_cpf", String(val))}
                                                helpText="Selecione uma Pessoa Física da sua base de clientes."
                                            />

                                            <div className="relative">
                                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-100 dark:border-slate-800" />
                                                <span className="relative z-10 mx-auto block w-fit bg-slate-50 dark:bg-slate-900 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Ou</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setIsPFRapidoOpen(!isPFRapidoOpen)}
                                                className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-primary/40 hover:text-primary transition-all"
                                            >
                                                <Plus size={16} />
                                                Cadastrar Novo Responsável
                                            </button>

                                            {isPFRapidoOpen && (
                                                <div className="p-5 bg-white dark:bg-slate-900 border border-primary/20 rounded-2xl space-y-4 animate-in slide-in-from-top-2 duration-300 shadow-xl shadow-primary/5">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Sparkles size={14} className="text-primary" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">Cadastro Rápido PF</span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <Input
                                                            label="Nome Completo"
                                                            placeholder="Nome do Responsável"
                                                            value={newPF.name}
                                                            onChange={(e) => setNewPF({ ...newPF, name: e.target.value })}
                                                        />
                                                        <Input
                                                            label="CPF"
                                                            placeholder="000.000.000-00"
                                                            value={newPF.doc}
                                                            onChange={(e) => setNewPF({ ...newPF, doc: e.target.value })}
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (newPF.name && newPF.doc) {
                                                                // In a real app we might want to POST this separately, 
                                                                // but for now let's just set the CPF and name.
                                                                // Ideally we'd trigger a background save or pass it to the main submit.
                                                                setValue("responsible_cpf", newPF.doc);
                                                                setIsPFRapidoOpen(false);
                                                            }
                                                        }}
                                                        disabled={!newPF.name || newPF.doc.length < 11}
                                                        className="w-full bg-primary text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        Confirmar & Vincular
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-white dark:bg-slate-900 border border-primary/10 rounded-2xl p-4 flex items-center gap-4 animate-in zoom-in-95">
                                            <div className="size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                <User size={24} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                                                    {((allCustomers as any[]) || []).find((c: any) => c.doc === watch("responsible_cpf"))?.name || newPF.name || "Responsável Vinculado"}
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{watch("responsible_cpf")}</p>
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-500/10">
                                                Vínculo Ativo
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full md:w-auto px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full md:flex-1 md:max-w-xs bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                        {isSubmitting ? "Sincronizando..." : "Salvar na Máquina de Vendas"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
