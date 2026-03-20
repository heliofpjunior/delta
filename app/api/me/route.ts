import { NextResponse } from 'next/server';

// Mock DB (In-Memory for Demo)
// In a real app, this would be a database call
let userProfile = {
    id: 'user_123',
    name: 'Maria Silva',
    email: 'maria.silva@delta.com.br',
    role: 'admin',
    avatar: null,
    sales_total: 8450.00,
    customers_count: 156
};

export async function GET() {
    return NextResponse.json(userProfile);
}

export async function PUT(request: Request) {
    const data = await request.json();

    // Update internal mock state
    userProfile = {
        ...userProfile,
        ...data
    };

    return NextResponse.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        user: userProfile
    });
}
