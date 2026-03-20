"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useSimulation } from "@/components/SimulationProvider";
import ThemeToggle from "./ThemeToggle";

import {
    LayoutDashboard,
    FileText,
    Store,
    Megaphone,
    Users,
    DollarSign,
    BarChart,
    Settings as SettingsIcon,
    ShieldCheck,
    X,
    LogOut,
    ChevronRight,
    Search,
    Building2
} from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: any;
}

const navItems: (NavItem & { permissionKey: string })[] = [
    { label: "Painel", href: "/", icon: LayoutDashboard, permissionKey: "access_dashboard" },
    { label: "Certificados", href: "/certificados", icon: FileText, permissionKey: "access_certificates" },
    { label: "Links de Venda", href: "/loja", icon: Store, permissionKey: "access_store" },
    { label: "Campanhas / Cupons", href: "/campanhas", icon: Megaphone, permissionKey: "access_marketing" },
    { label: "Clientes", href: "/clientes", icon: Users, permissionKey: "access_customers" },
    { label: "Financeiro", href: "/financeiro", icon: DollarSign, permissionKey: "access_financial" },
    { label: "Relatórios", href: "/relatorios", icon: BarChart, permissionKey: "access_reports" },
    { label: "Configurações", href: "/configuracoes", icon: SettingsIcon, permissionKey: "access_settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser, logout, hasPermission } = useSimulation();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = async () => {
        if (confirm("Deseja realmente sair?")) {
            await logout();
        }
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden transition-all duration-500"
                    onClick={toggleSidebar}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 bg-[var(--card)] text-[var(--foreground)] flex flex-col h-screen transition-all duration-500 border-r border-[var(--border)] z-[70] w-58 lg:relative lg:translate-x-0 lg:z-0 shadow-xl dark:shadow-none",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="p-3.5 flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-white/20">
                            <ShieldCheck size={14} strokeWidth={2.5} />
                        </div>
                        {/*nome da logo*/}
                        <div className="leading-none">
                            <h1 className="text-sm font-bold tracking-tighter text-[var(--foreground)] uppercase leading-none">Delta360</h1>
                            <p className="text-[10px] text-[var(--muted)] font-bold uppercase tracking-[0.3em] mt-0.5 opacity-60">Certificado ICP</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar pt-1.5">
                    {navItems.filter(item => hasPermission(item.permissionKey)).map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-500 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary text-white shadow-md scale-[1.02] border border-white/10"
                                        : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] border border-transparent hover:border-[var(--border)]"
                                )}
                            >
                                <Icon size={14} strokeWidth={isActive ? 3 : 2} className={cn(
                                    "transition-all duration-500",
                                    isActive ? "text-white scale-110" : "text-[var(--muted)] group-hover:text-primary group-hover:scale-110"
                                )} />
                                {/*titulos menu principal*/}
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-widest transition-all duration-500",
                                    isActive ? "opacity-100 translate-x-1" : "opacity-70 group-hover:opacity-100 group-hover:translate-x-1"
                                )}>{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-2 size-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
                                )}
                            </Link>
                        );
                    })}
                    {/*seção administradores*/}
                    <div className="mt-1.5 pt-1.5 border-t border-[var(--border)] px-0.5">
                        <p className="px-3 mb-1 text-xs font-bold text-primary uppercase tracking-[0.2em] opacity-80">ADMINISTRAÇÃO</p>
                        <div className="space-y-1">
                            {[
                                { label: "Usuários", href: "/admin?tab=usuarios", icon: Users, permissionKey: "admin_users" },
                                { label: "Produtos", href: "/admin?tab=produtos", icon: FileText, permissionKey: "admin_products" },
                                { label: "Vendas", href: "/admin?tab=vendas", icon: BarChart, permissionKey: "admin_sales" },
                                { label: "Financeiro", href: "/admin?tab=financeiro", icon: DollarSign, permissionKey: "admin_financials" },
                                { label: "Metas/Gamif", href: "/admin?tab=metas", icon: ShieldCheck, permissionKey: "admin_gamification" },
                                { label: "Fornecedores", href: "/admin?tab=fornecedores", icon: Building2, permissionKey: "admin_suppliers" },
                            ].filter(item => hasPermission(item.permissionKey)).map((item) => {
                                // Robust active check for tabs
                                const tabValue = item.href.split('=')[1];
                                const currentTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;
                                const isActive = pathname === "/admin" && (currentTab === tabValue || (!currentTab && tabValue === 'overview'));

                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-1.5 rounded-lg transition-all duration-500 group relative overflow-hidden",
                                            isActive
                                                ? "bg-slate-900 dark:bg-primary text-white shadow-md scale-[1.02] border border-white/10 z-10"
                                                : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)] border border-transparent hover:border-[var(--border)]"
                                        )}
                                    >
                                        <Icon size={12} strokeWidth={isActive ? 3 : 2} className={cn(
                                            "transition-all duration-500",
                                            isActive ? "text-white scale-110" : "text-[var(--muted)] group-hover:text-primary group-hover:scale-110"
                                        )} />
                                        <span className={cn(
                                            "text-xs font-bold uppercase tracking-widest transition-all duration-500",
                                            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                        )}>{item.label}</span>
                                        {isActive && (
                                            <div className="absolute right-2 size-1 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </nav>

                <div className="p-2.5 mt-auto border-t border-[var(--border)] bg-[var(--background)]/30">
                    <div className="flex items-center gap-2 p-2 bg-[var(--card)] rounded-lg border border-[var(--border)] shadow-md group hover:border-primary/30 transition-all duration-500">
                        <div className="size-6 rounded-md bg-slate-900 dark:bg-primary text-white flex items-center justify-center font-bold overflow-hidden border border-white dark:border-[var(--border)] shadow-sm group-hover:scale-105 transition-transform text-[12px]">
                            {currentUser.avatar ? <img src={currentUser.avatar} className="size-full object-cover" /> : currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden flex-1 leading-none">
                            <p className="text-[var(--foreground)] text-[10px] font-bold truncate mb-0.5 uppercase tracking-tight">{currentUser.name.split(' ')[0]}</p>
                            <p className="text-[8px] text-[var(--muted)] uppercase font-bold tracking-[0.1em] opacity-80">{currentUser.role === 'admin' ? 'Especialista' : 'Vendedor'}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1 text-[var(--muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-md transition-all active:scale-90"
                            title="Sair"
                        >
                            <LogOut size={14} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </aside >

            {/* Mobile Toggle Trigger */}
            < button
                onClick={toggleSidebar}
                className={
                    cn(
                        "lg:hidden fixed bottom-6 right-6 z-[80] size-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all",
                        isOpen && "bg-slate-800 rotate-180"
                    )
                }
            >
                {isOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
            </button >
        </>
    );
}
