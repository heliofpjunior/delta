"use client";

import { useSimulation } from "./SimulationProvider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }: { className?: string }) {
    const { currentUser, updateThemePreference } = useSimulation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Placeholder com mesmo tamanho para evitar layout shift durante hidratação
    if (!mounted) {
        return <div className={cn("size-8 rounded-lg shrink-0", className)} />;
    }

    const isDark = currentUser.preferences?.darkMode ?? true;

    return (
        <button
            onClick={() => updateThemePreference(!isDark)}
            title={isDark ? "Alternar para modo claro" : "Alternar para modo escuro"}
            className={cn(
                "size-8 shrink-0 flex items-center justify-center rounded-lg border",
                "bg-[var(--background)] border-[var(--border)]",
                "hover:bg-[var(--card)] hover:border-primary/30",
                "text-[var(--muted)] hover:text-[var(--foreground)]",
                "transition-colors active:scale-95",
                className
            )}
        >
            {isDark
                ? <Sun size={16} strokeWidth={2} className="text-amber-500" />
                : <Moon size={16} strokeWidth={2} className="text-indigo-400" />
            }
        </button>
    );
}
