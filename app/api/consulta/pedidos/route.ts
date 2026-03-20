import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doc = searchParams.get('doc')?.replace(/[^0-9]/g, '');

    if (!doc) return NextResponse.json({ error: "Documento não informado" }, { status: 400 });

    try {
        // Query orders with basic formatting for the UI
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                final_price,
                supplier_product_name,
                products (
                    name
                )
            `)
            .eq('doc', doc)
            .order('created_at', { ascending: false });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Map data to the format expected by the frontend
        const mappedOrders = (orders || []).map(order => ({
            id: order.id,
            created_at: order.created_at,
            total_amount: order.final_price,
            product_name: order.supplier_product_name || (order.products as any)?.name || 'Produto Não Identificado'
        }));

        return NextResponse.json(mappedOrders);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
