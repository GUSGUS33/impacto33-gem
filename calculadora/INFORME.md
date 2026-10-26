# Calculadora de presupuesto — Fase 1

## Regla general: impresión incluida

Aplicada en el consumidor general de fichas: cabecera Desde incluye primera zona admitida con coste numérico configurado; escala inicial también, aun sin cantidades. Con selección usa todas las zonas seleccionadas e indica sus nombres. No se inventa frontal ni coste: si falta configuración válida se oculta el precio promocional/escala. La compatibilidad procede de la configuración actual por familia; sigue pendiente precisión por producto de la API.

La escala reutiliza `calculateScaledPrice` (se retiró su fórmula duplicada, sin modificar el servicio). Cabecera mantiene su significado de precio inicial con una zona; la escala refleja las zonas del pedido. Comprobado DRIBE 25 unidades: frontal 17,80 €/ud; frontal+espalda 19,87 €/ud, con etiqueta actualizada. Cabecera a 1000 con frontal: 3,45 €/ud.

Backup `backup/impresion-incluida/`. Modificados FromPrice, PriceScaleTable, ProductQuoteCalculator; nuevo helper includedZones para selección/validación común. Fórmula, queries, popup y email intactos. Captura `capturas/impresion-incluida.jpg`. Sin GitHub ni producción.

## Ajuste: cinco puntos hasta 1000

Backup `backup/tramos1000/`. Cambiados FromPrice y PriceScaleTable: se filtran umbrales >1000 solo en presentación; se completan los índices deduplicados hasta cinco con tramos existentes. Si una familia tiene menos de cinco tramos reales, no se inventan. La cabecera Desde usa ahora el mayor tramo <=1000.

Origen del tramo retirado: configuración local `src/data/pricing/pricing-families.ts`, familia ropa, 2000→0,89 (también existe en JSON locales). Fórmula vigente `(regularPrice/2 + coste de zonas) × multiplicador`. DRIBE observado corresponde a base 6: sin impresión 3×0,89=2,67; frontal (3+0,45)×0,89=3,0705→3,07 €/ud. A 1000 factor1: 3 sin impresión / 3,45 frontal. No es un precio recién consultado al proveedor ni se ha validado su margen comercial.

No se modifica el motor, configuración de precios, popup ni emails. **Pendiente de decisión:** bloquear cantidades superiores a 1000 requeriría cambiar validación y lógica; este lote limita únicamente escala y cabecera. Sin GitHub ni producción.

## Cierre A — decisiones finales

Backup en `backup/cierreA/`. Sin despliegue. Modificados ProductQuoteCalculator, PriceScaleTable, Delivery, calculator.module.css, useProductPricing y este informe. Nuevo `src/lib/normalizeProductPrice.ts` y prueba asociada. La única excepción de lógica es extraer literalmente la normalización decimal y compartirla entre hook y ambos puntos de entrada de precios del consumidor; fórmulas, queries, popup y email intactos.

| Punto | Estado |
| --- | --- |
| 1 QA | Hecho en navegador local: DRIBE Negro, M, frontal, Estándar; 0/13/40/112 en 1440×1000 y 390×844. Hardware móvil pendiente. |
| 2 Normalización | Hecho el cambio autorizado. Parcial la reproducción exacta 7,29/8,21: DRIBE actual no produce esos importes. Caso aislado antes/después: parseFloat('6,78')=6 frente al normalizador compartido=6,78. No se atribuye el caso histórico a ese error sin sus datos originales. DRIBE ahora: escala y resumen 17,80 €/ud a 13/40 y 8,52 €/ud a 112; total a 112=954,41 €. El total usa precisión interna, no multiplicar el unitario redondeado visible. |
| 3 Escala | Hecho: índices mínimo, anterior, actual, siguiente, último, deduplicados (máximo 5), grid sin scroll. Mensaje usa siguiente real, no siguiente punto mostrado. |
| 4 Plazos | Hecho: Entrega si confirmas hoy. Cálculo de fechas intacto. |
| 5 DTF | Hecho: misma colección de tarjetas para una o varias técnicas; imagen existente, check, nombre/descripcion aprobados. Solo DTF activa. |
| 6 Guía | Pendiente API proveedor, no se enlaza. |

### Evidencias actuales

- Escritorio: [0](capturas/cierreA-desktop-0.jpg), [13](capturas/cierreA-desktop-13.jpg), [40](capturas/cierreA-desktop-40.jpg), [112](capturas/cierreA-desktop-112.jpg).
- Móvil: [0](capturas/cierreA-mobile-0.jpg), [13](capturas/cierreA-mobile-13.jpg), [40](capturas/cierreA-mobile-40.jpg), [112](capturas/cierreA-mobile-112.jpg).

### Pendiente de lógica/backend actualizado

- Guía de tallas y medidas: API del proveedor.
- Precio por técnica, mínimo, zonas admitidas y coste fijo: API del proveedor.
- Zonas compatibles por producto (DRIBE sin mangas).
- Monotonía de precios: pendiente, no se modifica fórmula.
- Cabecera Desde y tramos: misma fuente y condiciones (cabecera sin impresión vs selección personalizada sigue diferente).
- Coherencia calculadora/formulario: verificación independiente pendiente; popup intacto.

### Decisión Lote B registrada, no implementada

El tramo se decide por el total de unidades de todos los colores. Precio unificado: todos pagan el mismo precio de tramo, sin influencia del color. Esta decisión sustituye la duda anterior sobre precios por variación. Multicolor y BI4137 quedan fuera de este cierre.

## Revisión 3 — Lote A en curso y plan B (sin implementar)

Backup `backup/revision3/`. Cambios locales en PriceScaleTable, Summary, ProductQuoteCalculator, FloatingSummary, CSS; nuevo ScalePlacement. No se han cambiado fórmulas ni popup/email. TypeScript y 17 pruebas pasan (1 fallo de precio esperado).

A1 parcial: escala trasladada mediante portal al paso 2, importes del resumen reutilizados en encabezado, todos los umbrales existentes visibles mediante scroll horizontal, mensaje único. Falta revisión visual final del marcador y estado sin unidades. A2: resumen incluye tallas y cantidades; tramos fuera del paso 5. A3: checks solo 1/2. A4: observa pasos 4/5. A5 parcial: spin buttons ocultos y controles táctiles; pendiente verificar tilde con producto concreto y contraste/cascada final. A6 bloqueado por catálogo: solo DTF tiene isActive=true; no existe producto real con dos técnicas activas en este flujo. No se activaron técnicas ficticias para obtener captura.

Prioridad máxima: discrepancia 7,29 vs 8,21 pendiente de reproducción exacta. `useProductPricing` normaliza la coma decimal; la tabla recibía `parseFloat(product.price)` desde Summary, que puede truncarla. El multiplicador es constante dentro del tramo: la cantidad 112 vs 100 NO explica por sí sola la discrepancia. La etiqueta anterior «Tu precio» sobre el umbral no era fiable; ahora el encabezado usa el precio real del resumen. No se cambia el parseo en este lote de presentación. La tabla ya no limita a cuatro umbrales, aunque cabecera sin impresión y escala personalizada mantienen condiciones distintas.

### Plan LOTE B — requiere aprobación, no programado

1. Añadir modelo versionado `colorRows: Array<{color: string, quantities: Record<string, number>}>` y selección de fila activa. Conservar el formato antiguo para lectura/migración de sesiones monocolor. No renombrar claves existentes; añadir versión y filas de forma compatible.
2. Separar editar color activo de borrar cantidades. Añadir otro color crea/activa fila; Editar recupera tallas; Quitar elimina solo esa fila con confirmación. Stock se valida por variación de cada fila.
3. Agregar unidades de todas las filas para mínimo y tramo. Reutilizar servicio existente, sin sumar mínimos por color. Antes de implementar, decidir precio base cuando las variaciones tengan precios distintos; no asumir que todos cuestan igual.
4. Popup: añadir prop opcional colorRows con sus variaciones identificadas y cantidades. Si no existe, adaptar selectedColor + quantities a una sola fila. Mantener compatibilidad de consumidores antiguos. Renderizar filas y resumen global; no mezclar unidades del mismo tamaño de colores distintos.
5. Payload/email: añadir colorRows al contrato de solicitud y validar en servidor. Plantilla enumera color, talla, cantidad por fila y total global; mantener campos antiguos para solicitudes monocolor. Actualizar destinatario/proveedor sin alterar su configuración. Definir persistencia y rollback de versión antes de conectar.
6. Tests: cambio de color conserva cantidades, edición/eliminación, mínimo global, stock por variante, migración de sesión, coherencia popup/email y regresión monocolor. Solo tras estas pruebas retirar aviso de multicolor pendiente.

Pendiente de cerrar Lote A: QA visual y capturas de esta revisión; no confundir las capturas anteriores con evidencia del lote actual.

## Ronda 3 — ajustes adicionales A/B/C (24 octubre 2026)

Esta sección sustituye la presentación anterior de secciones sin tarjetas. Solo local, sin GitHub ni producción. Originales en `backup/ronda3-adicional/`.

| Punto | Estado | Resultado |
| --- | --- | --- |
| A · Dos niveles | Hecho | Panel #EEF4FE, radio 16 y padding 16; pasos blancos, borde #DCE6F5, radio 12, padding 20, separación 12, sin sombra. Cabecera fuera de tarjetas. |
| A · Interior ligero | Hecho | Celdas sin borde; azul solo con cantidad. Mínimo sin caja. Zonas/plazos y tramos conservan sus presentaciones; total blanco con separador. |
| A · Bloqueado/completado | Hecho | Tarjeta completa opacity .45 e inert. Check verde en color elegido, cantidad que alcanza mínimo, personalización válida y plazo disponible. Paso 5 conserva su número: es revisión/solicitud, no se marca como enviado. |
| B · Texto | Hecho | Una línea de zonas; progreso X de N bajo la barra o Mínimo alcanzado (N uds). Eliminada repetición del total de unidades. |
| C · Condiciones/importe | Hecho | Un único componente escritorio/móvil; >0 unidades, oculto al intersectar paso 5 o abrir modal. Bajo mínimo sin importe. Sobre mínimo usa los dos importes que ya tiene Summary, sin duplicar fórmulas. aria-live polite. |
| C · Acción | Hecho | Ver presupuesto solo hace scroll al paso 5; respeta reduced-motion. No abre formulario. |
| C · Colocación | Hecho | Escritorio alineado y dimensionado al panel, fixed a 16px, radio 12 y sombra suave. Móvil ancho completo/safe area; reemplaza navegación solo mientras aparece. ResizeObserver mide altura y reserva margen inferior; inputs con scroll-margin-bottom. |
| C · Hardware móvil | Parcial | Verificado a 390×844 sin desbordamiento; teclado, safe-area y tacto requieren teléfono real. |

### Archivos

- Modificados: `src/components/pricing/product-quote/{ProductQuoteCalculator.tsx,Presentation.tsx,Summary.tsx,calculator.module.css}` y `calculadora/INFORME.md`.
- Nuevos: `src/components/pricing/product-quote/FloatingSummary.tsx` y `FloatingSummary.test.tsx`.
- Sin cambios a funciones de cálculo, queries, campos, nombres existentes, popup ni emails. Nuevos estados/props son exclusivamente del observador visual; no alteran la configuración del presupuesto.

### Pendiente de lógica/backend — prioridad alta (casos adicionales comunicados)

- Cabecera 2,67 €/ud en 2000+ uds frente a tabla que termina en 250+ uds (7,12 €/ud en el caso comunicado): unificar fuente y rango de tramos. No corregido aquí.
- Caso comunicado 40 uds = 794,64 € frente a 50 × 14,21 ≈710 €: monotonía de precio pendiente, sin modificar fórmulas.
- DRIBE de tirantes sigue ofreciendo mangas: compatibilidad por producto pendiente.
- Se mantienen pendientes anteriores: coherencia formulario/calculadora, galería por color y restauración, guía real de tallas, origen real de fechas y precios por técnica.

### Capturas y pruebas

DRIBE, Negro, talla M; sin solicitudes enviadas. En escritorio y móvil se verifican 0, 13 y 25 unidades. Se verificó que Ver presupuesto oculta la barra al llegar al paso 5. Skill mobile-native aplicada a safe-area, controles y respeto de movimiento reducido; falta prueba en hardware real.

- [Escritorio: 0](capturas/r3-desktop-cero.jpg), [13](capturas/r3-desktop-bajo.jpg), [25](capturas/r3-desktop-minimo.jpg).
- [Móvil: 0](capturas/r3-mobile-cero.jpg), [13](capturas/r3-mobile-bajo.jpg), [25](capturas/r3-mobile-minimo.jpg).

## Ronda de claridad — estado actual (sustituye descripciones visuales históricas)

Implementación local, sin commit, push ni despliegue. Copias previas de los archivos modificados en `backup/ronda-claridad/`, conservando rutas relativas. No se han modificado fórmulas, servicios de precios, queries, campos, claves de almacenamiento, nombres existentes ni el popup/envío. Los componentes nuevos de presentación tienen sus propias props; Summary recibe el plazo ya existente para mostrar el recap.

### Checklist del lote

| Punto | Estado y detalle |
| --- | --- |
| Cabecera desde/tramo | Parcial: usa el mayor umbral existente y `calculateScaledPrice`, sin modificarlo. DRIBE muestra 2,67 €/ud + IVA en 2000+ uds, **sin impresión**. Se explicita esta condición porque la tabla usa zonas seleccionadas y muestra los primeros cuatro tramos. El anterior precio venía de `salePrice/price/regularPrice`, no del tramo. Unificar condiciones comerciales sigue pendiente. |
| Mínimo | Hecho: total/unidad atenuados y etiqueta Pedido mínimo N uds; no se habilita solicitar por debajo del mínimo. |
| Imágenes rotas | Hecho: icono neutro + nombre, incluyendo fallos previos a hidratación. No llega hex utilizable al selector. |
| Miniaturas de galería por color | Pendiente: no hay agrupación de galería por variación en los datos consumidos. No se modifica esa lógica. Restaurar una configuración tampoco sincroniza la imagen principal; pendiente adicional. |
| Tildes/plazos | Hecho: Estándar, Rápido y Urgente. |
| Ayuda multicolor y tallas | Hecho: textos aprobados bajo cada bloque. |
| Guía de tallas | Pendiente/oculta: no se ha identificado tabla de medidas ni ancla real en la ficha; no se inventa enlace. |
| Técnica DTF | Hecho: línea compacta y descripción aprobada; no se añaden técnicas ni precios. |
| Ayuda zonas | Hecho: frontal por defecto cuando está seleccionado, y aviso de actualización. |
| Texto bajo CTA | Hecho: texto aprobado, sin modificar formulario. |
| Tarjetas de plazo | Hecho: nombre, fecha en una línea y porcentaje existente; verde seleccionado y etiqueta urgente roja. |
| Nota del plazo | Parcial: texto aprobado aplicado; el cálculo existente parte de hoy, no de la aprobación real del diseño. No se ha alterado. |
| Recap | Hecho: color, cantidad, zonas y plazo antes del total, independiente del desglose. |
| Total blanco y tramos crema | Hecho: separador fino, total/botón destacados; tramos visibles, en dos columnas en móvil estrecho para evitar solapamientos. |
| Pictogramas zonas | Hecho: prenda genérica y zona diferenciada, sin medidas ni representación de área real. |
| Barra mínimo | Hecho: azul/verde, fondo gris y texto X de N uds mínimas. |
| Stock por talla | Hecho: solo agotado o Quedan N cuando <=50; sin cifras de sustitución ni +500. |
| Desglose/recuperación | Hecho: interruptor a la derecha; recuperación en línea pequeña debajo. |
| Jerarquía/menos cajas | Hecho: títulos consistentes, ayudas con contraste, sin nuevas tarjetas ni animaciones. |
| Galería sticky | Hecho en escritorio desde 1024px, solo wrapper local de ProductPage; sin ensanchar calculadora ni cambiar galería compartida. |
| Futuro diseñador | Hecho: sin botón visible ni elementos fijos adicionales junto al CTA. Integración documentada abajo. |
| Capturas DRIBE | Hecho: escritorio 1440×1000 y móvil 390×844; sin desbordamiento horizontal (390/390). |
| Capturas BI4137 | Pendiente: búsqueda local devuelve 0 resultados y no aparece en datos del repositorio. Necesitamos URL real; no se ha sustituido por un producto inventado. |

### Pendiente de lógica/backend — prioridad alta

- Corregir monotonía de importes (44 uds frente a 50), fuera de este lote.
- Alinear cabecera y tabla en cantidad, impresión y condiciones; la cabecera actual identifica explícitamente precio sin impresión, no equivale al pedido personalizado.
- Zonas compatibles por producto: DRIBE sigue recibiendo mangas pese a ser de tirantes.
- Verificar/coherenciar importe calculadora y formulario con la misma configuración; popup intacto en esta ronda, sin envío de prueba.
- API de técnica: precio por zona, mínimo, coste fijo/pantalla y zonas admitidas. Pasar la técnica elegida al servicio en el punto donde el flujo actual calcula con `selectedZones`; ahora no participa en cálculo. Se conserva `OptionalPrice` para mostrar solo datos reales positivos cuando lleguen.
- Fechas relativas a aprobación del diseño: hoy no existe una fecha real de aprobación en este flujo.
- Galería por color/restauración y tabla de medidas: necesitan datos/enlace de origen, no heurísticas.

### Personalizador futuro

Entrada en paso 3 tras elegir técnica/zonas, con segunda acción junto a Solicitar presupuesto. Recibir producto, color, tallas/cantidades, técnica, zonas y plazo usando la configuración existente. Definir posteriormente retorno del diseño y persistencia; no se implementa ni anuncia ahora.

### Archivos de esta ronda

- Nuevo: `src/components/pricing/product-quote/FromPrice.tsx` (adaptador visual que reutiliza servicio existente).
- Modificados: `ProductQuoteCalculator.tsx`, `Presentation.tsx`, `Summary.tsx`, `Delivery.tsx`, `calculator.module.css`, `Presentation.test.tsx` dentro de `src/components/pricing/product-quote/`.
- Modificados: `src/screens/shop/ProductPage.tsx` y este informe.
- Capturas: `capturas/dribe-desktop.jpg`, `capturas/dribe-mobile.jpg`, `capturas/dribe-mobile-resumen.jpg`, `capturas/bi4137-no-encontrado.jpg`.

### Validación y visualización

TypeScript, ESLint de archivos afectados y pruebas aisladas de presentación; se excluye `calculadora/**` de Vitest para no ejecutar backups. La prueba de monotonía permanece como fallo esperado, no como corrección realizada. Revisión móvil mediante viewport emulado; no sustituye prueba en teléfono real (skill mobile-native).

Local: `npm run dev -- --port 3300`, ficha `http://127.0.0.1:3300/producto/dribe` (servidor local ya activo durante la revisión).

![DRIBE escritorio](capturas/dribe-desktop.jpg)
![DRIBE móvil](capturas/dribe-mobile.jpg)
![DRIBE plazos móvil](capturas/dribe-mobile-resumen.jpg)

## Revisión UX compacta aprobada

Técnica única en línea; varias técnicas en tarjetas horizontales. Título de color con selección/estado disponible, orden visual natural de tallas (sin mutar los datos), fallback de imagen rota con nombre, iconos esquemáticos diferenciados F/E/←/→ (no representan áreas reales), recuperación en línea, secciones con separador fino y resumen destacado conservando tramos compactos. Backups en `backup/ux-compacto/`.

**Excepción de alcance aprobada:** CSS condicionado a la existencia de `.mobileBar` en la ficha oculta la navegación inferior general solo al ancho donde la barra está visible (hasta 640 px). Al desaparecer la barra, abrir el popup o salir de la ficha, vuelve la navegación. No se modifica el componente compartido ni su estado. Barra al pie con safe-area.

### Pendiente de lógica/backend — prioridad ALTA

- Zonas por producto: DRIBE es de tirantes y actualmente recibe zonas de mangas. Resolver compatibilidad en datos/cálculo, no filtrarla arbitrariamente en UI.
- Monotonía: caso comunicado 44 uds = 783,29 €, frente a 50 × 12,73 €/ud ≈ 636 €. Pedir más puede costar menos. Corregir la función/tramos en lote separado.
- «Desde 6,00 €» frente al tramo mostrado de 6,38 €/ud: unificar fuente y condiciones del precio de cabecera. La tabla muestra solo cuatro tramos; revisar también los posteriores y la personalización antes de definir el precio desde.

No se cambia ninguna fórmula en este lote.

## Ajuste aprobado: técnica en tarjeta

La técnica única se presenta ahora como tarjeta seleccionable, con imagen DTF reutilizada del selector anterior, nombre, descripción y check. Se mantiene `availablePrintingMethods` y su selección: no se activan técnicas inactivas ni se añaden precios. Este ajuste sustituye el criterio previo de técnica única compacta. Backup previo en `backup/antes-tarjeta-tecnica/`.

## Ajuste posterior: selector de colores

Miniaturas ampliadas de 30 a 64 px, tarjetas repartidas por toda la anchura, nombres a 14 px y stock a 12 px. Dos columnas en móvil; columnas automáticas de al menos 140 px en escritorio. Solo CSS, sin cambios de selección ni cálculo. Copias previas en `backup/src/components/pricing/product-quote/calculator.module.css` y `backup/INFORME-antes-colores.md`.

Fecha: 23/10/2026. Implementación exclusivamente local; sin commit, push ni despliegue.

## Archivos

Modificado: `src/screens/shop/ProductPage.tsx` (solo importación del consumidor aislado y key por producto).

Copia previa: `calculadora/backup/src/screens/shop/ProductPage.tsx`.

Creados en `src/components/pricing/product-quote/`:

- `ProductQuoteCalculator.tsx`: integración aislada con los hooks actuales, flujo de cinco pasos y popup existente.
- `Presentation.tsx`: pasos, stock, cantidades y ranura opcional de precio.
- `Delivery.tsx`: presentación aislada de plazos, con configuración y utilidades existentes.
- `Summary.tsx`: resumen B2B, desglose opcional y barra móvil.
- `PriceScaleTable.tsx`: nueva presentación de los tramos; conserva su cálculo anterior.
- `calculator.module.css`: estilos limitados a esta calculadora.
- `Presentation.test.tsx`, `Flow.test.tsx`, `monotonicity.test.ts`: pruebas.

Este informe es nuevo. Los documentos de referencia no se importan desde código ni se incluyen en las rutas de compilación de TypeScript. No se han borrado archivos. Los cambios previos ajenos a esta tarea se han conservado.

## Datos y comportamiento reutilizados

Colores, imágenes de variación, tallas y stock proceden del producto existente. `useProductPricing` mantiene selección, cantidades, límites de stock, zonas y cálculo. Se reutilizan `useProductConfig`, `useRestoredProductConfig`, las mismas claves de persistencia, `pricingService`, el catálogo actual de métodos y las utilidades de días laborables.

Importante: actualmente mínimos, zonas y escalados se resuelven mediante los JSON/configuraciones de `src/data/pricing`, no mediante una nueva API del proveedor. Los plazos proceden de `shared/config/delivery-times.json`. No se han sustituido por los números del mockup.

## Excepciones autorizadas

1. No se restaura `deliveryOption`: al montar cada producto, `selectedDeliveryOption` comienza en `sin_prisa` y el recargo en 0. La key por producto evita arrastrar estado entre fichas. Se mantienen la restauración de color, cantidades y zonas y la selección posterior del plazo.
2. Tras restaurar la configuración, si no hay color seleccionado y solo existe uno disponible para comprar, se invoca el `selectColor` existente y el callback existente de galería.
3. Antes de cambiar de color con cantidades, se pide confirmación. Cancelar no llama a `selectColor`; aceptar lo llama tal cual. No se ha modificado su implementación.

Los nuevos estados de desglose, aviso e input son de presentación. No se han renombrado estados, props, tipos, campos o claves existentes. Los tipos locales nuevos son de presentación, no amplían el modelo de producto/API.

## Criterios de aceptación — sección 11

- [x] Ficha multicolor sin configuración previa: paso 1 activo, 2–5 visibles y atenuados. Una configuración guardada sigue restaurando color/cantidades por compatibilidad.
- [x] Un solo color disponible: preselección con la función existente (prueba automatizada).
- [x] Talla única: un input con la misma delegación de stock/mínimo (prueba automatizada).
- [x] Cantidades delegadas al limitador existente; aviso al exceder stock. Los sustitutos desconocidos no se anuncian como unidades reales.
- [ ] Multicolor: Fase 2; la confirmación evita pérdidas accidentales en Fase 1.
- [ ] Mínimo y zonas por técnica: faltan datos y conexión al cálculo.
- [ ] Técnica única compacta implementada; tarjetas múltiples preparadas. Precio por técnica pendiente: no se inventa ni muestra 0 €.
- [x] Estándar inicial, selección verde; no se restaura urgente (prueba automatizada).
- [ ] Desglose apagado por defecto, controla zonas/resumen. Importes de cada alternativa de plazo pendientes: no los devuelve el cálculo actual. El recargo seleccionado sí se muestra en el resumen.
- [x] Funciones de cálculo, queries, nombres y campos existentes sin modificaciones; excepciones anteriores documentadas.
- [x] Lista de pendientes incluida abajo.
- [x] CTA bloqueado bajo mínimo con unidades restantes.
- [x] CTA abre el popup existente con sus props actuales; comprobado en DRIBE, sin enviar solicitud.
- [x] No se añade botón «Enviar por email» a la calculadora. El envío del popup no se modifica.
- [x] Móvil: tallas verticales, steppers y barra fija con unidades/total/CTA; comprobado a 390×844. Se sitúa sobre la navegación móvil, sin modificarla.
- [x] Calculadora sin emojis; etiquetas de opciones legibles. El popup conserva sus textos/emojis originales por restricción expresa.
- [ ] Botones, labels, aria-pressed, switch, foco y bloqueo por fieldset/inert implementados. Pendiente auditoría exhaustiva AA/lector de pantalla y teléfono físico; no se declara certificación de accesibilidad.

## Pendiente de lógica/backend

1. **Monotonía y subtotal:** la fórmula existente puede reducir el total al cruzar tramos. `monotonicity.test.ts` recorre todos los umbrales de ambos JSON y todas las familias actuales, con y sin zonas, usando un precio de prueba. Está marcado `it.fails`: es una regresión conocida esperada, NO una garantía de monotonía. Tras corregir el cálculo, convertirlo en `it`. No se ha arreglado ni ocultado la fórmula.
2. **Datos por técnica del proveedor:** identificador estable de técnica; precio por unidad y zona (moneda y base fiscal); mínimo de unidades; coste fijo/pantalla por zona, incluido cuándo se aplica; zonas admitidas y su correspondencia con IDs actuales. También hace falta un total calculado para cada alternativa si se quieren comparar tarjetas/consejos. `OptionalPrice` acepta un importe real opcional y omite undefined/null/0/no finitos; actualmente no recibe importes de técnica. Las zonas usan únicamente `coste_personalizacion` existente y solo con desglose.
3. **Paso de técnica al cálculo:** hoy `selectedPrintingMethod` vive en el flujo y llega al modal, pero no pasa por `useProductPricing` → `usePriceCalculation`. Allí se llama a `calculateScaledPrice` sin técnica y se usa el valor DTF por defecto. Esa cadena deberá recibir la selección y resolver precios/mínimos/zonas del proveedor. No se ha cambiado esa interfaz en esta fase.
4. **Multicolor:** modelo de filas con cantidades por color, agregación, edición/eliminación y paso completo al formulario.
5. **Ahorro:** cálculo comparativo fiable por técnica/tramo, reparto de unidades con stock y botón «Subir a N uds».
6. **Zonas:** no llegan `printTemplates`, áreas ni medidas. Se usa pictograma genérico de zona; no se inventan rectángulos, vistas ni tamaños. Restricciones por técnica y zona predeterminada específica requieren datos.
7. **Desglose monetario completo:** separar prenda, impresión y pantallas sin recalcularlos en UI; importes de plazos alternativos. Se mantiene el subtotal que entrega el cálculo.
8. **PDF, WhatsApp y logo:** exportación PDF, mensaje con configuración y subida de archivo dentro de calculadora no implementados. No se reutiliza un enlace WhatsApp genérico como si contuviese el presupuesto.
9. **Popup/envío:** se conservan los datos que ya admite. Normalización de etiquetas dentro del popup, multicolor, adjuntos, PDF y ampliación de datos enviados requerirían una tarea separada. No se ha probado envío real.
10. **Stock:** falta umbral configurable de «Pocas uds» por color. Los valores desconocidos se presentan como «En stock», conservando el límite técnico del hook.
11. **Cabecera Desde:** se conserva el precio existente de la ficha; no se añade una afirmación de cantidad/condiciones junto al precio sin un dato inequívoco del cálculo.
12. **Tramos:** se conservan los cuatro primeros que ya mostraba el componente previo. No se etiqueta el último como «Tu precio» cuando la cantidad pertenece a un tramo posterior no mostrado. Ampliar el catálogo visible de tramos queda fuera del diseño de cuatro columnas actual.

## Verificación

- TypeScript: `npx tsc --noEmit --incremental false`.
- ESLint dirigido a la nueva carpeta y `src/screens/shop/ProductPage.tsx`.
- Pruebas: `npx vitest run src/components/pricing/product-quote`: 14 correctas y 1 fallo esperado documentado de monotonía.
- `git diff --check` sin errores.
- Navegador local DRIBE: selección, cantidades, desbloqueo, plazo estándar, desglose y apertura del popup. Revisión visual escritorio 1440×1000 y móvil 390×844.
- Confirmación cancelar/aceptar y color único: pruebas automatizadas con dependencias controladas. El diálogo nativo no pudo completarse de forma fiable mediante automatización del navegador; conviene probarlo manualmente.
- No se ejecutó build de producción ni se desplegó. La compilación de desarrollo y TypeScript no sustituyen una validación posterior del build.
- Aplicación de la skill mobile-native: inputs de 16 px para evitar zoom, botones de 44 px, hover condicionado a ratón y safe-area en la barra. Falta probar teclado virtual, notch y tacto en teléfono real.

## Ver en local

El servidor ya está en `http://127.0.0.1:3300`. Si está detenido:

```sh
npx next dev --hostname 127.0.0.1 --port 3300
```

Ficha: http://127.0.0.1:3300/producto/dribe#configurar-producto

Probar color Negro, 1 unidad (CTA bloqueado), 25 unidades (CTA activo), desglose, cambio de color/cancelación y plazo urgente seguido de recarga (debe volver a Estándar). No enviar el formulario durante la revisión de UI.

## Aislamiento y reversión

`ProductPricingFlow`, `DeliveryTimeSelector`, `QuoteRequestModal`, hooks, servicios, GraphQL y backend originales no se han editado. Las fórmulas de resumen y tabla que ya estaban en presentación se mantienen en las versiones aisladas, sin aplicar la fórmula del mockup. Galería, descripción, FAQ y relacionados no se han tocado.

Para volver a la calculadora anterior basta restaurar `src/screens/shop/ProductPage.tsx` desde su backup, previa revisión de cualquier cambio posterior del usuario. No es necesario borrar los componentes nuevos.
