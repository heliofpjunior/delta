import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data: products, error } = await supabase
        .from('products')
        .select('*, supplier_products(*, supplier_tables(*))')
        .eq('is_active', true)
        .order('name', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(products);
}

export async function POST(request: Request) {
    const data = await request.json();

    const { data: newProduct, error } = await supabase
        .from('products')
        .insert([data])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(newProduct, { status: 201 });
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, ...updates } = data;

    const { data: updated, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
