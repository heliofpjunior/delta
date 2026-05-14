"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import SearchSelect from "./ui/SearchSelect";
import { useEffect, useState } from "react";
import { Ticket, X, Plus, Search, Check } from "lucide-react";

const couponSchema = z.object({
    code: z.string().min(3, "Código deve ter pelo menos 3 caracteres").toUpperCase(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.string().min(1, "Informe o valor"),
    expiresAt: z.string().optional(),
    applicableProducts: z.string().optional(),
    allowedDocs: z.string().optional()
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CouponFormData) => void;
    initialData?: any;
    title: string;
    products?: any[];
}

export default function CouponModal({ isOpen, onClose, onSubmit, initialData, title, products = [] }: CouponModalProps) {
    const [docInput, setDocInput] = useState("");
    const [productSearch, setProductSearch] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<CouponFormData>({
        resolver: zodResolver(couponSchema),
    });

    useEffect(() => {
        if (initialData) {
            reset({
                code: initialData.code || "",
                discountType: initialData.discount_type || "percent",
                discountValue: String(initialData.discount_value) || "",
                expiresAt: initialData.expires_at ? new Date(initialData.expires_at).toISOString().split('T')[0] : "",
                applicableProducts: initialData.applicable_products?.join(", ") || "",
                allowedDocs: initialData.allowed_docs?.join(", ") || ""
            });
        } else {
            reset({ 
                code: "", 
                discountType: "percent", 
                discountValue: "",
                expiresAt: "",
                applicableProducts: "",
                allowedDocs: ""
            });
        }
    }, [initialData, reset, isOpen]);

    const discountType = watch("discountType");

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-2">
                <div className="bg-emerald-500/5 border-2 border-emerald-500/10 p-6 rounded-[2rem] flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Configuração de Incentivo</p>
                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase">O VALOR SERÁ ABATIDO DA SUA COMISSÃO</p>
                    </div>
                </div>

                <Input
                    label="Código do Cupom"
                    {...register("code")}
                    error={errors.code?.message}
                    placeholder="Ex: PROMO10"
                    helpText="Crie nomes curtos e memoráveis."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <SegmentedControl
                        label="Tipo de Desconto"
                        value={discountType}
                        onChange={(val) => setValue("discountType", val as any)}
                        options={[
                            { label: "Porcentagem (%)", value: "percent" },
                            { label: "Valor Fixo (R$)", value: "fixed" },
                        ]}
                    />
                    <Input
                        label={discountType === "percent" ? "Porcentagem (%)" : "Valor Fixo (R$)"}
                        {...register("discountValue")}
                        error={errors.discountValue?.message}
                        placeholder={discountType === "percent" ? "10" : "20.00"}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start border-t border-[var(--border)] pt-6">
                    <Input
                        label="Validade (Opcional)"
                        type="date"
                        {...register("expiresAt")}
                        error={errors.expiresAt?.message}
                    />
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">CPFs/CNPJs Autorizados</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={docInput}
                                onChange={(e) => setDocInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (docInput.trim()) {
                                            const currentDocs = watch("allowedDocs") ? watch("allowedDocs")!.split(',').filter(x=>x) : [];
                                            const cleaned = docInput.trim().replace(/\D/g, '');
                                            if (cleaned && !currentDocs.includes(cleaned)) {
                                                currentDocs.push(cleaned);
                                                setValue("allowedDocs", currentDocs.join(','));
                                            }
                                            setDocInput("");
                                        }
                                    }
                                }}
                                onPaste={(e) => {
                                    e.preventDefault();
                                    const pasteData = e.clipboardData.getData('text');
                                    if (pasteData) {
                                        const parts = pasteData.split(/[,\n;\t]+/);
                                        const currentDocs = watch("allowedDocs") ? watch("allowedDocs")!.split(',').filter(x=>x) : [];
                                        parts.forEach(p => {
                                            const cleaned = p.replace(/\D/g, '');
                                            if (cleaned && !currentDocs.includes(cleaned)) {
                                                currentDocs.push(cleaned);
                                            }
                                        });
                                        setValue("allowedDocs", currentDocs.join(','));
                                        setDocInput("");
                                    }
                                }}
                                placeholder="Digite ou cole uma lista separada por vírgula..."
                                className="flex-1 bg-[var(--background)] border-2 border-[var(--border)] rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-emerald-500 transition-all"
                            />
                            <button 
                                type="button"
                                onClick={() => {
                                    if (docInput.trim()) {
                                        const currentDocs = watch("allowedDocs") ? watch("allowedDocs")!.split(',').filter(x=>x) : [];
                                        currentDocs.push(docInput.trim().replace(/\D/g, ''));
                                        setValue("allowedDocs", currentDocs.join(','));
                                        setDocInput("");
                                    }
                                }}
                                className="bg-emerald-500 text-white rounded-xl px-4 flex items-center justify-center hover:bg-emerald-600 transition-all"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="max-h-32 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 mt-2 pr-2">
                            {watch("allowedDocs")?.split(',').filter(x=>x).map((doc: string, idx: number) => (
                                <div key={idx} className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                                    {doc}
                                    <button type="button" onClick={() => {
                                        const currentDocs = watch("allowedDocs")!.split(',').filter(x=>x);
                                        currentDocs.splice(idx, 1);
                                        setValue("allowedDocs", currentDocs.join(','));
                                    }}>
                                        <X size={14} className="hover:text-rose-500" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase px-2">Deixe vazio para uso público. Dica: Pressione Enter ou Cole uma lista (Ctrl+V).</p>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-3 pt-4">
                        <label className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-2">Produtos Elegíveis (Opcional)</label>
                        
                        <div className="relative mb-2">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={14} />
                             <input 
                                 type="text" 
                                 placeholder="Buscar produto..."
                                 value={productSearch}
                                 onChange={e => setProductSearch(e.target.value)}
                                 className="w-full bg-[var(--background)] border-2 border-[var(--border)] rounded-xl py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-emerald-500 transition-all"
                             />
                        </div>

                        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {products.length === 0 && <p className="text-xs text-[var(--muted)] px-2">Nenhum produto encontrado.</p>}
                            {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => {
                                const currentProducts = watch("applicableProducts") ? watch("applicableProducts")!.split(',').map(x=>x.trim()) : [];
                                const isSelected = currentProducts.includes(p.id.toString());
                                return (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => {
                                            let newArr = [...currentProducts];
                                            if (isSelected) {
                                                newArr = newArr.filter(x => x !== p.id.toString());
                                            } else {
                                                newArr.push(p.id.toString());
                                            }
                                            setValue("applicableProducts", newArr.join(','));
                                        }}
                                        className={`px-4 py-3 rounded-xl text-xs font-bold border-2 transition-all text-left flex items-center justify-between ${
                                            isSelected 
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 shadow-sm' 
                                            : 'bg-[var(--background)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)]'
                                        }`}
                                    >
                                        <span className="truncate pr-4">{p.name}</span>
                                        {isSelected && <Check size={16} className="shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-[9px] font-bold text-[var(--muted)] uppercase px-2 mt-2">Se não marcar nenhum, vale para todos.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-end gap-4 pt-6 border-t border-[var(--border)]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-3 rounded-xl font-black text-[10px] text-[var(--muted)] uppercase tracking-widest hover:bg-[var(--background)] transition-all"
                    >
                        CANCELAR
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-emerald-500 text-white px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all border-b-4 border-emerald-700 disabled:opacity-50"
                    >
                        {isSubmitting ? "SALVANDO..." : "ATIVAR CUPOM"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
