"use client";

import { useSimulation } from "./SimulationProvider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className }: { className?: string }) {
    const { currentUser, updateThemePreference } = useSimulation();
    const theme = currentUser.preferences?.darkMode ? "dark" : "light";
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const handleToggle = () => {
        updateThemePreference(!currentUser.preferences?.darkMode);
    };

    return (
        <button
            onClick={handleToggle}
            className={cn(
                "relative flex items-center gap-2 p-2 rounded-2xl transition-all duration-300",
                "bg-surface-variant/20 dark:bg-white/5 hover:bg-surface-variant/40 dark:hover:bg-white/10",
                "border border-outline dark:border-white/5 shadow-sm active:scale-95",
                className
            )}
            title={theme === "dark" ? "Alternar para modo claro" : "Alternar para modo escuro"}
        >
            <div className="relative size-6 flex items-center justify-center">
                <Sun
                    className={cn(
                        "absolute size-5 transition-all duration-500",
                        theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-amber-500"
                    )}
                />
                <Moon
                    className={cn(
                        "absolute size-5 transition-all duration-500",
                        theme === "dark" ? "rotate-0 scale-100 opacity-100 text-indigo-400" : "-rotate-90 scale-0 opacity-0"
                    )}
                />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--muted)] px-1">
                {theme === "dark" ? "Modo Escuro" : "Modo Claro"}
            </span>
        </button>
    );
}
