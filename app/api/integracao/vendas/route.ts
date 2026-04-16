import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import axios from 'axios';


export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        // Extract fields
        const doc = formData.get('doc') as string;
        const name = formData.get('name') as string;
        const productId = Number(formData.get('productId'));
        const customPrice = Number(formData.get('customPrice'));
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const cep = formData.get('cep') as string;
        const street = formData.get('street') as string;
        const number = formData.get('number') as string;
        const neighborhood = formData.get('neighborhood') as string;
        const city = formData.get('city') as string;
        const state = formData.get('state') as string;
        const complement = formData.get('complement') as string;
        const ibge = formData.get('ibge') as string;
        const videoConference = formData.get('videoConference') === 'true';
        const sellerId = formData.get('seller_id') as string;
        const sellerCommission = Number(formData.get('seller_commission'));
        const legalRepName = formData.get('legalRepName') as string;
        const legalRepCpf = (formData.get('legalRepCpf') as string || '').replace(/\D/g, '');
        const calculationMemory = formData.get('calculation_memory') as string;
        const partnerCost = Number(formData.get('partner_cost') || 0);
        const taxesValue = Number(formData.get('taxes') || 0);
        const fixedFees = Number(formData.get('fixed_fees') || 0);
        const isDraft = formData.get('isDraft') === 'true';
        const orderId = formData.get('id') as string;
        const isUpdateStatusOnly = formData.get('isUpdateStatusOnly') === 'true';
        const newStatus = formData.get('status') as string;

        // Special case: Only updating status (e.g., archiving)
        if (isUpdateStatusOnly && orderId && newStatus) {
            const { error: updateError } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (updateError) {
                return NextResponse.json({
                    error: `Erro ao atualizar status: ${updateError.message}`
                }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: `Status atualizado para ${newStatus}`
            }, { status: 200 });
        }

        // Extract files
        const files = formData.getAll('files') as File[];

        let protocol = "";
        let supplierData = null;
        let vendaUuid = null;
        let productMediaType: string | undefined = undefined;

        if (!isDraft) {
            // 0. Fetch CertControl settings (token + URL) from database
            const { data: settings, error: settingsError } = await supabaseAdmin
                .from('system_settings')
                .select('key, value')
                .in('key', ['certcontrol_api_token', 'certcontrol_api_url']);

            const settingsMap = Object.fromEntries(
                (settings || []).map((s: any) => [s.key, s.value])
            );

            const CERTCONTROL_TOKEN = settingsMap['certcontrol_api_token'];
            const CERTCONTROL_API_URL = settingsMap['certcontrol_api_url'];

            if (!CERTCONTROL_TOKEN) {
                return NextResponse.json({
                    error: "Token da API CertControl não configurado. Acesse Admin > Fornecedores para configurar."
                }, { status: 503 });
            }

            if (!CERTCONTROL_API_URL) {
                return NextResponse.json({
                    error: "URL da API CertControl não configurada. Acesse Admin > Fornecedores para configurar."
                }, { status: 503 });
            }

            // 1. Fetch linkage details for the product (Only needed for real sales)
            const { data: product, error: productError } = await supabase
                .from('products')
                .select(`
                    *,
                    supplier_products (
                        *,
                        supplier_tables (*)
                    )
                `)
                .eq('id', productId)
                .single();

            if (productError || !product) {
                return NextResponse.json({ error: "Produto não encontrado ou sem vínculo." }, { status: 404 });
            }

            const supplierProduct = product.supplier_products;
            const supplierTable = supplierProduct?.supplier_tables;
            productMediaType = product.media_type;

            if (!supplierProduct?.external_id || !supplierTable?.external_id) {
                return NextResponse.json({
                    error: "Este produto não possui mapeamento ID de Tabela/Produto para o fornecedor."
                }, { status: 400 });
            }

            // 2. Prepare payload for CertControl
            const cleanDoc = doc.replace(/\D/g, '');
            const cleanPhone = phone.replace(/\D/g, '');
            const areaCode = cleanPhone.substring(0, 2);
            const phoneNumber = cleanPhone.substring(2);
            const launchType = videoConference ? 7 : 1;

            const cleanIbge = (ibge || '').replace(/\D/g, '');
            const ibgeCode = cleanIbge.length === 7 ? cleanIbge : '0000000';

            const certControlPayload = {
                venda: {
                    produto_id: String(supplierProduct.external_id),
                    tabela_id: String(supplierTable.external_id),
                    valor_total: Number(customPrice),
                    tipo_lancamento_id: String(launchType)
                },
                certificado: {
                    nome: name,
                    documento: cleanDoc,
                    documento_tipo: cleanDoc.length === 14 ? 'CNPJ' : 'CPF',
                    emails: [email],
                    celular: {
                        codigo_area: areaCode,
                        numero: phoneNumber
                    },
                    endereco: {
                        cep: cep.replace(/\D/g, ''),
                        uf: state,
                        municipio: city,
                        codigo_ibge: ibgeCode,
                        logradouro: street,
                        numero: number,
                        bairro: neighborhood,
                        complemento: complement || ""
                    },
                    ...(cleanDoc.length === 14 ? {
                        representante_legal: {
                            nome: legalRepName,
                            documento: legalRepCpf
                        }
                    } : {})
                },
                faturamento: {
                    nome: name,
                    documento: cleanDoc,
                    documento_tipo: cleanDoc.length === 14 ? 'CNPJ' : 'CPF',
                    emails: [email],
                    celular: {
                        codigo_area: areaCode,
                        numero: phoneNumber
                    },
                    endereco: {
                        cep: cep.replace(/\D/g, ''),
                        uf: state,
                        municipio: city,
                        codigo_ibge: ibgeCode,
                        logradouro: street,
                        numero: number,
                        bairro: neighborhood,
                        complemento: complement || ""
                    }
                }
            };

            // 3. Call CertControl API (Order Creation)
            const certResponse = await axios.post(`${CERTCONTROL_API_URL}/api/integracao/vendas`, certControlPayload, {
                headers: {
                    'Authorization': `Bearer ${CERTCONTROL_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            supplierData = certResponse.data.data;
            protocol = `PEDIDO - ${supplierData.id}`;
            vendaUuid = supplierData.uuid;

            // 4. Handle Document Upload (if files exist)
            if (files.length > 0) {
                try {
                    const docsFormData = new FormData();
                    for (const file of files) {
                        docsFormData.append('files[]', file);
                    }

                    await axios.post(`${CERTCONTROL_API_URL}/api/public/venda/${vendaUuid}/documentos`, docsFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                } catch (docError: any) {
                    console.error("Document Upload Error:", docError.response?.data || docError.message);
                    // We don't fail the whole order if docs fail, just log it
                }
            }
        } else {
            // It's a Draft
            // Generate a temporary protocol if it doesn't have one
            protocol = `DELTA-R-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        }

        // 5. Persist Order in Supabase
        const orderData: any = {
            status: isDraft ? 'Rascunho' : 'Pendente',
            holder_name: name || (isDraft ? 'Rascunho Incompleto' : ''),
            doc: doc || (isDraft ? '000.000.000-00' : ''),
            product_id: productId || null,
            final_price: customPrice || 0,
            seller_commission: sellerCommission || 0,
            address_details: {
                cep, street, number, neighborhood, city, state, complement
            },
            technical_details: {
                mediaType: productMediaType,
                videoConference,
                appointmentDate: formData.get('appointmentDate'),
                appointmentTime: formData.get('appointmentTime')
            },
            seller_id: sellerId,
            billing_details: {
                billingType: formData.get('billingType'),
                billingDoc: formData.get('billingDoc'),
                billingName: formData.get('billingName'),
                billingEmail: formData.get('billingEmail'),
                billingPhone: formData.get('billingPhone'),
                billingCep: formData.get('billingCep'),
                billingStreet: formData.get('billingStreet'),
                billingNumber: formData.get('billingNumber'),
                billingNeighborhood: formData.get('billingNeighborhood'),
                billingCity: formData.get('billingCity'),
                billingState: formData.get('billingState')
            },
            origin: formData.get('origin') || 'Venda Direta',
            calculation_memory: calculationMemory ? JSON.parse(calculationMemory) : null,
            partner_cost: partnerCost,
            taxes: taxesValue,
            fixed_fees: fixedFees
        };

        // If not draft, add supplier metadata
        if (!isDraft && supplierData) {
            orderData.protocol = protocol;
            orderData.supplier_order_id = supplierData.id;
            orderData.supplier_uuid = vendaUuid;
            orderData.supplier_status = supplierData.status;
            orderData.supplier_link_pagamento = supplierData.link_pagamento;
            orderData.supplier_link_agendamento = supplierData.link_agendamento;
            orderData.supplier_product_name = supplierData.produto;
            orderData.supplier_valor_total = Number(supplierData.valor_total || 0);
            orderData.supplier_valor_comissao = supplierData.valor_comissao ? Number(supplierData.valor_comissao) : 0;
            orderData.supplier_valor_desconto = Number(supplierData.valor_desconto || 0);
            orderData.supplier_valor_acrescimo = Number(supplierData.valor_acrescimo || 0);
            orderData.supplier_valor_tabela = supplierData.valor_tabela ? Number(supplierData.valor_tabela) : 0;
        } else if (isDraft) {
            // Ensure we keep the protocol we had or use the new one
            orderData.protocol = protocol;
        }

        if (orderId) {
            orderData.id = orderId;
        }

        const { error: orderError } = await supabase
            .from('orders')
            .upsert([orderData]);

        if (orderError) {
            return NextResponse.json({
                error: `Erro ao salvar rascunho no banco: ${orderError.message}`
            }, { status: 500 });
        }

        // --- INTELLIGENT CRM: Automatic Customer Registration ---
        if (!isDraft && name && doc) {
            try {
                // Clean document for consistent lookup and storage
                const cleanDocNumber = doc.replace(/\D/g, '');

                // Calculate estimated expiry date
                let calculatedExpiry = null;
                if (productMediaType) {
                    const now = new Date();
                    if (productMediaType.toLowerCase().includes('token') || productMediaType.toLowerCase().includes('cartão')) {
                        // Usually A3 (3 years)
                        now.setFullYear(now.getFullYear() + 3);
                    } else {
                        // Usually A1 (1 year)
                        now.setFullYear(now.getFullYear() + 1);
                    }
                    calculatedExpiry = now.toISOString().split('T')[0];
                }

                // Get current seller name if we only have ID
                let finalSellerName = formData.get('seller_name') as string;
                if (!finalSellerName && sellerId) {
                    const { data: p } = await supabaseAdmin.from('profiles').select('full_name').eq('id', sellerId).single();
                    finalSellerName = p?.full_name || 'Vendedor';
                }

                // 1. Try to get existing customer to update total_spent (Using admin client and clean doc)
                const { data: existingCustomer } = await supabaseAdmin
                    .from('customers')
                    .select('id, total_spent')
                    .eq('doc', cleanDocNumber)
                    .maybeSingle();

                const newSpent = (Number(existingCustomer?.total_spent) || 0) + (customPrice || 0);

                // 2. Upsert Customer
                const customerPayload: any = {
                    doc: cleanDocNumber,
                    name: name,
                    email: email,
                    phone: phone,
                    status: 'Ativo',
                    origin: 'Próprio',
                    seller_name: finalSellerName,
                    seller_id: sellerId,
                    total_spent: newSpent,
                    last_contact: new Date().toISOString(),
                    expiry_date: calculatedExpiry,
                    certificate_type: productMediaType || 'Digital',
                    // Address Integration
                    address_zip: cep,
                    address_street: street,
                    address_number: number,
                    address_neighborhood: neighborhood,
                    address_city: city,
                    address_state: state,
                    address_complement: complement
                };

                // PJ Specific: Link representative
                if (cleanDocNumber.length === 14 && legalRepCpf) {
                    customerPayload.responsible_cpf = legalRepCpf;
                }

                const { error: crmError } = await supabaseAdmin
                    .from('customers')
                    .upsert(customerPayload, { onConflict: 'doc' });

                if (crmError) {
                    console.error("🔴 CRM Upsert Error:", crmError.message);
                } else {
                    console.log(`✅ Customer ${name} (${cleanDocNumber}) registered/updated successfully.`);
                }

            } catch (crmError: any) {
                console.error("🔴 CRM Auto-registration Exception:", crmError.message);
                // We don't block the order if CRM sync fails
            }
        }

        return NextResponse.json({
            success: true,
            message: isDraft ? "Rascunho salvo!" : "Pedido integrado com sucesso!",
            protocol: protocol,
            paymentLink: supplierData?.link_pagamento,
            scheduleLink: supplierData?.link_agendamento,
            uuid: vendaUuid
        }, { status: 201 });

    } catch (error: any) {
        console.error("🔴 Venda Integration Error:", error.message);
        return NextResponse.json({
            error: "Erro na integração com CertControl: " + (error.response?.data?.message || error.message)
        }, { status: 500 });
    }
}
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('id');

        if (!orderId) {
            return NextResponse.json({ error: "ID do pedido é obrigatório." }, { status: 400 });
        }

        // 1. Fetch current status to verify deletion permission
        // We use supabaseAdmin to ensure we can check the status regardless of RLS for this safety check
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('status, protocol')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
        }

        // 2. CRITICAL SAFETY CHECK: Only 'Rascunho' can be deleted
        if (order.status !== 'Rascunho') {
            return NextResponse.json({
                error: `Operação não permitida. Apenas rascunhos podem ser excluídos. Este pedido tem status: ${order.status}`
            }, { status: 403 });
        }

        // 3. Perform Deletion
        const { error: deleteError } = await supabaseAdmin
            .from('orders')
            .delete()
            .eq('id', orderId);

        if (deleteError) {
            return NextResponse.json({
                error: `Erro ao excluir rascunho: ${deleteError.message}`
            }, { status: 500 });
        }

        console.log(`✅ Order ${orderId} (${order.protocol}) deleted successfully.`);

        return NextResponse.json({
            success: true,
            message: "Rascunho excluído com sucesso!"
        }, { status: 200 });

    } catch (error: any) {
        console.error("🔴 Delete Order Error:", error.message);
        return NextResponse.json({
            error: "Erro na exclusão do rascunho: " + error.message
        }, { status: 500 });
    }
}
