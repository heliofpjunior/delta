"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
    id: string;
    name: string;
    company: string;
    role: "admin" | "seller" | "moderador" | "financeiro";
    email: string;
    sales_total: number;
    level: "Bronze" | "Prata" | "Ouro";
    xp: number;
    wallet: number;
    equippedBadge?: string;
    salesCount60Days: number;
    avatar?: string;
    doc?: string;
    phone?: string;
    company_name?: string;
    state_registration?: string;
    pix_key?: string;
    address_zip?: string;
    address_street?: string;
    address_number?: string;
    address_complement?: string;
    address_neighborhood?: string;
    address_city?: string;
    address_state?: string;
    balance_available?: number;
    balance_processing?: number;
    custom_prices?: Record<number, number>;
    permissions?: Record<string, boolean>;
    preferences?: {
        darkMode: boolean;
    };
}

interface SimulationContextType {
    currentUser: UserProfile;
    isAuthenticated: boolean;
    loading: boolean;
    hasPermission: (perm: string) => boolean;
    toggleRole: () => void;
    updateUser: (updates: Partial<UserProfile>) => void;
    logout: () => Promise<void>;
    updateThemePreference: (isDark: boolean) => Promise<void>;
}

const defaultUser: UserProfile = {
    id: "vend_001",
    name: "Maria Silva",
    email: "maria.silva@delta360.com.br",
    company: "Contabilidade Central",
    role: "seller",
    sales_total: 8450.00,
    level: "Prata",
    xp: 1250,
    wallet: 450.00,
    equippedBadge: "Start",
    balance_available: 87.41,
    balance_processing: 0,
    permissions: {
        access_dashboard: false,
        access_certificates: true,
        access_store: true,
        access_marketing: false,
        access_customers: true,
        access_financial: true,
        access_reports: false,
        access_settings: true,
        admin_overview: true,
        admin_users: true,
        admin_invites: true,
        admin_products: true,
        admin_sales: true,
        admin_financials: true,
        admin_gamification: true,
        admin_suppliers: true
    },
    salesCount60Days: 24,
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAA65jbQbRFT_PDlvYMVTP3jdi6Y0M5XKach0uVKCc-u2nNiGY4dXathU9JL2D1fYBSRDJi1KuMjH_m4OZJTcO-vfJ3w0gVvuveIyKE23dzwugAuCd7laQ0bZE2IrG5aFxSPVmApOaPv2qJGIw4iLTESk8t2EBUYQJBTjzFFqpxVPxizXpfvDG_E8MSjXrNJCg4v3hJiYh3thS6oAAbbg3lP9pJL9tg8WUQXGUnMB8Z9CS_Dx6TE6QSzjjnWEoYy5CQSiCjDAc63_M",
    preferences: { darkMode: true }
};

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
    const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored) {
                return { ...defaultUser, preferences: { darkMode: stored === 'dark' } };
            }
        }
        return defaultUser;
    });
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const updateUser = (updates: Partial<UserProfile>) => {
        setCurrentUser(prev => ({ ...prev, ...updates }));
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        window.location.reload();
    };

    const toggleRole = () => {
        setCurrentUser(prev => {
            if (prev.role === "seller") {
                return {
                    id: "admin_master",
                    name: "Helio (Admin)",
                    email: "helio@delta360.com.br",
                    company: "Delta360 Certificadora ICP",
                    role: "admin",
                    sales_total: 25480.00,
                    level: "Ouro",
                    xp: 5000,
                    wallet: 1500.00,
                    salesCount60Days: 120,
                    avatar: undefined,
                    preferences: { darkMode: true }
                };
            } else {
                return defaultUser;
            }
        });
    };

    // Load actual profile if connected to Supabase
    useEffect(() => {
        const loadProfile = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session) {
                    setIsAuthenticated(true);
                    let { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();

                    // If profile doesn't exist, create it automatically (JIT)
                    if (!profile || error) {
                        console.log("Sincronizando perfil com Supabase...");
                        const { data: newProfile, error: createError } = await supabase
                            .from('profiles')
                            .upsert([
                                {
                                    id: session.user.id,
                                    full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Novo Vendedor',
                                    email: session.user.email,
                                    role: 'seller',
                                    level: 'Bronze',
                                    xp: 0,
                                    wallet: 0,
                                    status: 'Ativo'
                                }
                            ])
                            .select()
                            .single();

                        if (createError) {
                            console.error("Erro JIT Supabase:", createError.message || createError, {
                                code: createError.code,
                                details: createError.details,
                                hint: createError.hint
                            });
                        } else {
                            profile = newProfile;
                        }
                    }

                    if (profile) {
                        setCurrentUser(prevUser => ({
                            id: profile.id,
                            name: profile.full_name,
                            email: profile.email,
                            company: profile.company_name || "Delta360 Platform",
                            role: profile.role || 'seller',
                            level: profile.level || 'Bronze',
                            xp: profile.xp || 0,
                            wallet: Number(profile.wallet) || 0,
                            sales_total: Number(profile.wallet) * 10,
                            salesCount60Days: 0,
                            avatar: profile.avatar_url,
                            doc: profile.doc,
                            phone: profile.phone,
                            company_name: profile.company_name,
                            state_registration: profile.state_registration,
                            pix_key: profile.pix_key,
                            address_zip: profile.address_zip,
                            address_street: profile.address_street,
                            address_number: profile.address_number,
                            address_complement: profile.address_complement,
                            address_neighborhood: profile.address_neighborhood,
                            address_city: profile.address_city,
                            address_state: profile.address_state,
                            balance_available: Number(profile.balance_available) || 0,
                            balance_processing: Number(profile.balance_processing) || 0,
                            custom_prices: profile.custom_prices || {},
                            permissions: profile.permissions || {},
                            preferences: {
                                darkMode: profile.preferences?.darkMode ?? prevUser.preferences?.darkMode ?? true
                            }
                        }));
                    }
                }
                else {
                    setIsAuthenticated(false);
                }
            } catch (err) {
                console.warn("Supabase profile load failed. Using simulated user.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session);
            if (!session) {
                setLoading(false);
            } else {
                loadProfile();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (currentUser.preferences?.darkMode !== undefined) {
            document.documentElement.classList.toggle("dark", currentUser.preferences.darkMode);
            localStorage.setItem("theme", currentUser.preferences.darkMode ? "dark" : "light");

            // Apply theme to body background to avoid white flashes
            document.body.style.backgroundColor = currentUser.preferences.darkMode ? "#131314" : "#F8F9FA";
        }
    }, [currentUser.preferences?.darkMode]);

    const updateThemePreference = async (isDark: boolean) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                await supabase
                    .from('profiles')
                    .update({
                        preferences: { ...currentUser.preferences, darkMode: isDark }
                    })
                    .eq('id', session.user.id);
            }
            updateUser({
                preferences: { ...currentUser.preferences, darkMode: isDark }
            });
        } catch (err) {
            console.error("Erro ao salvar preferência de tema:", err);
        }
    };

    const hasPermission = (perm: string) => {
        if (currentUser.role === 'admin') return true;
        return !!currentUser.permissions?.[perm];
    };

    return (
        <SimulationContext.Provider value={{ currentUser, toggleRole, updateUser, isAuthenticated, loading, logout, hasPermission, updateThemePreference }}>
            {children}
        </SimulationContext.Provider>
    );
}

export function useSimulation() {
    const context = useContext(SimulationContext);
    if (context === undefined) {
        throw new Error("useSimulation must be used within a SimulationProvider");
    }
    return context;
}
