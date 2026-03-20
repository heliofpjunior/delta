"use client";

import { cn } from "@/lib/utils";

interface SegmentedControlProps {
    options: (string | { label: string; value: string })[];
    value: string;
    onChange: (value: string) => void;
    label?: string;
    className?: string;
    fullWidth?: boolean;
}

export default function SegmentedControl({ options, value, onChange, label, className, fullWidth = true }: SegmentedControlProps) {
    return (
        <div className={cn("space-y-2", fullWidth ? "w-full" : "w-fit", className)}>
            {label && (
                <label className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest px-1">
                    {label}
                </label>
            )}
            <div className="flex p-0.5 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 self-start shadow-sm">
                {options.map((option) => {
                    const label = typeof option === 'string' ? option : option.label;
                    const val = typeof option === 'string' ? option : option.value;
                    const isActive = value === val;
                    return (
                        <button
                            key={val}
                            type="button"
                            onClick={() => onChange(val)}
                            className={cn(
                                "px-5 py-2 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all duration-300 relative",
                                isActive
                                    ? "bg-primary text-white shadow-sm scale-100 font-black"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 px-4"
                            )}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
