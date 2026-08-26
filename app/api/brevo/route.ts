import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { to, subject, htmlContent, sender } = await req.json();

    const apiKey = process.env.BREVO_API_KEY;
    const defaultSenderEmail = process.env.BREVO_SENDER_EMAIL || "info@impacto33.com";
    const defaultSenderName = process.env.BREVO_SENDER_NAME || "Impacto33";

    if (!apiKey || apiKey.startsWith("xkeysib-...") || apiKey.trim() === "") {
      console.log("[Brevo Route] BREVO_API_KEY no está configurada en .env. Simulación de envío exitoso.");
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "API Key de Brevo no configurada. Email procesado en modo simulación.",
      });
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: sender || { name: defaultSenderName, email: defaultSenderEmail },
        to: Array.isArray(to) ? to : [{ email: to }],
        subject,
        htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error desde la API de Brevo:", errorText);
      return NextResponse.json({ error: "Error al enviar correo mediante Brevo", details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error en /api/brevo:", error);
    return NextResponse.json({ error: "Error interno enviando correo" }, { status: 500 });
  }
}
