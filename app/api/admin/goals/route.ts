import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    const { data: goals, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(goals);
}

export async function POST(request: Request) {
    const data = await request.json();

    const { data: newGoal, error } = await supabase
        .from('goals')
        .insert([data])
        .select()
        .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(newGoal, { status: 201 });
}
