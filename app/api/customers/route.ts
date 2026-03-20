import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper to convert empty strings to null for Supabase
const sanitizeData = (obj: any) => {
    const sanitized = { ...obj };
    Object.keys(sanitized).forEach(key => {
        if (sanitized[key] === "") sanitized[key] = null;
    });
    return sanitized;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    let query = supabase.from('customers').select('*, contacts:customer_contacts(*)');

    if (role !== 'admin' && userId) {
        query = query.eq('seller_id', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB values back to UI labels
    const mappedData = (data || []).map(customer => ({
        ...customer,
        origin: customer.origin === 'Próprio' ? 'Renovação' :
            customer.origin === 'Concorrente' ? 'Migração' :
                customer.origin
    }));

    return NextResponse.json(mappedData);
}

export async function POST(request: Request) {
    const data = await request.json();
    const { seller, sellerId, contacts, ...rest } = data;

    // Clean documents
    if (rest.doc) rest.doc = rest.doc.replace(/\D/g, '');
    if (rest.responsible_cpf) rest.responsible_cpf = rest.responsible_cpf.replace(/\D/g, '');

    // Map UI labels to DB values
    const dbRest = {
        ...rest,
        origin: rest.origin === 'Renovação' ? 'Próprio' :
            rest.origin === 'Migração' ? 'Concorrente' :
                rest.origin
    };

    const sanitizedRest = sanitizeData(dbRest);

    const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([{
            ...sanitizedRest,
            seller_name: seller,
            seller_id: sellerId,
            total_spent: 0
        }])
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: `Erro ao criar cliente: ${error.message}` }, { status: 500 });
    }

    // Insert contacts if any
    if (contacts && Array.isArray(contacts) && contacts.length > 0) {
        const contactsToInsert = contacts.map(c => {
            return {
                customer_id: newCustomer.id,
                name: c.tag || c.type || 'Geral', // Default name to tag or type
                department: c.tag || 'Geral',
                email: c.type === 'Email' ? c.value : null,
                phone: (c.type === 'WhatsApp' || c.type === 'Telefone') ? c.value : null
            };
        });

        const { error: contactsError } = await supabase.from('customer_contacts').insert(contactsToInsert);
        if (contactsError) {
            console.error('Error inserting contacts:', contactsError);
        }
    }

    return NextResponse.json(newCustomer, { status: 201 });
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, contacts, ...updates } = data;

    // Clean documents
    if (updates.doc) updates.doc = updates.doc.replace(/\D/g, '');
    if (updates.responsible_cpf) updates.responsible_cpf = updates.responsible_cpf.replace(/\D/g, '');

    // Map UI labels to DB values
    const dbUpdates = {
        ...updates,
        origin: updates.origin === 'Renovação' ? 'Próprio' :
            updates.origin === 'Migração' ? 'Concorrente' :
                updates.origin
    };

    const sanitizedUpdates = sanitizeData(dbUpdates);

    const { data: updatedCustomer, error } = await supabase
        .from('customers')
        .update(sanitizedUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: `Erro ao atualizar cliente: ${error.message}` }, { status: 500 });
    }

    // Handle contacts: simpler to delete and recreate
    if (contacts && Array.isArray(contacts)) {
        await supabase.from('customer_contacts').delete().eq('customer_id', id);

        if (contacts.length > 0) {
            const contactsToInsert = contacts.map(c => {
                return {
                    customer_id: id,
                    name: c.tag || c.type || 'Geral',
                    department: c.tag || 'Geral',
                    email: c.type === 'Email' ? c.value : null,
                    phone: (c.type === 'WhatsApp' || c.type === 'Telefone') ? c.value : null
                };
            });
            await supabase.from('customer_contacts').insert(contactsToInsert);
        }
    }

    return NextResponse.json(updatedCustomer);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
