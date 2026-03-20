"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchSelectProps {
    label: string;
    options: { label: string; value: string | number }[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    helpText?: string;
    error?: string;
}

export default function SearchSelect({ label, options, value, onChange, placeholder = "Selecione...", helpText, error }: SearchSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="space-y-2 relative group" ref={containerRef}>
            <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest px-1">
                {label}
            </label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full px-5 py-3.5 bg-surface-variant/20 dark:bg-slate-800 border-2 border-transparent rounded-2xl text-[13px] flex items-center justify-between transition-all duration-300",
                    "group-hover:bg-surface-variant/40 dark:group-hover:bg-slate-700/50 text-left",
                    isOpen && "bg-surface dark:bg-slate-900 border-primary shadow-m3-1",
                    error && "border-error"
                )}
            >
                <span className={cn(selectedOption ? "text-on-surface dark:text-white font-black" : "text-on-surface-variant/40 font-bold")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={cn("text-on-surface-variant/60 transition-transform duration-300", isOpen && "rotate-180 text-primary")} />
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full z-50 bg-surface dark:bg-slate-800 border border-outline/10 rounded-[2rem] shadow-m3-3 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-outline/5">
                        <div className="relative group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within/search:text-primary transition-colors" size={16} />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-12 pr-4 py-3 bg-surface-variant/20 dark:bg-slate-900/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-primary transition-all"
                                placeholder="Filtrar opções..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
                        {filteredOptions.length > 0 ? (
                            <div className="space-y-1">
                                {filteredOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "w-full px-4 py-3 text-left text-[11px] rounded-[1.25rem] flex items-center justify-between transition-all group/item",
                                            opt.value === value
                                                ? "bg-primary-container text-on-primary-container font-black"
                                                : "text-on-surface-variant font-bold hover:bg-surface-variant/30 hover:text-on-surface"
                                        )}
                                    >
                                        {opt.label}
                                        {opt.value === value && <Check size={14} className="text-primary" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Search size={24} className="mx-auto text-on-surface-variant/20 mb-2" />
                                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest">Nenhum resultado encontrado</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {error ? (
                <p className="text-[10px] font-black text-error px-1 uppercase tracking-tight">
                    {error}
                </p>
            ) : helpText && (
                <p className="text-[11px] font-medium text-on-surface-variant/60 px-1 italic">
                    {helpText}
                </p>
            )}
        </div>
    );
}
