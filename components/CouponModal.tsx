"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "./Modal";
import Input from "./ui/Input";
import SegmentedControl from "./ui/SegmentedControl";
import SearchSelect from "./ui/SearchSelect";
import { useEffect } from "react";
import { Ticket } from "lucide-react";

const couponSchema = z.object({
    code: z.string().min(3, "Código deve ter pelo menos 3 caracteres").toUpperCase(),
    discountType: z.enum(["percent", "fixed"]),
    discountValue: z.string().min(1, "Informe o valor"),
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
            reset({
                code: initialData.code || "",
                discountType: initialData.discount_type || "percent",
                discountValue: String(initialData.discount_value) || "",
            });
        } else {
            reset({ code: "", discountType: "percent", discountValue: "" });
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
