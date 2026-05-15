"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

const productSchema = z.object({
    name: z.string().min(3, "Nome do produto deve ter pelo menos 3 caracteres"),
    price: z.coerce.number().min(0.01, "Informe o preço"),
    commission: z.coerce.number().optional(),
    commission_bronze: z.coerce.number().min(0, "Informe a comissão Bronze"),
    commission_prata: z.coerce.number().min(0, "Informe a comissão Prata"),
    commission_ouro: z.coerce.number().min(0, "Informe a comissão Ouro"),
    category: z.string().min(2, "Informe a categoria"),
    type: z.string().min(2, "Informe o tipo (ex: A1, A3)"),
    media_type: z.enum(["Nuvem", "Token", "Cartão", "Arquivo"]),
    supplier_product_id: z.preprocess(
        (val) => (val === "" ? null : val),
        z.coerce.number().nullable().optional()
    ),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    supplierProducts?: any[];
    title: string;
}

export default function ProductModal({ isOpen, onClose, onSubmit, initialData, supplierProducts, title }: ProductModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema) as any,
    });

    // Debugging: Log errors if any
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log("ProductModal Validation Errors:", errors);
        }
    }, [errors]);

    const onFormSubmit = (data: ProductFormData) => {
        console.log("Submitting Product Data:", data);
        onSubmit(data);
    };

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                media_type: initialData.media_type || "Nuvem",
                supplier_product_id: initialData.supplier_product_id || null
            });
        } else {
            reset({
                name: "",
                price: 1,
                commission_bronze: 0,
                commission_prata: 0,
                commission_ouro: 0,
                category: "CPF",
                type: "A1",
                media_type: "Nuvem",
                supplier_product_id: null
            });
        }
    }, [initialData, reset, isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8 py-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Nome Comercial do Produto</label>
                    <Input
                        {...register("name")}
                        error={errors.name?.message}
                        placeholder="EX: E-CPF A3 (3 ANOS)"
                        className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase placeholder:opacity-30"
                    />
                    <p className="text-[10px] text-slate-400 font-bold px-1 mt-1 italic uppercase tracking-tighter opacity-60">Nomes claros aumentam a conversão no checkout.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Preço de Venda (R$)</label>
                        <Input
                            type="number"
                            step="0.01"
                            {...register("price")}
                            error={errors.price?.message}
                            placeholder="0,00"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black text-blue-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Vínculo de Custo (Fornecedor)</label>
                        <select
                            {...register("supplier_product_id")}
                            className="w-full h-12 px-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black uppercase focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer tracking-wider"
                        >
                            <option value="">Custo Zero (Manual)</option>
                            {(supplierProducts || []).map((sp: any) => (
                                <option key={sp.id} value={sp.id}>{sp.name} (R$ {sp.base_cost.toLocaleString('pt-BR')})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="p-8 bg-primary/[0.03] rounded-[2.5rem] border-2 border-primary/10 space-y-6">
                    <div className="flex items-center gap-3 border-b border-primary/10 pb-4">
                        <div className="size-6 rounded-md bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <TrendingUp size={14} strokeWidth={3} />
                        </div>
                        <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">Engenharia de Comissões (Custo por Nível)</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center block">🥉 BRONZE</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("commission_bronze")}
                                error={errors.commission_bronze?.message}
                                className="bg-[var(--background)] rounded-xl border-[var(--border)] font-black text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center block">🥈 PRATA</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("commission_prata")}
                                error={errors.commission_prata?.message}
                                className="bg-[var(--background)] rounded-xl border-[var(--border)] font-black text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 text-center block">🥇 OURO</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("commission_ouro")}
                                error={errors.commission_ouro?.message}
                                className="bg-[var(--background)] rounded-xl border-[var(--border)] font-black text-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Categoria Principal</label>
                        <Input
                            {...register("category")}
                            error={errors.category?.message}
                            placeholder="EX: CPF, CNPJ"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Modelo Tecnológico</label>
                        <Input
                            {...register("type")}
                            error={errors.type?.message}
                            placeholder="EX: A1, A3, NUVEM"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase"
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Tipo de Mídia Padrão</label>
                    <SegmentedControl
                        value={watch("media_type") || "Nuvem"}
                        onChange={(v) => setValue("media_type", v as any)}
                        options={[
                            { label: "NUVEM (A1)", value: "Nuvem" },
                            { label: "TOKEN (A3)", value: "Token" },
                            { label: "CARTÃO (A3)", value: "Cartão" },
                            { label: "ARQUIVO", value: "Arquivo" },
                        ]}
                    />
                </div>

                <div className="flex flex-col md:flex-row gap-4 pt-8 border-t-4 border-[var(--border)]">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-primary text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-primary/30 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-4 border border-white/10"
                    >
                        {isSubmitting ? (
                            <div className="size-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 size={20} strokeWidth={3} /> {initialData ? "Salvar Alterações" : "Criar Produto"}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-10 py-5 bg-[var(--background)] text-[var(--muted)] border-2 border-[var(--border)] rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:text-[var(--foreground)] transition-all"
                    >
                        Descartar
                    </button>
                </div>
            </form>
        </Modal>
    );
}
