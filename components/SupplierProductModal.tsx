"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import { useEffect } from "react";

const schema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
    external_id: z.string().optional(),
    base_cost: z.coerce.number().min(0, "Valor inválido"),
    table_id: z.coerce.number().min(1, "Selecione uma tabela"),
});

type FormData = z.infer<typeof schema>;

interface SupplierProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    tables: any[];
    title: string;
}

export default function SupplierProductModal({ isOpen, onClose, onSubmit, initialData, tables, title }: SupplierProductModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<FormData>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            name: "",
            external_id: "",
            base_cost: 0,
            table_id: 0
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: "",
                external_id: "",
                base_cost: 0,
                table_id: 0
            });
        }
    }, [initialData, reset, isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Identificação no Fornecedor (Nome Original)</label>
                        <Input
                            {...register("name")}
                            error={errors.name?.message}
                            placeholder="EX: CERTIFICADO A1 CPF"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase placeholder:opacity-30"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Código de Integração / SKU Fornecedor</label>
                        <Input
                            {...register("external_id")}
                            error={errors.external_id?.message}
                            placeholder="EX: 504"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold uppercase placeholder:opacity-30"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Custo Base Líquido (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("base_cost")}
                                error={errors.base_cost?.message}
                                placeholder="0,00"
                                className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black text-blue-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Grupo de Taxas / Tabela</label>
                            <select
                                {...register("table_id")}
                                className="w-full h-12 px-5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-sm font-black uppercase focus:ring-4 focus:ring-primary/10 appearance-none cursor-pointer tracking-wider"
                            >
                                <option value={0}>SELECIONE A TABELA...</option>
                                {tables.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                                ))}
                            </select>
                            {errors.table_id && <p className="text-[10px] text-rose-500 font-black px-1 mt-1 uppercase">{errors.table_id.message}</p>}
                        </div>
                    </div>
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
                            "Salvar Produto"
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
