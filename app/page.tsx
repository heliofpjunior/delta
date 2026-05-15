import { cn } from "@/lib/utils";
import { ArrowRight, ShieldCheck, CheckCircle2, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const revalidate = 60; // Revalidate cache every 60 seconds

export default async function LandingPage() {
    let products: any[] = [];
    
    try {
        const { data, error } = await supabaseAdmin
            .from("products")
            .select("*")
            .eq("is_active", true)
            .order("price", { ascending: true });
            
        if (error) console.error("Erro ao buscar produtos:", error);
        if (data) products = data;
    } catch (err) {
        console.error("Erro fatal ao buscar produtos:", err);
    }

    return (
        <div className="min-h-screen bg-[#020817] text-slate-200 selection:bg-emerald-500/30 overflow-hidden font-sans">
            {/* Nav */}
            <nav className="fixed top-0 w-full z-50 bg-[#020817]/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <ShieldCheck size={24} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter">Delta<span className="text-emerald-500">360</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-400">
                        <a href="#produtos" className="hover:text-white transition-colors">Produtos</a>
                        <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
                        <a href="#faq" className="hover:text-white transition-colors">Dúvidas</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                            Área do Parceiro
                        </Link>
                        <a href="#produtos" className="bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105">
                            Emitir Agora
                        </a>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-widest mb-8">
                        <span className="relative flex size-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
                        </span>
                        Sistema 100% Online
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-8">
                        Seu Certificado Digital<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                            Emitido em 5 Minutos.
                        </span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-400 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
                        Sem filas, sem burocracia e totalmente seguro. Faça tudo por videoconferência do seu celular ou computador e tenha seu certificado pronto para uso imediato.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#produtos" className="w-full sm:w-auto bg-emerald-500 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 group">
                            Ver Opções
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                            <Play size={18} />
                            Como Funciona
                        </button>
                    </div>
                </div>
            </section>

            {/* Products */}
            <section id="produtos" className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">Escolha seu Certificado</h2>
                        <p className="text-slate-400">Todos os certificados A1 possuem validade de 12 meses e são emitidos no mesmo dia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {products.length > 0 ? products.map((product) => (
                            <div key={product.id} className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex flex-col hover:bg-white/10 transition-colors group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-colors" />
                                
                                <div className="size-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30">
                                    <ShieldCheck size={32} />
                                </div>
                                
                                <h3 className="text-2xl font-black text-white tracking-tight mb-2">{product.name}</h3>
                                <p className="text-sm text-slate-400 mb-6 flex-1">{product.description || "Ideal para emissão de notas fiscais e acessos aos portais do governo."}</p>
                                
                                <div className="mb-8">
                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-1">Preço Único</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-bold text-slate-300">R$</span>
                                        <span className="text-5xl font-black text-white tracking-tighter">{Number(product.price).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {['Validade de 1 ano (A1)', 'Instale em vários PCs', 'Emissão por Vídeo'].map((benefit, i) => (
                                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>

                                <Link 
                                    href={`/checkout?product=${product.id}`}
                                    className="w-full bg-emerald-500 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                >
                                    Comprar Agora
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        )) : (
                            <div className="col-span-3 py-20 text-center">
                                <p className="text-slate-400 animate-pulse font-bold tracking-widest uppercase">Carregando produtos disponíveis...</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6 bg-black/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-3">
                        <ShieldCheck size={24} className="text-emerald-500" />
                        <span className="text-lg font-black text-white tracking-tighter">Delta<span className="text-emerald-500">360</span></span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                        © {new Date().getFullYear()} Delta360 Certificadora. Todos os direitos reservados.
                    </p>
                    <div className="flex gap-4">
                        {/* Redes */}
                    </div>
                </div>
            </footer>
        </div>
    );
}
