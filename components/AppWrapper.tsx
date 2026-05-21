"use client";

import { useSimulation } from "@/components/SimulationProvider";
import AuthPage from "@/app/auth/page";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Loader2, ShieldAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { supabase } from "@/lib/supabase";
import OrderJourneyModal from "./OrderJourneyModal";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, loading, currentUser, hasPermission } = useSimulation();
    const pathname = usePathname();
    const [isJourneyOpen, setIsJourneyOpen] = useState(false);
    const isPublicSalesRoute =
        pathname === '/' ||
        pathname.startsWith('/loja/') ||
        pathname.startsWith('/l/') ||
        pathname === '/checkout' ||
        pathname.startsWith('/checkout/');

    // Force light mode on public routes regardless of saved preference
    useEffect(() => {
        if (isPublicSalesRoute) {
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = "#F8F9FA";
        }
    }, [isPublicSalesRoute, pathname]);

    // Permission Guard Logic
    const routePermissions: Record<string, string> = {
        '/dashboard': 'access_dashboard',
        '/certificados': 'access_certificates',
        '/loja': 'access_store',
        '/campanhas': 'access_marketing',
        '/clientes': 'access_customers',
        '/financeiro': 'access_financial',
        '/relatorios': 'access_reports',
        '/configuracoes': 'access_settings',
    };

    const requiredPermission = routePermissions[pathname];
    const isRestricted = requiredPermission && !hasPermission(requiredPermission);

    // Global Products Fetch with diagnostics
    const { data: products, error: productsError, isLoading: productsLoading } = useSWR(isAuthenticated ? 'global_products_fetch' : null, async () => {
        console.log("AppWrapper: --- INICIANDO DIAGNÓSTICO DE CONEXÃO ---");
        console.log("AppWrapper: URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log("AppWrapper: Key (inicio):", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 15) + "...");

        // Teste 1: Busca simples
        const test1 = await supabase.from('products').select('id, name');
        console.log("AppWrapper: Teste 1 (products):", test1.data?.length || 0, "itens", test1.error ? "ERRO: " + test1.error.message : "OK");

        // Teste 2: Busca com schema explícito
        const test2 = await supabase.from('products').select('*');
        console.log("AppWrapper: Teste 2 (full select):", test2.data);

        // Teste 3: Verificar outra tabela para descartar erro de conexão geral
        const test3 = await supabase.from('profiles').select('id').limit(1);
        console.log("AppWrapper: Teste 3 (profiles access):", test3.error ? "FALHA" : "SUCESSO", test3.error?.message || "");

        if (test2.error) throw test2.error;
        return test2.data || [];
    }, {
        revalidateOnFocus: false,
        shouldRetryOnError: false
    });

    const isAdminRoute = pathname.startsWith('/admin');
    const isUserAdmin = currentUser?.role === 'admin';

    if (isPublicSalesRoute) {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[var(--muted)] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">Sincronizando Delta...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AuthPage />;
    }

    if (isAdminRoute && !isUserAdmin) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-6 text-center">
                <div className="size-20 rounded-none bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 border border-rose-500/20">
                    <ShieldAlert size={40} />
                </div>
                <h1 className="text-2xl font-black text-[var(--foreground)] mb-2">Acesso Restrito</h1>
                <p className="text-[var(--muted)] max-w-xs text-sm font-medium">Você não tem permissão para acessar a área administrativa. Entre em contato com o suporte se isso for um erro.</p>
                <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="mt-8 px-8 py-3 bg-primary text-on-primary font-black rounded-none hover:bg-primary/90 transition-all shadow-lg"
                >
                    Voltar para o Início
                </button>
            </div>
        );
    }

    return (
        <div className="flex h-[100dvh] bg-[var(--background)] font-sans overflow-hidden transition-colors duration-500">
            <Sidebar />
            <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
                {/* Main scrollable area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-[var(--background)]">
                    <Header onOpenJourney={() => setIsJourneyOpen(true)} />
                    
                    <div className="p-2 md:p-3 lg:p-4">
                        <div className="max-w-[1920px] mx-auto">
                            {isRestricted ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 text-slate-400">
                                        <ShieldAlert size={32} />
                                    </div>
                                    <h2 className="text-xl font-black mb-2">Módulo Restrito</h2>
                                    <p className="text-sm text-slate-500 max-w-sm mb-8">
                                        Este módulo ainda não foi liberado para o seu perfil ou está em desenvolvimento.
                                    </p>
                                    <button
                                        onClick={() => window.location.href = '/loja'}
                                        className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs"
                                    >
                                        Ir para Loja / Certificados
                                    </button>
                                </div>
                            ) : (
                                children
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <OrderJourneyModal
                isOpen={isJourneyOpen}
                onClose={() => setIsJourneyOpen(false)}
                onSubmit={() => { }} // Handle globally if needed, for now just for creation
                products={products || []}
                error={productsError}
                isLoading={productsLoading}
            />
        </div>
    );
}
