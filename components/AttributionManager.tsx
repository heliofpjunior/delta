"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * Global Attribution Manager
 * Checks for ?ref= or ?v= or ?coupon= in the URL and persists it.
 * This should be included in the root layout or AppWrapper.
 */
export default function AttributionManager() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleUrlParams = async () => {
            const ref = searchParams.get('ref'); // ID or Slug
            const seller = searchParams.get('v'); // Seller Slug
            const coupon = searchParams.get('coupon');

            if (ref || seller) {
                try {
                    // Try to resolve attribution
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('id, store_slug')
                        .or(`id.eq.${ref},store_slug.eq.${ref},store_slug.eq.${seller}`)
                        .single();

                    if (profile) {
                        const attribution = {
                            vendedor_id: profile.id,
                            timestamp: new Date().getTime(),
                            source: ref ? 'link_ref' : 'seller_slug'
                        };
                        localStorage.setItem('delta_attribution', JSON.stringify(attribution));
                        console.log("Atribuição detectada e salva:", profile.id);
                    }
                } catch (e) {
                    console.error("Erro ao processar atribuição via URL:", e);
                }
            }

            if (coupon) {
                // If a coupon is passed in URL, pre-save it for checkout
                localStorage.setItem('delta_pending_coupon', coupon);
            }
        };

        handleUrlParams();
    }, [searchParams]);

    return null; // Invisible component
}
