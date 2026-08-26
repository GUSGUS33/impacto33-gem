/**
 * Servicio de emails de confirmación de pedidos
 * 
 * NOTA: Este servicio está preparado como estructura base.
 * La implementación real del envío de emails se configurará más adelante
 * cuando se integre un servicio de email (Resend, SendGrid, etc.)
 * 
 * Flujo previsto:
 * 1. Al crear un pedido → se llama a sendOrderConfirmationToCustomer()
 * 2. Al crear un pedido → se llama a sendNewOrderNotificationToAdmin()
 * 3. Al verificar transferencia → se llama a sendPaymentConfirmedToCustomer()
 * 4. Al enviar pedido → se llama a sendShippingNotificationToCustomer()
 */

import { siteConfig } from '@/config/siteConfig';

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerType: 'particular' | 'empresa';
  companyName?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  vat: number;
  total: number;
  paymentMethod: 'card' | 'transfer';
  billingAddress: {
    address: string;
    postalCode: string;
    city: string;
    province: string;
  };
  shippingAddress: {
    address: string;
    postalCode: string;
    city: string;
    province: string;
  };
  notes?: string;
}

/**
 * Envía email de confirmación al cliente
 * TODO: Implementar con servicio de email real
 */
export async function sendOrderConfirmationToCustomer(data: OrderEmailData): Promise<boolean> {
  console.log('[Email] Confirmación de pedido al cliente:', {
    to: data.customerEmail,
    orderNumber: data.orderNumber,
    paymentMethod: data.paymentMethod,
  });

  // TODO: Implementar envío real
  // Plantilla diferente según paymentMethod:
  // - 'card': "Tu pedido ha sido confirmado y está siendo procesado"
  // - 'transfer': "Tu pedido ha sido registrado. Completa la transferencia para procesarlo"
  
  return true;
}

/**
 * Envía notificación de nuevo pedido al admin (IMPACTO33)
 * TODO: Implementar con servicio de email real
 */
export async function sendNewOrderNotificationToAdmin(data: OrderEmailData): Promise<boolean> {
  console.log('[Email] Notificación de nuevo pedido al admin:', {
    to: siteConfig.contactEmail,
    orderNumber: data.orderNumber,
    customerName: data.customerName,
    total: data.total,
    paymentMethod: data.paymentMethod,
  });

  // TODO: Implementar envío real
  // Incluir todos los detalles del pedido para el equipo de IMPACTO33
  
  return true;
}

/**
 * Envía confirmación de pago verificado al cliente (para transferencias)
 * TODO: Implementar con servicio de email real
 */
export async function sendPaymentConfirmedToCustomer(
  customerEmail: string,
  orderNumber: string,
  customerName: string
): Promise<boolean> {
  console.log('[Email] Pago verificado al cliente:', {
    to: customerEmail,
    orderNumber,
  });

  // TODO: Implementar envío real
  // "Hemos recibido tu transferencia. Tu pedido está siendo preparado."
  
  return true;
}

/**
 * Envía notificación de envío al cliente
 * TODO: Implementar con servicio de email real
 */
export async function sendShippingNotificationToCustomer(
  customerEmail: string,
  orderNumber: string,
  customerName: string,
  trackingNumber?: string,
  trackingUrl?: string
): Promise<boolean> {
  console.log('[Email] Notificación de envío al cliente:', {
    to: customerEmail,
    orderNumber,
    trackingNumber,
  });

  // TODO: Implementar envío real
  // "Tu pedido ha sido enviado. Número de seguimiento: XXXXX"
  
  return true;
}

/**
 * Genera el HTML del email de confirmación de pedido
 * Se usará como plantilla cuando se configure el servicio de email
 */
export function generateOrderConfirmationHTML(data: OrderEmailData): string {
  const isTransfer = data.paymentMethod === 'transfer';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isTransfer ? 'Pedido Registrado' : 'Pedido Confirmado'} - ${data.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <!-- Header -->
    <tr>
      <td style="background-color:#1e40af;padding:24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">IMPACTO33</h1>
      </td>
    </tr>
    
    <!-- Content -->
    <tr>
      <td style="padding:32px 24px;">
        <h2 style="color:#1e293b;margin:0 0 16px;">
          ${isTransfer ? 'Pedido registrado' : 'Pedido confirmado'}
        </h2>
        <p style="color:#64748b;line-height:1.6;">
          Hola ${data.customerName},<br><br>
          ${isTransfer 
            ? 'Tu pedido ha sido registrado correctamente. Para que lo procesemos, realiza la transferencia bancaria con los datos que te indicamos a continuación.'
            : 'Tu pedido ha sido confirmado y está siendo procesado. Te notificaremos cuando sea enviado.'
          }
        </p>
        
        <!-- Order Number -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;margin:24px 0;">
          <tr>
            <td style="padding:16px;">
              <p style="margin:0;color:#1e40af;font-size:14px;">Número de pedido</p>
              <p style="margin:4px 0 0;color:#1e293b;font-size:20px;font-weight:bold;">${data.orderNumber}</p>
            </td>
          </tr>
        </table>
        
        <!-- Items -->
        <h3 style="color:#1e293b;margin:24px 0 12px;">Productos</h3>
        <table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;">
          <tr style="background-color:#f8fafc;">
            <th style="text-align:left;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;">Producto</th>
            <th style="text-align:center;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;">Cant.</th>
            <th style="text-align:right;color:#64748b;font-size:12px;border-bottom:1px solid #e2e8f0;">Total</th>
          </tr>
          ${data.items.map(item => `
          <tr>
            <td style="color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${item.productName}</td>
            <td style="text-align:center;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">${item.quantity}</td>
            <td style="text-align:right;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${item.totalPrice.toFixed(2)} €</td>
          </tr>
          `).join('')}
        </table>
        
        <!-- Totals -->
        <table width="100%" cellpadding="8" cellspacing="0" style="margin-top:16px;">
          <tr>
            <td style="color:#64748b;font-size:14px;">Subtotal (sin IVA)</td>
            <td style="text-align:right;color:#1e293b;font-size:14px;">${data.subtotal.toFixed(2)} €</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:14px;">IVA (21%)</td>
            <td style="text-align:right;color:#1e293b;font-size:14px;">${data.vat.toFixed(2)} €</td>
          </tr>
          <tr>
            <td style="color:#1e293b;font-size:18px;font-weight:bold;border-top:2px solid #e2e8f0;padding-top:12px;">Total</td>
            <td style="text-align:right;color:#1e40af;font-size:18px;font-weight:bold;border-top:2px solid #e2e8f0;padding-top:12px;">${data.total.toFixed(2)} €</td>
          </tr>
        </table>
        
        ${isTransfer ? `
        <!-- Bank Details -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fefce8;border:1px solid #fde68a;border-radius:8px;margin:24px 0;">
          <tr>
            <td style="padding:20px;">
              <h3 style="color:#92400e;margin:0 0 12px;">Datos para la transferencia</h3>
              <p style="color:#78350f;font-size:14px;line-height:1.8;margin:0;">
                <strong>Beneficiario:</strong> IMPACTO33<br>
                <strong>IBAN:</strong> Pendiente de configurar<br>
                <strong>Concepto:</strong> ${data.orderNumber}
              </p>
            </td>
          </tr>
        </table>
        ` : ''}
      </td>
    </tr>
    
    <!-- Footer -->
    <tr>
      <td style="background-color:#f8fafc;padding:24px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#64748b;font-size:12px;margin:0;">
          ${siteConfig.contactEmail} | ${siteConfig.whatsappNumber}<br>
          ${siteConfig.businessHours}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
