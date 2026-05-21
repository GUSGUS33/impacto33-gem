import nodemailer from 'nodemailer';
import type { QuoteData } from '../src/services/emailService';

interface EmailConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

function getEmailConfig(): EmailConfig {
  const host = process.env.SMTP_HOST || '';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS environment variables.');
  }

  return { host, port, user, pass };
}

export async function sendQuoteEmail(data: QuoteData): Promise<boolean> {
  try {
    const config = getEmailConfig();

    // Crear transporter con configuración de Microsoft 365
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    // Verificar conexión
    await transporter.verify();

    // Construir tabla de cantidades
    const quantitiesTable = Object.entries(data.product.quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([size, qty]) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">Talla ${size}</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: center;">${qty} uds.</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${data.pricing.precioUnitarioFinal.toFixed(2)}€</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; text-align: right;">${(qty * data.pricing.precioUnitarioFinal).toFixed(2)}€</td>
        </tr>
      `)
      .join('');

    // HTML para el cliente
    const customerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .product-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #f3f4f6; padding: 10px; text-align: left; }
          .total { font-size: 1.2em; font-weight: bold; color: #2563eb; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu solicitud!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${data.customer.name}</strong>,</p>
            <p>Hemos recibido tu solicitud de presupuesto correctamente. Te enviaremos el presupuesto detallado en menos de 24 horas.</p>
            
            <div class="product-info">
              <h2 style="margin-top: 0;">Resumen de tu solicitud</h2>
              <p><strong>Producto:</strong> ${data.product.name}</p>
              <p><strong>Color seleccionado:</strong> ${data.product.selectedColor}</p>
              ${data.product.selectedZones.length > 0 ? `<p><strong>Zonas de personalización:</strong> ${data.product.selectedZones.join(', ')}</p>` : ''}
              
              <h3>Desglose por talla</h3>
              <table>
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${quantitiesTable}
                </tbody>
              </table>
              
              <table style="margin-top: 20px;">
                <tr>
                  <td style="padding: 8px;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; text-align: right;">${data.pricing.precioTotalSinIVA.toFixed(2)}€</td>
                </tr>
                <tr>
                  <td style="padding: 8px;"><strong>IVA (21%):</strong></td>
                  <td style="padding: 8px; text-align: right;">${(data.pricing.precioTotalConIVA - data.pricing.precioTotalSinIVA).toFixed(2)}€</td>
                </tr>
                <tr style="background: #f3f4f6;">
                  <td style="padding: 12px;"><strong class="total">TOTAL:</strong></td>
                  <td style="padding: 12px; text-align: right;"><strong class="total">${data.pricing.precioTotalConIVA.toFixed(2)}€</strong></td>
                </tr>
              </table>
            </div>
            
            ${data.customer.message ? `<p><strong>Tu mensaje:</strong><br>${data.customer.message}</p>` : ''}
            
            <p style="margin-top: 20px;">Si tienes alguna duda, no dudes en contactarnos.</p>
            <p><strong>IMPACTO33</strong><br>
            📞 +34690906027<br>
            ✉️ info@impacto33.com</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} IMPACTO33 - Artículos promocionales personalizados</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // HTML para la empresa (más detallado)
    const companyHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; }
          .content { background: #ffffff; padding: 20px; border: 1px solid #e5e7eb; }
          .section { margin: 20px 0; padding: 15px; background: #f9fafb; border-left: 4px solid #2563eb; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #f3f4f6; padding: 10px; text-align: left; border: 1px solid #e5e7eb; }
          td { padding: 8px; border: 1px solid #e5e7eb; }
          .highlight { background: #fef3c7; padding: 10px; border-radius: 4px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Nueva Solicitud de Presupuesto</h1>
            <p style="margin: 0;">Recibida el ${new Date().toLocaleString('es-ES')}</p>
          </div>
          <div class="content">
            <div class="section">
              <h2 style="margin-top: 0;">📋 Datos del Cliente</h2>
              <p><strong>Nombre:</strong> ${data.customer.name}</p>
              <p><strong>Email:</strong> <a href="mailto:${data.customer.email}">${data.customer.email}</a></p>
              ${data.customer.company ? `<p><strong>Empresa:</strong> ${data.customer.company}</p>` : ''}
              ${data.customer.phone ? `<p><strong>Teléfono:</strong> <a href="tel:${data.customer.phone}">${data.customer.phone}</a></p>` : ''}
            </div>
            
            <div class="section">
              <h2 style="margin-top: 0;">🛍️ Detalles del Producto</h2>
              <p><strong>Producto:</strong> ${data.product.name}</p>
              <p><strong>ID:</strong> ${data.product.id}</p>
              <p><strong>Color:</strong> ${data.product.selectedColor}</p>
              ${data.product.selectedZones.length > 0 ? `<p><strong>Zonas personalizadas:</strong> ${data.product.selectedZones.join(', ')}</p>` : ''}
              
              <h3>Cantidades solicitadas</h3>
              <table>
                <thead>
                  <tr>
                    <th>Talla</th>
                    <th style="text-align: center;">Cantidad</th>
                    <th style="text-align: right;">Precio Unit.</th>
                    <th style="text-align: right;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${quantitiesTable}
                  <tr style="background: #f3f4f6; font-weight: bold;">
                    <td colspan="3" style="text-align: right; padding: 12px;">TOTAL (con IVA):</td>
                    <td style="text-align: right; padding: 12px; color: #2563eb; font-size: 1.1em;">${data.pricing.precioTotalConIVA.toFixed(2)}€</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            ${data.customer.message ? `
            <div class="section">
              <h2 style="margin-top: 0;">💬 Mensaje del Cliente</h2>
              <p style="white-space: pre-wrap;">${data.customer.message}</p>
            </div>
            ` : ''}
            
            <div class="highlight">
              <strong>⚡ Acción requerida:</strong> Responder al cliente en menos de 24h con el presupuesto detallado.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email al cliente
    await transporter.sendMail({
      from: `"IMPACTO33" <${config.user}>`,
      to: data.customer.email,
      subject: '✅ Hemos recibido tu solicitud de presupuesto - IMPACTO33',
      html: customerHtml,
    });

    // Enviar copia a la empresa
    await transporter.sendMail({
      from: `"Sistema IMPACTO33" <${config.user}>`,
      to: config.user, // info@impacto33.com
      subject: `🎯 Nueva solicitud: ${data.customer.name} - ${data.product.name}`,
      html: companyHtml,
      replyTo: data.customer.email,
    });

    console.log(`✅ Emails enviados correctamente a ${data.customer.email} y ${config.user}`);
    return true;
  } catch (error) {
    console.error('❌ Error al enviar emails:', error);
    throw error;
  }
}
