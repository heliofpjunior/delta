import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

        // Check if admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('allowed_emails')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return NextResponse.json({ error: "Sessão expirada" }, { status: 401 });

        // Admin check in API
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: "Acesso negado: Apenas administradores podem convidar." }, { status: 403 });
        }

        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });

        const cleanEmail = email.toLowerCase().trim();

        const { error } = await supabase
            .from('allowed_emails')
            .insert([{
                email: cleanEmail,
                created_by: session.user.id
            }]);

        if (error) {
            if (error.code === '23505') {
                return NextResponse.json({ error: "Este e-mail já está na lista de autorizados." }, { status: 400 });
            }
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Erro na API de Convites:", error);
        return NextResponse.json({ error: error.message || "Erro interno do servidor" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) return NextResponse.json({ error: "E-mail não fornecido" }, { status: 400 });

        const { error } = await supabase
            .from('allowed_emails')
            .delete()
            .eq('email', email);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
