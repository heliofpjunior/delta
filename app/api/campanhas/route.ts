import { NextResponse } from 'next/server';

let coupons = [
    { id: 1, code: "BEMVINDO20", discount: "20%", influencer: "Geral (Auto)", usages: 145, status: "Ativo", products: "Todos", seller: "admin" },
    { id: 2, code: "CONTAB50", discount: "R$ 50,00", influencer: "Parceiro VIP", usages: 82, status: "Ativo", products: "Apenas A3", seller: "Maria Silva" },
    { id: 3, code: "VERAO30", discount: "30%", influencer: "Maria Silva", usages: 12, status: "Expirado", products: "Todos", seller: "Maria Silva" },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const seller = searchParams.get('seller');

    let filtered = coupons;
    if (seller && seller !== 'admin') {
        filtered = coupons.filter(c => c.seller === seller);
    }

    return NextResponse.json(filtered);
}

export async function POST(request: Request) {
    const data = await request.json();
    const newCoupon = {
        ...data,
        id: Math.floor(Math.random() * 10000),
        usages: 0,
        status: "Ativo"
    };

    coupons.push(newCoupon);
    return NextResponse.json(newCoupon, { status: 201 });
}

export async function PUT(request: Request) {
    const data = await request.json();
    const { id, ...updates } = data;

    const index = coupons.findIndex(c => c.id === id);
    if (index === -1) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    coupons[index] = { ...coupons[index], ...updates };
    return NextResponse.json(coupons[index]);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const index = coupons.findIndex(c => parseInt(c.id.toString()) === parseInt(id || "0"));
    if (index === -1) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const deleted = coupons.splice(index, 1);
    return NextResponse.json(deleted[0]);
}
