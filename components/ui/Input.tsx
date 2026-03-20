"use client";

import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helpText, className, ...props }, ref) => {
        return (
            <div className="space-y-2 flex flex-col group w-full">
                {label && (
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--foreground)] opacity-70 px-1 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        className={cn(
                            "w-full px-5 py-3.5 bg-[var(--background)] border-2 border-[var(--border)] rounded-2xl text-[14px] font-bold transition-all duration-300",
                            "placeholder:text-[var(--muted)]/30 focus:outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 shadow-sm",
                            "hover:border-[var(--muted)]/50",
                            error && "border-rose-500 focus:border-rose-500 focus:ring-rose-500/10",
                            className
                        )}
                        {...props}
                    />
                </div>
                {error ? (
                    <p className="text-[10px] font-black text-rose-600 px-2 uppercase tracking-tight animate-in slide-in-from-top-1 duration-300">
                        {error}
                    </p>
                ) : helpText && (
                    <p className="text-[10px] font-bold text-[var(--muted)] px-2 leading-tight italic opacity-60 uppercase tracking-tighter">
                        {helpText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
