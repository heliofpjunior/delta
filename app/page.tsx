import { cn } from "@/lib/utils";
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
        <div className="bg-surface text-on-surface font-body-md antialiased overflow-x-hidden min-h-screen">
            {/* TopNavBar */}
            <nav className="fixed top-0 left-0 w-full z-50 glass-header border-b border-outline-variant dark:border-outline shadow-sm h-16">
                <div className="max-w-container-max mx-auto h-full flex justify-between items-center px-gutter">
                    <div className="flex items-center gap-2">
                        <div className="size-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-xl">shield_check</span>
                        </div>
                        <div className="text-headline-md font-bold text-primary dark:text-primary-fixed tracking-tighter">
                            Delta360
                        </div>
                    </div>
                    <div className="hidden md:flex gap-8 items-center">
                        <a className="text-sm font-bold text-primary border-b-2 border-primary pb-1" href="#certificados">Certificados</a>
                        <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#precos">Preços</a>
                        <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#como-funciona">Como Funciona</a>
                        <a className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors" href="#duvidas">Dúvidas</a>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/dashboard" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity hidden md:block">
                            Área do Parceiro
                        </Link>
                        <a href="#precos" className="bg-primary text-on-primary text-sm font-bold px-6 py-2 rounded-xl hover:opacity-90 transition-all active:scale-95 shadow-md">
                            Comprar
                        </a>
                    </div>
                </div>
            </nav>

            <main className="pt-16">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-surface py-section-padding px-gutter">
                    <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-stack-lg items-center">
                        <div className="z-10 text-center lg:text-left space-y-6">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest">
                                100% Digital e Seguro
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-primary leading-[1.1] tracking-tight">
                                Certificado Digital <br className="hidden md:block" />
                                <span className="text-on-surface">sem burocracia</span>
                            </h1>
                            <p className="text-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
                                Segurança, validade jurídica e agilidade para você ou sua empresa. Emita seu certificado em minutos com suporte especializado e tecnologia ICP-Brasil.
                            </p>
                            <div className="flex flex-col sm:row gap-4 justify-center lg:justify-start pt-4">
                                <a className="inline-flex items-center justify-center px-8 py-4 bg-primary text-on-primary rounded-2xl font-bold text-lg hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95" href="#precos">
                                    Ver Preços
                                </a>
                                <a className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary/20 text-primary rounded-2xl font-bold text-lg hover:bg-primary/5 transition-all" href="#como-funciona">
                                    Saiba Mais
                                </a>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-10 bg-primary/5 rounded-full blur-3xl"></div>
                            <div className="relative bg-white dark:bg-surface-container p-4 rounded-[2.5rem] shadow-2xl border border-outline-variant/30">
                                <img 
                                    alt="Ambiente Digital Delta360" 
                                    className="rounded-[2rem] w-full object-cover aspect-[4/3] md:aspect-square shadow-inner" 
                                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200" 
                                />
                                <div className="absolute -bottom-6 -left-6 bg-white dark:bg-surface-container-highest p-4 rounded-2xl shadow-xl border border-outline-variant flex items-center gap-3 animate-bounce shadow-primary/10">
                                    <div className="size-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                                        <span className="material-symbols-outlined">check</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-black uppercase leading-none">Emissão Instantânea</p>
                                        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Validação via vídeo</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Icons */}
                <section className="bg-surface-container-low py-12">
                    <div className="max-w-[1200px] mx-auto px-gutter">
                        <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70 grayscale hover:grayscale-0 transition-all">
                            <div className="flex flex-col items-center gap-2 trust-badge-hover">
                                <span className="material-symbols-outlined text-4xl text-secondary">verified_user</span>
                                <span className="font-label-md text-label-md font-bold text-on-surface">ICP-Brasil</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 trust-badge-hover">
                                <span className="material-symbols-outlined text-4xl text-secondary">lock</span>
                                <span className="font-label-md text-label-md font-bold text-on-surface">SSL 256-bit</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 trust-badge-hover">
                                <span className="material-symbols-outlined text-4xl text-secondary">gavel</span>
                                <span className="font-label-md text-label-md font-bold text-on-surface">Validade Jurídica</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 trust-badge-hover">
                                <span className="material-symbols-outlined text-4xl text-secondary">shield_with_heart</span>
                                <span className="font-label-md text-label-md font-bold text-on-surface">GDPR/LGPD</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Product Grid */}
                <section className="py-section-padding px-gutter bg-surface" id="precos">
                    <div className="max-w-container-max mx-auto">
                        <div className="text-center mb-stack-lg space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Escolha seu Certificado</h2>
                            <p className="text-on-surface-variant max-w-2xl mx-auto font-medium">Soluções completas para pessoas físicas e jurídicas com o melhor custo-benefício do mercado.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                            {products.length > 0 ? (
                                products.map((product: any, idx: number) => (
                                    <div 
                                        key={product.id}
                                        className={cn(
                                            "bg-white dark:bg-surface-container-lowest p-8 rounded-[2rem] border transition-all duration-500 flex flex-col h-full group hover:shadow-2xl",
                                            idx === 1 ? "border-primary border-2 shadow-xl scale-105 z-10" : "border-outline-variant hover:border-primary/50"
                                        )}
                                    >
                                        {idx === 1 && (
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                Mais Popular
                                            </div>
                                        )}
                                        <div className="mb-6">
                                            <div className={cn(
                                                "size-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110",
                                                idx === 1 ? "bg-primary text-white" : "bg-primary/10 text-primary"
                                            )}>
                                                <span className="material-symbols-outlined text-3xl">
                                                    {product.name.toLowerCase().includes('cpf') ? 'person' : 
                                                     product.name.toLowerCase().includes('cnpj') ? 'business' : 'receipt_long'}
                                                </span>
                                            </div>
                                            <h3 className="text-2xl font-black text-on-surface mb-2 uppercase tracking-tight">{product.name}</h3>
                                            <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                                                {product.description || "Identidade digital com validade jurídica e segurança total."}
                                            </p>
                                        </div>
                                        <div className="mt-auto space-y-6">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Investimento</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-lg font-bold text-primary">R$</span>
                                                    <span className="text-4xl font-black text-primary tracking-tighter">
                                                        {Number(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                            <Link 
                                                href={`/checkout?product=${product.id}`} 
                                                className={cn(
                                                    "block text-center w-full py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all",
                                                    idx === 1 ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20" : "bg-surface-container-highest text-primary hover:bg-primary hover:text-white"
                                                )}
                                            >
                                                Comprar Agora
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <>
                                    {/* Fallback Cards if no products in DB */}
                                    <div className="bg-white dark:bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant hover:border-primary/50 transition-all shadow-sm hover:shadow-xl flex flex-col h-full">
                                        <div className="mb-6">
                                            <span className="material-symbols-outlined text-primary text-4xl mb-4">person</span>
                                            <h3 className="text-2xl font-black text-on-surface mb-2">e-CPF</h3>
                                            <p className="text-on-surface-variant text-sm font-medium">Identidade digital para pessoas físicas. Assine documentos com validade jurídica.</p>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="mb-4">
                                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">A partir de</span>
                                                <div className="text-3xl font-black text-primary">R$ 149,90</div>
                                            </div>
                                            <Link href="/checkout?product=1" className="block text-center w-full py-3 bg-surface-container-highest text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Contratar</Link>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-surface-container-lowest p-8 rounded-[2rem] border-2 border-primary relative transform md:scale-105 shadow-2xl flex flex-col h-full">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Recomendado
                                        </div>
                                        <div className="mb-6">
                                            <span className="material-symbols-outlined text-primary text-4xl mb-4">business</span>
                                            <h3 className="text-2xl font-black text-on-surface mb-2">e-CNPJ</h3>
                                            <p className="text-on-surface-variant text-sm font-medium">Identidade digital para empresas. Emissão de notas e obrigações acessórias.</p>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="mb-4">
                                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">A partir de</span>
                                                <div className="text-3xl font-black text-primary">R$ 229,90</div>
                                            </div>
                                            <Link href="/checkout?product=2" className="block text-center w-full py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all">Contratar</Link>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant hover:border-primary/50 transition-all shadow-sm hover:shadow-xl flex flex-col h-full">
                                        <div className="mb-6">
                                            <span className="material-symbols-outlined text-primary text-4xl mb-4">receipt_long</span>
                                            <h3 className="text-2xl font-black text-on-surface mb-2">NF-e</h3>
                                            <p className="text-on-surface-variant text-sm font-medium">Específico para emissão de Notas Fiscais eletrônicas com segurança total.</p>
                                        </div>
                                        <div className="mt-auto">
                                            <div className="mb-4">
                                                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">A partir de</span>
                                                <div className="text-3xl font-black text-primary">R$ 189,90</div>
                                            </div>
                                            <Link href="/checkout?product=3" className="block text-center w-full py-3 bg-surface-container-highest text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Contratar</Link>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* Why Delta360 (Bento Grid) */}
                <section className="py-section-padding px-gutter bg-surface-container-low">
                    <div className="max-w-container-max mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Por que escolher a Delta360?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto">
                            <div className="md:col-span-8 bg-white dark:bg-surface-container-highest p-10 rounded-[2.5rem] relative overflow-hidden group border border-outline-variant/30 min-h-[350px] flex flex-col justify-end">
                                <div className="relative z-10 space-y-4">
                                    <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl">videocam</span>
                                    </div>
                                    <h3 className="text-3xl font-black tracking-tight">Identificação por Vídeo</h3>
                                    <p className="text-on-surface-variant max-w-md font-medium">Faça sua validação de qualquer lugar do mundo através de uma videoconferência rápida e segura. Sem filas, sem deslocamento.</p>
                                </div>
                                <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-10 group-hover:opacity-20 transition-opacity">
                                    <img alt="Segurança Digital" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800" />
                                </div>
                            </div>
                            <div className="md:col-span-4 bg-primary text-white p-10 rounded-[2.5rem] flex flex-col justify-center text-center items-center group shadow-xl shadow-primary/20">
                                <div className="size-20 bg-white/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-5xl">support_agent</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Suporte 24/7</h3>
                                <p className="text-white/80 text-sm font-bold uppercase tracking-widest">Especialistas prontos para te ajudar a qualquer hora.</p>
                            </div>
                            <div className="md:col-span-4 bg-surface-container-highest p-10 rounded-[2.5rem] flex flex-col justify-between border border-outline-variant/30 group">
                                <h3 className="text-2xl font-black uppercase tracking-tighter">Entrega Relâmpago</h3>
                                <p className="font-medium text-on-surface-variant">Certificado pronto para uso em até 30 minutos após a validação.</p>
                                <span className="material-symbols-outlined text-5xl text-primary mt-6 group-hover:translate-x-2 transition-transform">bolt</span>
                            </div>
                            <div className="md:col-span-8 bg-white dark:bg-surface-container-highest p-10 rounded-[2.5rem] flex items-center gap-8 overflow-hidden border border-outline-variant/30">
                                <div className="flex-1 space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter">Melhor Preço Garantido</h3>
                                    <p className="text-on-surface-variant font-medium">Cobrimos qualquer oferta da concorrência para certificados ICP-Brasil.</p>
                                </div>
                                <div className="size-24 bg-primary/5 rounded-full flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-6xl text-primary opacity-40">sell</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step-by-Step */}
                <section className="py-section-padding px-gutter bg-surface" id="como-funciona">
                    <div className="max-w-container-max mx-auto">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Como funciona</h2>
                            <p className="text-on-surface-variant font-medium uppercase tracking-widest text-xs">Seu certificado digital em 4 passos simples.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
                            {/* Connector line (Desktop) */}
                            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-outline-variant/30 -z-0"></div>
                            
                            {[
                                { step: 1, title: "Compre Online", desc: "Escolha o modelo ideal e finalize o pagamento seguro." },
                                { step: 2, title: "Agende a Validação", desc: "Escolha o melhor horário para sua videoconferência." },
                                { step: 3, title: "Valide seus Dados", desc: "Apresente seus documentos para nosso agente." },
                                { step: 4, title: "Emita e Use", desc: "Baixe seu certificado e comece a assinar agora." },
                            ].map((item) => (
                                <div key={item.step} className="relative z-10 text-center space-y-4">
                                    <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border-8 border-white dark:border-surface group-hover:scale-110 transition-transform">
                                        <span className="font-black text-2xl tracking-tighter">{item.step}</span>
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-tight">{item.title}</h4>
                                    <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="py-section-padding px-gutter bg-surface-container-low" id="duvidas">
                    <div className="max-w-[800px] mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-5xl font-black text-primary tracking-tight">Dúvidas Frequentes</h2>
                        </div>
                        <div className="space-y-4">
                            {[
                                { q: "O que é necessário para a videoconferência?", a: "Você precisará de um documento de identidade original com foto (RG ou CNH), um dispositivo com câmera e microfone, e acesso estável à internet." },
                                { q: "Quanto tempo dura a validade do certificado?", a: "Nossos certificados têm opções de validade de 12 meses (1 ano) ou 36 meses (3 anos), dependendo do plano escolhido durante a compra." },
                                { q: "Posso renovar meu certificado totalmente online?", a: "Sim! Se o seu certificado atual ainda estiver dentro da validade e você já possuir dados biométricos cadastrados, a renovação pode ser feita sem nova videoconferência." },
                            ].map((faq, i) => (
                                <details key={i} className="group bg-white dark:bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant overflow-hidden transition-all duration-300">
                                    <summary className="p-6 cursor-pointer flex justify-between items-center list-none font-bold text-on-surface">
                                        <span className="uppercase tracking-tight">{faq.q}</span>
                                        <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-primary">expand_more</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-on-surface-variant font-medium leading-relaxed">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-section-padding px-gutter flex flex-col items-center gap-stack-lg bg-surface-container-highest dark:bg-surface-container-low border-t border-outline-variant">
                <div className="max-w-container-max w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined">shield_check</span>
                        </div>
                        <div className="text-2xl font-black text-primary tracking-tighter">
                            Delta360
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-8">
                        <a className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">Termos</a>
                        <a className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">Privacidade</a>
                        <a className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">Contato</a>
                        <a className="text-xs font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-all" href="#">ICP-Brasil</a>
                    </div>
                </div>
                <div className="w-full h-px bg-outline-variant opacity-30"></div>
                <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">© 2026 Delta360 Certificação Digital. Todos os direitos reservados.</p>
                    <div className="flex gap-4">
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">public</span>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">verified_user</span>
                        <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer transition-all">shield</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
