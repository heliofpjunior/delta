import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const doc = searchParams.get('doc')?.replace(/[^0-9]/g, '');

    if (!doc) return NextResponse.json({ error: "Documento não informado" }, { status: 400 });

    try {
        // Build a flexible query: Clean search + possible original formats
        // This handles cases where data might already be stored with formatting (dots/dashes)
        let orFilter = `doc.eq.${doc}`;

        // If it looks like a CPF, add potential formatting variations
        if (doc.length === 11) {
            const formattedCpf = `${doc.substring(0, 3)}.${doc.substring(3, 6)}.${doc.substring(6, 9)}-${doc.substring(9)}`;
            orFilter += `,doc.eq.${formattedCpf}`;
        }
        // If it looks like a CNPJ
        else if (doc.length === 14) {
            const formattedCnpj = `${doc.substring(0, 2)}.${doc.substring(2, 5)}.${doc.substring(5, 8)}/${doc.substring(8, 12)}-${doc.substring(12)}`;
            orFilter += `,doc.eq.${formattedCnpj}`;
        }

        const { data: customer, error } = await supabase
            .from('customers')
            .select('*')
            .or(orFilter)
            .maybeSingle();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (customer) {
            return NextResponse.json(customer);
        }

        return NextResponse.json({ message: "Nenhum dado prévio encontrado para este documento." }, { status: 404 });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
