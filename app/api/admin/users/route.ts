import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(users);
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, level, status } = data;

    const { data: updatedUser, error } = await supabase
        .from('profiles')
        .update({ level, status })
        .eq('id', id)
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(updatedUser);
}
