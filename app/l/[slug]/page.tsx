"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

/**
 * Direct Link Attribution Handler
 * URL: /l/[slug]
 */
export default function DirectLinkPage() {
    const { slug } = useParams();
    const router = useRouter();

    useEffect(() => {
        const handleAttribution = async () => {
            try {
                // 1. Fetch Sales Link info
                const { data: salesLink, error } = await supabase
                    .from('sales_links')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error || !salesLink) {
                    console.error("Link não encontrado:", error);
                    router.push('/'); // Fallback to home
                    return;
                }

                // 2. Increment Clicks (Background)
                supabase.rpc('increment_link_clicks', { link_id: salesLink.id }).then();

                // 3. Store Attribution in LocalStorage
                const attribution = {
                    vendedor_id: salesLink.vendedor_id,
                    product_id: salesLink.product_id,
                    custom_price: salesLink.custom_price,
                    timestamp: new Date().getTime()
                };
                localStorage.setItem('delta_attribution', JSON.stringify(attribution));

                // 4. Redirect to Checkout or Storefront
                // If it's a specific product link, go to checkout pre-filled
                router.push(`/checkout?product=${salesLink.product_id}`);

            } catch (e) {
                console.error("Erro na atribuição:", e);
                router.push('/');
            }
        };

        if (slug) {
            handleAttribution();
        }
    }, [slug, router]);

    return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center gap-6">
            <div className="size-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 animate-pulse">
                <Loader2 className="animate-spin text-primary" size={40} />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-xl font-black text-[var(--foreground)] uppercase tracking-tighter">Preparando sua oferta...</h2>
                <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Aplicando descontos exclusivos de parceiro</p>
            </div>
        </div>
    );
}
