import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    let query = supabase
        .from('orders')
        .select(`
            *,
            products:product_id (
                id,
                name,
                category,
                commission_bronze,
                commission_prata,
                commission_ouro
            )
        `)
        .order('created_at', { ascending: false });

    if (role !== 'admin' && userId) {
        query = query.eq('seller_id', userId);
    }

    const { data: orders, error: ordersError } = await query;
    if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 });

    // Fetch customer data for these orders to get expiry_date
    // Normalize docs for matching (some have dots/dashes in orders table)
    const docs = Array.from(new Set((orders || []).map(o => o.doc?.replace(/\D/g, '')))).filter(Boolean);
    let customerMap: Record<string, any> = {};

    if (docs.length > 0) {
        const { data: customers } = await supabase
            .from('customers')
            .select('doc, expiry_date, status')
            .in('doc', docs);

        customerMap = (customers || []).reduce((acc: any, curr: any) => {
            acc[curr.doc] = curr;
            return acc;
        }, {});
    }

    // Format for front-end
    const formatted = (orders || []).map(o => {
        const cleanDoc = o.doc?.replace(/\D/g, '');
        const customerData = customerMap[cleanDoc];
        const isCancelled = ['Cancelado', 'Estornado', 'Reembolsado'].includes(o.status || '');
        const expiryDate = isCancelled ? null : (customerData?.expiry_date || null);

        // Force "Emitido" if we have an expiry date, but NOT for cancelled orders
        let supplierStatus = o.supplier_status;
        if (!isCancelled && expiryDate && (supplierStatus === 'Pago' || !supplierStatus)) {
            supplierStatus = 'Emitido';
        }

        return {
            ...o,
            product: o.products?.name || 'Desconhecido',
            category: o.products?.category || (cleanDoc?.length > 11 ? 'CNPJ' : 'PF'),
            date: new Date(o.created_at).toLocaleDateString('pt-BR'),
            holder: o.holder_name,
            expiry_date: expiryDate,
            supplier_status: isCancelled ? o.supplier_status : supplierStatus,
            customer_status: customerData?.status || 'Lead'
        };
    });

    return NextResponse.json(formatted);
}
