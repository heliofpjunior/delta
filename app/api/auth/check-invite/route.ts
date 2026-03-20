import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "E-mail necessário" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('allowed_emails')
            .select('email')
            .eq('email', email.toLowerCase().trim())
            .single();

        // If error or no data, it means NOT whitelisted
        return NextResponse.json({
            allowed: !!data && !error
        });
    } catch (error) {
        return NextResponse.json({ allowed: false });
    }
}
