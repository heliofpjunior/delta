"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Modal({ isOpen, onClose, title, children, width = "md" }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthClasses = {
        sm: "max-w-md",
        md: "max-w-xl",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        "2xl": "max-w-7xl",
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center md:items-center md:p-6 overflow-y-auto pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto"
                onClick={onClose}
            />

            {/* Modal Content - Square & Fullscreen mobile */}
            <div
                ref={modalRef}
                className={cn(
                    "relative w-full h-full md:h-auto md:max-h-[85vh] bg-[var(--card)] rounded-none md:rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 border-0 md:border border-[var(--border)] pointer-events-auto flex flex-col transition-all my-auto",
                    widthClasses[width]
                )}
            >
                {/* Header - Compact */}
                <div className="px-5 py-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--background)]">
                    <div>
                        <h2 className="text-lg font-bold text-[var(--foreground)] tracking-tight leading-none uppercase">{title}</h2>
                        <p className="text-[7px] text-[var(--muted)] font-bold uppercase tracking-widest mt-1 opacity-40">Delta360 Integrated Operations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-7 bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--muted)] rounded transition-all flex items-center justify-center active:scale-95 border border-[var(--border)]"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body - Compact */}
                <div className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar bg-[var(--card)]">
                    {children}
                </div>
            </div>
        </div>
    );
}
