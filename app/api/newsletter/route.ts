import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email no válido" }, { status: 400 });
    }

    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL || "info@impacto33.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Impacto33";

    const discountCode = "BIENVENIDA10";
    const discountInfo = "10% de descuento en tu primera compra (máximo 10€ de descuento)";

    // Si Brevo API Key está configurada en .env, enviamos a Brevo
    if (apiKey && !apiKey.startsWith("xkeysib-...") && apiKey.trim() !== "") {
      // 1. Añadir/Actualizar contacto en Brevo
      try {
        await fetch("https://api.brevo.com/v3/contacts", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            email,
            updateEnabled: true,
            attributes: {
              DISCOUNT_CODE: discountCode,
            },
          }),
        });
      } catch (err) {
        console.warn("Aviso al guardar contacto en Brevo:", err);
      }

      // 2. Enviar email de bienvenida por Brevo SMTP
      try {
        await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
          },
          body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email }],
            subject: "¡Tu 10% de descuento en Impacto33!",
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #0f172a; margin-bottom: 16px;">¡Bienvenido/a a Impacto33! 🎉</h2>
                <p style="color: #334155; font-size: 16px; line-height: 1.5;">
                  Gracias por suscribirte. Disfruta de un <strong>10% de descuento</strong> en tu primera compra usando tu cupón exclusivo:
                </p>
                <div style="background-color: #f8fafc; border: 2px dashed #2563eb; padding: 20px; text-align: center; margin: 24px 0; border-radius: 8px;">
                  <span style="font-size: 26px; font-weight: bold; color: #2563eb; letter-spacing: 3px;">${discountCode}</span>
                  <p style="font-size: 12px; color: #64748b; margin-top: 10px;">
                    * 10% de descuento en tu primera compra. Descuento máximo aplicable: 10€ (p. ej. en compras de 100€ o más, el descuento es de 10€).
                  </p>
                </div>
                <p style="color: #334155; font-size: 14px;">
                  Si necesitas personalizar ropa laboral, camisetas o artículos promocionales, escríbenos a <a href="mailto:${senderEmail}">${senderEmail}</a> o llámanos al <strong>+34 690 90 60 27</strong>.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">
                  © ${new Date().getFullYear()} Impacto33. Todos los derechos reservados.
                </p>
              </div>
            `,
          }),
        });
      } catch (err) {
        console.error("Error al enviar email en Brevo:", err);
      }
    } else {
      console.log(`[Brevo API Route] Modo preparación sin API Key. Email registrado: ${email}, Cupón: ${discountCode}`);
    }

    return NextResponse.json({
      success: true,
      message: "¡Suscripción realizada con éxito!",
      discountCode,
      discountInfo,
    });
  } catch (error: any) {
    console.error("Error en /api/newsletter:", error);
    return NextResponse.json({ error: "Error procesando suscripción" }, { status: 500 });
  }
}
