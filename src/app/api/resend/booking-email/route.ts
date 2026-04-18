import { NextResponse } from 'next/server';
import { bookingEmailSchema } from '@/lib/validation/schemas';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = bookingEmailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, reservationId, carModel, totalPrice } = result.data;

    // Real Resend integration (activate when RESEND_API_KEY is set)
    if (process.env.RESEND_API_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Ready2Drive SV <reservas@ready2drive.sv>',
            to: [email],
            subject: `Confirmación de Reserva #${reservationId.slice(0, 8)}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 40px; border-radius: 16px;">
                <div style="text-align: center; margin-bottom: 32px;">
                  <h1 style="color: #10b981; font-size: 28px; margin: 0;">Ready2Drive SV</h1>
                  <p style="color: #71717a; font-size: 14px;">Confirmación de Reserva</p>
                </div>
                <div style="background: #18181b; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                  <h2 style="color: #fff; font-size: 20px; margin: 0 0 16px 0;">¡Tu viaje comienza pronto!</h2>
                  <p style="color: #a1a1aa; margin: 8px 0;">Vehículo: <strong style="color: #fff;">${carModel}</strong></p>
                  <p style="color: #a1a1aa; margin: 8px 0;">Reserva: <strong style="color: #fff;">#${reservationId.slice(0, 8)}</strong></p>
                  <p style="color: #a1a1aa; margin: 8px 0;">Total: <strong style="color: #10b981; font-size: 24px;">$${totalPrice.toFixed(2)}</strong></p>
                </div>
                <p style="color: #71717a; font-size: 12px; text-align: center;">
                  Gracias por confiar en Ready2Drive SV. Si tienes dudas, contáctanos.
                </p>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          console.error('Resend API error:', await res.text());
          return NextResponse.json({ error: 'Error enviando email' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Email enviado' });
      } catch (emailErr) {
        console.error('Resend fetch error:', emailErr);
        return NextResponse.json({ error: 'Error enviando email' }, { status: 500 });
      }
    }

    // Fallback: mock mode when no API key
    console.log(`[EMAIL MOCK] Confirmation to ${email} for reservation ${reservationId}`);
    return NextResponse.json({ success: true, message: 'Email simulado (RESEND_API_KEY no configurado)' });
  } catch (error) {
    return NextResponse.json({ error: 'Error procesando solicitud' }, { status: 500 });
  }
}
