import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request) {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const data = await request.json();

        // Allowed fields for self-update
        const { full_name, avatar_url } = data;

        const { data: updated, error } = await supabase
            .from('profiles')
            .update({
                full_name,
                // We add other fields if needed
            })
            .eq('id', session.user.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
