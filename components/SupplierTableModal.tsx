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
    tax_fixed: z.coerce.number().min(0, "Valor inválido"),
    tax_percent: z.coerce.number().min(0, "Valor inválido").max(100, "Máximo 100%"),
});

type FormData = z.infer<typeof schema>;

interface SupplierTableModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    title: string;
}

export default function SupplierTableModal({ isOpen, onClose, onSubmit, initialData, title }: SupplierTableModalProps) {
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
            tax_fixed: 0,
            tax_percent: 0
        }
    });

    useEffect(() => {
        if (initialData) {
            reset(initialData);
        } else {
            reset({
                name: "",
                external_id: "",
                tax_fixed: 0,
                tax_percent: 0
            });
        }
    }, [initialData, reset, isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} width="md">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Nome de Identificação da Tabela</label>
                        <Input
                            {...register("name")}
                            error={errors.name?.message}
                            placeholder="EX: TABELA DIRETA BRADESCO"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black uppercase placeholder:opacity-30"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">ID Externo (Opcional)</label>
                        <Input
                            {...register("external_id")}
                            error={errors.external_id?.message}
                            placeholder="EX: TAB_501"
                            className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-bold uppercase placeholder:opacity-30"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6 p-8 bg-slate-500/[0.03] rounded-[2.5rem] border-2 border-slate-500/10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Taxa Fixa (R$)</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("tax_fixed")}
                                error={errors.tax_fixed?.message}
                                placeholder="0,00"
                                className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black text-center"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Imposto (%)</label>
                            <Input
                                type="number"
                                step="0.01"
                                {...register("tax_percent")}
                                error={errors.tax_percent?.message}
                                placeholder="0,00"
                                className="bg-[var(--background)] border-[var(--border)] rounded-2xl font-black text-center"
                            />
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
                            "Salvar Tabela"
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
