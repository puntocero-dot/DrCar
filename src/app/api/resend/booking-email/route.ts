import { NextResponse } from 'next/server';

// MOCK API for Email Notification (Ready for Resend)
export async function POST(req: Request) {
  try {
    const { email, reservationId, carModel, totalPrice } = await req.json();

    console.log(`[EMAIL MOCK] Sending confirmation to ${email} for reservation ${reservationId}`);
    
    // In a real scenario with Resend API Key:
    /*
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Ready2Drive SV <reservas@ready2drive.sv>',
        to: [email],
        subject: `Confirmación de Reserva #${reservationId.slice(0,8)}`,
        html: `
          <h1>¡Tu viaje comienza pronto!</h1>
          <p>Hemos confirmado tu reserva para el <strong>${carModel}</strong>.</p>
          <p>Total pagado (inc. comisión 5%): <strong>$${totalPrice}</strong></p>
          <p>Gracias por confiar en Ready2Drive SV.</p>
        `,
      }),
    });
    */

    return NextResponse.json({ success: true, message: 'Simulated email sent' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
