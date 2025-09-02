import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
  source: z.string().default('website'),
  tags: z.array(z.string()).default([]),
  preferences: z.object({
    exchangeRates: z.boolean().default(true),
    marketNews: z.boolean().default(true),
    promotions: z.boolean().default(false)
  }).optional()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validatedData = subscribeSchema.parse(body);

    // Normalizar email
    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Verificar si ya está suscrito (simulated)
    // TODO: Implementar verificación real en base de datos
    console.log('📧 Nueva suscripción al newsletter:', {
      ...validatedData,
      email: normalizedEmail,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: Implementar integración con servicio de email marketing
    /*
    // Ejemplo con Mailchimp
    await mailchimp.lists.addListMember(process.env.MAILCHIMP_LIST_ID, {
      email_address: normalizedEmail,
      status: 'subscribed',
      merge_fields: {
        FNAME: validatedData.name?.split(' ')[0] || '',
        LNAME: validatedData.name?.split(' ').slice(1).join(' ') || '',
        SOURCE: validatedData.source
      },
      tags: validatedData.tags
    });
    
    // Ejemplo con SendGrid
    await sendGrid.marketing.contacts.add({
      contacts: [{
        email: normalizedEmail,
        first_name: validatedData.name?.split(' ')[0],
        last_name: validatedData.name?.split(' ').slice(1).join(' '),
        custom_fields: {
          source: validatedData.source,
          exchange_rates: validatedData.preferences?.exchangeRates,
          market_news: validatedData.preferences?.marketNews,
          promotions: validatedData.preferences?.promotions
        }
      }]
    });
    */

    // Simular respuesta exitosa
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return NextResponse.json({
      success: true,
      message: '¡Te has suscrito exitosamente! Revisa tu email para confirmar.',
      data: {
        id: subscriptionId,
        email: normalizedEmail,
        status: 'subscribed',
        subscribedAt: new Date().toISOString()
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error procesando suscripción:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: error.errors
      }, { status: 400 });
    }

    // Error de email duplicado (ejemplo)
    if (error instanceof Error && error.message.includes('already subscribed')) {
      return NextResponse.json({
        success: false,
        message: 'Este email ya está suscrito a nuestro newsletter'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}