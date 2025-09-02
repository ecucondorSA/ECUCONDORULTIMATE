import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
  newsletter: z.boolean().default(false)
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos
    const validatedData = contactSchema.parse(body);

    // Aquí puedes integrar con:
    // - Servicio de email (SendGrid, AWS SES, etc.)
    // - CRM (HubSpot, Salesforce, etc.)
    // - Base de datos
    // - Slack/Discord para notificaciones internas

    // Simulación de procesamiento
    console.log('📧 Nueva consulta de contacto:', {
      ...validatedData,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });

    // TODO: Implementar envío real de email
    /*
    await sendEmail({
      to: 'Ecucondor@gmail.com',
      from: process.env.FROM_EMAIL,
      subject: `Nueva consulta: ${validatedData.subject}`,
      html: `
        <h2>Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${validatedData.name}</p>
        <p><strong>Email:</strong> ${validatedData.email}</p>
        <p><strong>Teléfono:</strong> ${validatedData.phone || 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${validatedData.subject}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${validatedData.message}</p>
        <p><strong>Newsletter:</strong> ${validatedData.newsletter ? 'Sí' : 'No'}</p>
      `
    });
    */

    // TODO: Si el usuario se suscribió al newsletter, agregarlo a la lista
    /*
    if (validatedData.newsletter) {
      await addToNewsletter({
        email: validatedData.email,
        name: validatedData.name
      });
    }
    */

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: {
        id: `contact_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (err) {
    console.error('❌ Error procesando contacto:', err);

    if (err instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        message: 'Datos inválidos',
        errors: err.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Endpoint para obtener estadísticas (opcional)
export async function GET() {
  try {
    // Aquí podrías devolver estadísticas de contactos
    return NextResponse.json({
      success: true,
      data: {
        totalContacts: 150, // Ejemplo
        avgResponseTime: '2 horas',
        lastUpdate: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error al obtener estadísticas'
    }, { status: 500 });
  }
}