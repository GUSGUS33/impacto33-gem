# Correcciones de solicitudes de presupuesto

## Corrección SSR y validación previa (26/10/2026)

Problema confirmado: FromPrice devolvía null en el HTML inicial porque cargaba la configuración únicamente en useEffect. La ruta de producto ahora espera loadPricingData(pricingCategory) y transmite esa configuración serializable mediante ProductPageClient y ProductPage a FromPrice. Este renderiza inmediatamente usando calculateScaledPrice e includedZones existentes. Consumidores sin configuración inicial conservan carga cliente, con protección contra respuestas obsoletas por cambio de categoría. No se modifica pricingService, normalizador, coeficientes, costes, divisor ni la selección de precio de entrada.

Se actualizan los tests SSR para exigir precio personalizado con impresión en el HTML inicial tanto en productos simples como variables, en lugar del antiguo precio bruto de WordPress. El test de encabezados reconoce «Configura tu presupuesto» como H2 del nuevo flujo. Se mantiene la comprobación de H1 único y contenido editorial.

Archivos de esta corrección: app/producto/[slug]/page.tsx, app/producto/[slug]/ProductPageClient.tsx, src/screens/shop/ProductPage.tsx, src/components/pricing/product-quote/FromPrice.tsx, src/lib/productSSR.test.tsx y este informe. Copias previas en calculadora/backup/ssr-precio-2026-10-26/.

Validación ejecutada: npm test (286 correctos, 1 fallo esperado de monotonía, 65 omitidos; cero fallos inesperados), tsc --noEmit --incremental false, next build y npm run build:server, todos finalizados correctamente. El último build generó 186/186 páginas; conserva aviso de credenciales de autenticación ausentes. git diff --check correcto. No se ha probado entrega real de email ni se ha podido completar QA visual móvil por la restricción del navegador. Antes de subir: excluir backups/temporales y revisar selección de archivos. Sin GitHub ni producción.

## Imagen del footer a tamaño original (26/10/2026)

Cambio compartido solicitado: MainLayout.tsx muestra logo-footer.png a 153 × 153 px (dimensiones originales verificadas), en lugar de reducirlo a 36 px. Conserva transparencia y forma circular del archivo. Backup previo en calculadora/backup/footer-imagen-2026-10-26/. Sin cambio de archivo de imagen ni lógica.

## Imagen principal adaptativa en móvil (26/10/2026)

ProductPage.tsx identifica el visor con imagen real. calculator.module.css elimina la proporción cuadrada y los márgenes laterales de 16 px por debajo de 640 px: ancho completo y altura automática, sin recortar ni deformar la foto. Se mantienen esquinas redondeadas y el placeholder sin imagen. Escritorio conserva dimensiones y layout; el zoom hover se desactiva en dispositivos táctiles según mobile-native. Los márgenes que pertenezcan al archivo original no se recortan. Backup: calculadora/backup/imagen-mobile-2026-10-26/. Pendiente comprobación visual en teléfono real por bloqueo del control del navegador.

## Escala amarilla más compacta (26/10/2026)

Se elimina «/ud» de cada precio de tramo en PriceScaleTable.tsx, manteniendo el encabezado de precio por unidad y los mensajes contextuales. Solo presentación. Backup en calculadora/backup/tramos-sin-ud-2026-10-26/.

## Alineación del paso 5 (26/10/2026)

A petición del usuario, los bloques de total y precio unitario se alinean a la derecha en móvil. Se conserva la columna única y la jerarquía visual. Solo CSS; backup previo en calculadora/backup/alineacion-presupuesto-2026-10-26/.

## Revisión móvil de la calculadora (26/10/2026)

Summary.tsx: resumen del pedido separado en color/unidades, tallas y zonas/plazo, evitando una frase larga. Total IVA incluido principal y precio unitario secundario. calculator.module.css: en móvil, total y precio unitario en una columna alineada a la izquierda, márgenes internos reducidos para aprovechar el ancho, cabecera sin competencia entre título y switch, tallas con dos columnas y stock debajo del input, desglose con importes alineados y barra flotante con total y precio unitario en líneas distintas. Feedback táctil y selección de texto desactivada únicamente en botones siguiendo mobile-native. Se conservan inputs de 16 px, controles de 44 px y protección del área segura inferior existentes.

Backup: calculadora/backup/mobile-2026-10-26/. Sin cambios de precios, datos o envío. Verificación: TypeScript correcto y 33 tests pasados, 1 fallo esperado preexistente. Revisión basada en código y captura aportada; el control del navegador está bloqueado por su política de acceso. Pendiente inspección visual del paso 5 y comprobación en teléfono real de teclado, barras del navegador, áreas seguras y tacto. No se declara una auditoría visual completa de toda la ficha ni se ha desplegado.

## Restauración del stock por talla (24/10/2026)

Presentation.tsx ocultaba el stock superior a 50 unidades. Se restaura debajo del input de cada talla: «Stock: N uds» para stock conocido, «Quedan N» para stock bajo, «Agotado» y «En stock» sin número para valores desconocidos o sustitutos como 9999. Se mantienen la fuente de datos, actualización y límites existentes; este cambio no añade consulta ni garantiza una frecuencia nueva de actualización en tiempo real. Backup en calculadora/backup/stock-tallas-2026-10-24/. Tests de etiquetas actualizados en Presentation.test.tsx.

## Fecha de entrega en verde (24/10/2026)

El cambio se activa solo en QuoteRequestModal mediante positiveHighlight; otros consumidores del selector mantienen su presentación anterior.

En el formulario, DeliveryTimeSelector usa verde en el borde, fondo suave, check y etiqueta del plazo seleccionado, sustituyendo el rojo. QuoteTotals destaca la fecha en verde. Sin cambios de fechas, importes o comportamiento. Copias previas en calculadora/backup/fecha-verde-2026-10-24/. Verificación mediante la prueba de integración del formulario.

## Revisión de presentación: total principal con IVA (24/10/2026)

- La ficha muestra como importe principal el total ya calculado con IVA, con la etiqueta «Total IVA incluido». El total sin IVA queda debajo, en tamaño secundario.
- La barra flotante usa ese mismo total con IVA. El precio unitario conserva su importe original sin IVA y ahora lo indica explícitamente.
- El formulario muestra primero el total con IVA en grande y después el desglose. En escritorio se ha movido el bloque al inicio de la columna de resumen; en móvil sigue al principio del formulario.
- No se han cambiado importes, cálculos, payload ni plantillas de email.
- Archivos modificados en esta revisión: Summary.tsx, FloatingSummary.tsx, QuoteTotals.tsx, QuoteRequestModal.tsx, server/quoteCorrections.test.tsx y este informe.
- Backup previo con rutas relativas en calculadora/backup/iva-principal-2026-10-24/.
- Verificación: 33 tests correctos y 1 fallo esperado preexistente en las suites de presentación/integración; TypeScript sin errores. El test comprueba que el importe destacado de la ficha es el total con IVA y que el primer bloque del resumen del popup es ese mismo total, antes del desglose. Se mantiene la comprobación de igualdad con payload y emails. Sin despliegue ni envío real.

Fecha: 24 de octubre de 2026. Solo desarrollo local. Sin GitHub, despliegue ni envío real de emails.

## Resultado por punto

| Punto | Estado | Verificación |
| --- | --- | --- |
| 1. Recargo y totales | Hecho | Calculadora, popup, payload y ambas plantillas consumen el mismo desglose. |
| 2. Datos del pedido | Hecho | SKU, plazo y porcentaje, fecha mostrada, técnica, zonas, color y cantidades por talla. |
| 3. Validación y auditoría | Hecho, con límite explícito | Validación estructural y mínimo recibido; no certificación de precios ni mínimo autoritativo. |
| 4. Formato | Hecho | Se reutiliza formatEuroPrice, es-ES con dos decimales, sin modificar su implementación. |
| 5. Inventario | Hecho | 246 categorías y 1974 productos recorridos por GraphQL. Archivo categorias.csv. |
| 6. Prueba completa | Hecho en integración simulada | Componentes reales en jsdom, router real y plantillas reales; SMTP sustituido por mock. No comprueba entrega real ni conexión HTTP de producción. |

## Qué se ha cambiado y qué no

El cálculo original de recargo, IVA y total que estaba en Summary se ha trasladado literalmente a captureQuoteSnapshot. Se ejecuta en el flujo padre y su resultado se comparte con resumen, popup y envío. No se ha añadido otra fórmula en el servidor ni en los emails. Los selectores reciben el mismo mapa de fechas para evitar discrepancias entre pantallas.

No se ha modificado pricingService, el normalizador, las familias, los coeficientes, los costes de impresión ni el divisor ÷2. Se conservan los números sin redondear hasta su presentación. La comparación con las operaciones originales guardadas en el backup coincide exactamente en 720 combinaciones (familias, bases, cantidades y plazos).

Se mantienen los campos originales de pricing (importes anteriores al recargo) y se añade quoteSnapshot opcional:

- subtotal, surcharge, totalExVat, vat, totalIncVat, unitExVat.
- delivery: option, label, percent, date (YYYY-MM-DD), dateLabel (texto mostrado).
- technique: id, label.

El pedido conserva product.sku, selectedColor, quantities y selectedZones. Las tallas vacías con cantidad cero se omiten al enviar; una cantidad negativa no se oculta y el servidor la rechaza.

Los nuevos envíos del popup incluyen siempre el desglose compartido. Para consumidores antiguos sin quoteSnapshot se conservan los importes originales y no se inventan recargos, fechas ni técnica. Esta compatibilidad no permite recuperar datos que un cliente antiguo no haya enviado.

Las líneas de producto del email se identifican como anteriores al recargo; debajo figura el desglose total completo. Los metadatos se escapan antes de insertarlos en HTML.

## Validación y logs

quote.submit rechaza:
- Cantidades cero, negativas, decimales, NaN o Infinity.
- Pedido vacío, suma de tallas distinta de cantidadTotal o suma fuera del rango entero seguro.
- Cantidad inferior al mínimo recibido o cumpleCantidadMinima falso.
- Importes no numéricos, infinitos, NaN o negativos.

No se comprueba la consistencia aritmética de los importes: es deliberado, porque el recálculo autoritativo está fuera de este lote.

Cada solicitud válida registra un requestId y un payload técnico permitido: ID/SKU, color, tallas, zonas, pricing y quoteSnapshot. No registra nombre, email, teléfono, empresa, mensaje libre ni imagen. Se registra resultado sent/send_failed. Las solicitudes inválidas registran paths y códigos de error, no su contenido arbitrario. Los errores SMTP no vuelcan datos sensibles.

Los logs usan la salida del proceso; no se ha configurado aquí almacenamiento persistente, permisos ni política de retención. Los valores técnicos continúan siendo datos aportados por el cliente, no valores certificados.

## Prueba DRIBE

Fixture reproducible DRIBE, SKU CA6709, precio de entrada 6, familia t_shirts, Negro, talla M, 50 unidades, Frontal, DTF, Urgente +50%. Se usa useProductPricing y el servicio real, no una fórmula alternativa.

| Concepto | Calculadora | Popup | Email empresa | Email cliente |
| --- | ---: | ---: | ---: | ---: |
| Subtotal | 636,53 € | 636,53 € | 636,53 € | 636,53 € |
| Urgente +50% | 318,26 € | 318,26 € | 318,26 € | 318,26 € |
| Total sin IVA | 954,79 € | 954,79 € | 954,79 € | 954,79 € |
| IVA | 200,51 € | 200,51 € | 200,51 € | 200,51 € |
| Total con IVA | 1.155,29 € | 1.155,29 € | 1.155,29 € | 1.155,29 € |

Precio final por unidad sin IVA: 19,10 €. El payload conserva los números originales: subtotal 636.5250000000001, recargo 318.26250000000005, total sin IVA 954.7875000000001, IVA 200.50537499999996 y total con IVA 1155.292875.

El test compara igualdad numérica exacta de los seis importes del payload y su formato en los componentes/plantillas. También cambia Rápido → Urgente dentro del popup y comprueba la actualización. Fecha, SKU, técnica, zonas, color y talla aparecen en ambas plantillas.

Advertencia conservada: sumar los componentes ya redondeados puede dar una diferencia de 0,01 € frente al total redondeado al final. Por ejemplo 636,53 + 318,26 + 200,51 = 1.155,30, frente a 1.155,29. No se cambia la política de cálculo/redondeo en este lote.

Pruebas ejecutadas:
```sh
npx vitest run server/quoteCorrections.test.tsx server/emailService.test.ts src/components/pricing/product-quote src/services/pricingService.test.ts
npx tsc --noEmit --incremental false
```

Resultado: 7 archivos de pruebas correctos, 68 tests pasados y 1 fallo esperado preexistente (monotonía de precios, documentado por la suite). TypeScript sin errores.

La suite incluye un importe centinela para demostrar que servidor/email transmiten el snapshot sin reconstruirlo, compatibilidad con payload antiguo, validación de cantidades/importes, ausencia de datos personales en logs y escape HTML. Nodemailer y el transporte del hook se simulan. No se configura un modo de prueba accesible en producción ni se envía a clientes.

## Inventario de categorías

Fuente de solo lectura: https://creativu.es/graphql. Consulta del 2026-10-24 a las 07:26 UTC. Se paginaron productCategories (hideEmpty:false) y products: 23 peticiones, 246 categorías y 1974 productos. Se comprobó que no quedaban páginas ni categorías de producto truncadas.

Columnas de categorias.csv:
slug, nombre, numero_productos, familia_actual, precio_wordpress_min, precio_wordpress_max, ejemplo_producto.

- Los precios son price(format:RAW) de WordPress, antes de transformaciones de la calculadora. En valores de rango se recogen ambos extremos. Se utiliza punto decimal en CSV.
- El número de productos es el count de cada categoría. Coincide con el recuento de pertenencias de los productos descargados para las 246 categorías.
- Un producto puede pertenecer a varias categorías: no sumar las filas para obtener productos únicos.
- La familia procede del mapeo actual de categoría. No se ha cambiado ninguna asignación.
- 162 slugs no tienen entrada en el mapeo. De ellos, 161 quedan como «sin asignar → General». Excepción: «camisetas», vacía, tiene configuración específica camisetas.json, y se identifica así para no atribuirle incorrectamente General.
- No se puede interpretar la familia por categoría como una reasignación de productos con varias categorías: la selección actual de categoría del producto sigue intacta.
- Dos productos carecen de price: polo-de-mujer-de-manga-corta-100-algodon y mochila-plegable-de-algodon-reciclado-con-asas-largas. Se excluyen del rango, nunca se sustituyen por cero.
- Categorías vacías: precio y ejemplo en blanco. Ninguna categoría no vacía queda sin rango disponible.
- Se ha verificado la estructura de 247 filas (cabecera + 246 categorías) y siete columnas con Artifact Tool. CSV sin formato visual ni workbook adicional.

## Archivos del lote

Modificados (copias previas en calculadora/backup/correcciones-solicitud-2026-10-24/ con la misma ruta):
- src/components/pricing/product-quote/ProductQuoteCalculator.tsx
- src/components/pricing/product-quote/Summary.tsx
- src/components/pricing/product-quote/Delivery.tsx
- src/components/pricing/product-quote/Presentation.test.tsx
- src/components/pricing/QuoteRequestModal.tsx
- src/components/pricing/DeliveryTimeSelector.tsx
- src/components/pricing/ZoneSelector.tsx
- src/services/emailService.ts
- server/emailService.ts
- server/quoteRouter.ts
- vitest.config.ts (alias @shared y exclusión de calculadora/** para no ejecutar copias de tests del backup).

Creados:
- src/lib/quoteSnapshot.ts
- src/components/pricing/QuoteTotals.tsx
- server/quoteCorrections.test.tsx
- calculadora/precios/categorias.csv
- calculadora/precios/CORRECCIONES.md

Había otros cambios locales anteriores. No se han revertido ni incluido en este lote. No se han borrado archivos.

## Pendiente para el nuevo sistema

1. Recálculo autoritativo en servidor y mínimo/tarifa obtenidos de fuente fiable. Hoy un cliente manipulado podría enviar importes o mínimos falsos que sean numéricamente válidos.
2. Resolver monotonía de precios, coherencia de cabecera/tramos, zonas por producto, técnica y costes del proveedor. Sin correcciones en este lote.
3. Decidir la política de redondeo para conciliación al céntimo.
4. Definir almacenamiento y retención de auditoría; los logs actuales no sustituyen una base de pedidos.
5. Validar entrega SMTP real, dominio/remitente y bandejas con una dirección autorizada cuando el usuario la indique. No se ha realizado envío real.
