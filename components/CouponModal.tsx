"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import SearchSelect from "./ui/SearchSelect";
import { useEffect } from "react";

const couponSchema = z.object({
    code: z.string().min(3, "Código deve ter pelo menos 3 caracteres").toUpperCase(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.string().min(1, "Informe o valor"),
    influencer: z.string().min(1, "Informe o influenciador"),
    products: z.string().optional(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface CouponModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CouponFormData) => void;
    initialData?: any;
    title: string;
}

export default function CouponModal({ isOpen, onClose, onSubmit, initialData, title }: CouponModalProps) {
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
            // Transform legacy data if needed
            reset({
                code: initialData.code || "",
                discountType: initialData.discount?.includes("%") ? "percent" : "fixed",
                discountValue: initialData.discount?.replace(/[^0-9]/g, "") || "",
                influencer: initialData.influencer || "Geral",
                products: initialData.products || "Todos",
            });
        } else {
            reset({ code: "", discountType: "percent", discountValue: "", influencer: "Geral", products: "Todos" });
        }
    }, [initialData, reset, isOpen]);

    const discountType = watch("discountType");

    const onSubmitProxy = (data: any) => {
        const formattedData = {
            ...data,
            discount: data.discountType === "percent" ? `${data.discountValue}%` : `R$ ${data.discountValue}`,
        };
        onSubmit(formattedData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit(onSubmitProxy)} className="space-y-6">
                <Input
                    label="Código do Cupom"
                    {...register("code")}
                    error={errors.code?.message}
                    placeholder="Ex: VERAO2026"
                    helpText="Crie nomes curtos e memoráveis para facilitar o uso."
                />

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-3">
                        <SegmentedControl
                            label="Tipo de Desconto"
                            value={discountType}
                            onChange={(val) => setValue("discountType", val as any)}
                            options={[
                                { label: "Porcentagem (%)", value: "percent" },
                                { label: "Valor Fixo (R$)", value: "fixed" },
                            ]}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Input
                            label={discountType === "percent" ? "Porcentagem" : "Valor R$"}
                            {...register("discountValue")}
                            error={errors.discountValue?.message}
                            placeholder={discountType === "percent" ? "15" : "50,00"}
                            helpText={discountType === "fixed" ? "Gera fechamentos mais rápidos." : "Ideal para combos."}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SearchSelect
                        label="Influenciador / Origem"
                        value={watch("influencer")}
                        onChange={(val) => setValue("influencer", val as string)}
                        options={[
                            { label: "Geral (Auto)", value: "Geral" },
                            { label: "Parceiro VIP", value: "Parceiro VIP" },
                            { label: "@vlog_contabil", value: "Maria Silva" },
                            { label: "Campanha Fevereiro", value: "Fevereiro" },
                        ]}
                    />
                    <SearchSelect
                        label="Limitar a Produtos"
                        value={watch("products") || "Todos"}
                        onChange={(val) => setValue("products", val as string)}
                        options={[
                            { label: "Todos os Produtos", value: "Todos" },
                            { label: "Apenas e-CPF", value: "Apenas CPF" },
                            { label: "Apenas e-CNPJ", value: "Apenas CNPJ" },
                            { label: "Certificados A3", value: "Apenas A3" },
                        ]}
                    />
                </div>

                <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-lg font-bold text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 max-w-full md:max-w-[60%] bg-primary text-on-primary px-8 py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Salvando..." : "Ativar Campanha"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
