"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Shield, Mail, Lock, Loader2, ArrowRight, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function AuthPage() {
    const searchParams = useSearchParams();
    const [mode, setMode] = useState<"login" | "register">("login");

    useEffect(() => {
        if (searchParams.get('mode') === 'register') {
            setMode('register');
        }
    }, [searchParams]);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (mode === "login") {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
                setLoading(false);
            } else {
                window.location.reload();
            }
        } else {
            // Register
            // FIRST: Check if email is whitelisted
            try {
                const { data: checkData } = await axios.post("/api/auth/check-invite", { email });
                if (!checkData.allowed) {
                    setError("Este e-mail não possui convite autorizado. Por favor, entre em contato com o administrador.");
                    setLoading(false);
                    return;
                }
            } catch (err) {
                setError("Erro ao verificar autorização. Tente novamente.");
                setLoading(false);
                return;
            }

            // SECOND: Proceed with signUp
            const { error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                    }
                }
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
            } else {
                setSuccess(true);
                setLoading(false);
            }
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.1)_0,transparent_100%)]">
                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 max-w-md text-center">
                    <div className="size-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-6">
                        <Mail size={40} />
                    </div>
                    <h1 className="text-2xl font-black text-white mb-4">Verifique seu e-mail</h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Enviamos um link de confirmação para <span className="text-white font-bold">{email}</span>. Clique no link para ativar sua conta de vendedor.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 text-primary font-black text-[10px] uppercase tracking-widest hover:underline"
                    >
                        Voltar para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/30 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md relative z-10 transition-all duration-500">
                <div className="bg-slate-900/50 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
                    <div className="flex flex-col items-center mb-8">
                        <div className="size-14 rounded-2xl bg-white text-slate-950 flex items-center justify-center shadow-xl shadow-white/10 mb-6">
                            <Shield size={28} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tight text-white mb-1">Delta Estrategista</h1>
                        <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
                            {mode === 'login' ? 'Acesso ao Painel' : 'Novo Cadastro'}
                        </p>
                    </div>

                    <div className="flex bg-slate-800/50 p-1 rounded-2xl mb-8">
                        <button
                            onClick={() => setMode('login')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === 'login' ? "bg-white text-slate-900" : "text-slate-500"
                            )}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setMode('register')}
                            className={cn(
                                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                mode === 'register' ? "bg-white text-slate-900" : "text-slate-500"
                            )}
                        >
                            Cadastrar
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {mode === 'register' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold p-4 rounded-2xl text-center uppercase tracking-wide">
                                {error === "Invalid login credentials" ? "E-mail ou senha incorretos." : error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white hover:bg-slate-100 text-slate-950 font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {mode === 'login' ? 'Entrar no Painel' : 'Criar minha Conta'}
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-slate-500 text-xs font-medium">
                        Dúvidas? <a href="#" className="text-white font-bold hover:underline">Fale com o estrategista.</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
