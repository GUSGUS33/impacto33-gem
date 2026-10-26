# Auditoría de precios de la calculadora de Impacto33

Fecha: 24 de octubre de 2026. Alcance: código local de la ficha de producto, no una certificación de lo desplegado en LIVE. Repositorio: `/Users/guscarol/Documents/impacto33-b2b-ecommerce`. HEAD: `6c41395652bd97635fe34b8468c43054ce8e8ef9`, con cambios locales previos. Todas las rutas de código siguientes son relativas a esa raíz.

Solo se han creado este informe y `calculadora/precios/simulaciones.csv`. No se han cambiado cálculos, configuración, componentes, datos del catálogo, servicios ni emails. No se ha enviado ningún presupuesto ni desplegado nada.

## 1. Resumen para negocio

Hoy el sistema toma el precio del producto de WordPress, lo divide por dos, suma unos importes fijos por las zonas impresas y multiplica esa suma por un coeficiente según la cantidad y la familia asignada. Ese precio se aplica a **todas** las unidades del pedido. Después añade el recargo del plazo, si lo hay, y el 21 % de IVA.

Los costes de impresión no llegan de la API del proveedor: están escritos en el proyecto. Tampoco existe todavía una tarifa distinta real para cada técnica. La división por dos es una regla del código, no una comprobación del coste de compra.

Hallazgos principales:

- **El email pierde el recargo Rápido/Urgente**, aunque el popup sí lo muestra.
- **SU1074 utiliza General, no ropa**, porque `sudaderas-con-capucha` no está en el mapa de familias.
- **Los precios en rango se normalizan mal**: CA6660 entra como 5,747 € y SU1074 como 26,7828 €, mezclando los extremos del rango.
- **Pedir más puede costar menos en total**: 48 caídas consecutivas detectadas entre el mínimo y 2.000, para cuatro productos y dos configuraciones de zonas.
- Los importes unitarios se muestran con dos decimales, pero se multiplican con todos los decimales internos.
- La cabecera actual ya incluye una zona y utiliza el tramo hasta 1.000. El motor sigue teniendo un tramo de 2.000 y permite calcularlo.
- El servidor recibe los precios calculados por el cliente y **no los recalcula ni contrasta con el catálogo**.

## 2. Método y alcance de las simulaciones

Se consultó en solo lectura `https://creativu.es/graphql`, endpoint de respaldo de `src/lib/productSSR.ts`, mediante `products(where: {sku: "..."} )` para cada referencia; la bolsa se obtuvo con `products(where: {category: "bags"})`. Son datos observados durante esta auditoría, no datos inventados ni precios inferidos de capturas. No se han consultado costes privados de compra del proveedor ni la configuración fiscal interna de WooCommerce.

Se importaron y ejecutaron con Node + tsx las funciones reales:

- `resolveProductPricingCategory`
- `normalizeProductPrice`
- `loadPricingData`
- `calculateScaledPrice`

Para el recargo se ejecutó literalmente, en memoria, el bloque de declaraciones de `Summary.tsx` comprendido entre `const deliverySurcharge =` y `const cta =`. No se transcribió ni reimplementó la fórmula. Los porcentajes se leyeron de `shared/config/delivery-times.json`.

Se generaron **104 filas**: 4 productos × (12 cantidades únicas × 2 zonas + 2 filas Urgente a 50). El mínimo ya pertenece a la lista solicitada en los cuatro productos, por eso no se repite. Cada configuración tiene una fila urgente. Los precios inferiores al mínimo son resultados del motor, **no presupuestos que la UI deba permitir solicitar**. Se señalan con `cumple_minimo=false`.

Además se recorrieron todas las cantidades enteras consecutivas desde el mínimo hasta 2.000 para cada producto y configuración: así se detectan también los saltos 499→500 y 1999→2000, ausentes de la lista principal.

Estas pruebas no ejercitan envíos reales, stock suficiente, disponibilidad de tallas, aceptación del proveedor o renderizado del navegador. La familia aplicada y los importes proceden del mismo recorrido de datos que consume la ficha. El CSV no contiene fórmulas alternativas: es una instantánea de resultados.

### 2.1 Datos de entrada observados

| SKU | Producto / slug | price de GraphQL (literal) | regularPrice | salePrice | Categoría elegida | Familia efectiva | Entrada numérica | Mínimo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CA6709 | DRIBE / `dribe` | `6,00&nbsp;€` | `6,00&nbsp;€` | null | `t_shirts` | ropa | 6 | 25 |
| CA6660 | Camiseta de manga corta tubular con acabado vigoré y cuello redondo / `camiseta-de-manga-corta-tubular-con-acabado-vigore-y-cuello-redondo` | `5,74&nbsp;€ - 7,01&nbsp;€` | `5,74&nbsp;€ - 7,01&nbsp;€` | null | `camisetas-manga-corta` | ropa | 5.747 | 25 |
| SU1074 | Sudadera con Capucha Unisex de Algodón Orgánico y Poliester Reciclado / `sudadera-con-capucha-unisex-de-algodon-organico-y-poliester-reciclado` | `26,78&nbsp;€ - 28,88&nbsp;€` | `26,78&nbsp;€ - 28,88&nbsp;€` | null | `sudaderas-con-capucha` | otros (fallback General) | 26.7828 | 10 |
| BO1977 | KABIL / `kabil` | `2,20&nbsp;€` | `2,20&nbsp;€` | null | `sub_bags` | accesorios | 2.2 | 50 |

Categorías originales, conservando el orden de WordPress:

- CA6709: `t_shirts`, `cam_po`
- CA6660: `camisetas-manga-corta`
- SU1074: `sudaderas-con-capucha`
- BO1977: `sub_bags`, `bags`, `bags_travel`

KABIL (BO1977) es la bolsa elegida. CA6660 y SU1074 son productos con rango de precios. No se ha reemplazado su entrada defectuosa por el extremo inferior correcto, porque la auditoría debe reproducir lo que hace el código actual.

## 3. Fuentes de datos y prioridades

### 3.1 Precio base y campos de WordPress

| Uso | Fuente / prioridad real | Archivo |
| --- | --- | --- |
| Consulta SSR | `product.price`, `regularPrice`, `salePrice`; también precios de variaciones | `src/lib/productSSR.ts`, `GET_FULL_PRODUCT_QUERY`, `fetchProductForSSR` |
| Consulta cliente cuando no hay producto SSR | Mismos campos mediante Apollo; con `initialProduct` se omite la consulta | `src/lib/queries.ts`, `src/screens/shop/ProductPage.tsx` |
| Calculadora activa | **Solo `product.price`** → `normalizeProductPrice`; si falta, 0. No hace fallback a regularPrice/salePrice | `src/components/pricing/product-quote/ProductQuoteCalculator.tsx` |
| Cálculo agregado | El parámetro se llama `regularPrice`, pero recibe el `basePrice` anterior derivado de `product.price` | `src/hooks/useProductPricing.ts`, `src/hooks/usePriceCalculation.ts` |
| Precio de cada variación | Se normaliza `variation.price` y se guarda en `sizeOptions.price`, fallback a basePrice | `src/hooks/useProductPricing.ts` |
| Uso de ese precio por talla/color | **No se usa para el cálculo agregado**; el hook recibe sizeOptions, pero no lo utiliza en la fórmula | `src/hooks/usePriceCalculation.ts` |
| Cabecera Desde actual | También `product.price`, normalización inline equivalente | `src/screens/shop/ProductPage.tsx`, `product-quote/FromPrice.tsx` |
| Datos estructurados Offer | `salePrice || price || regularPrice`; si ninguno existe, primera variación con precio en ese mismo orden; `extractFirstPrice` | `app/producto/[slug]/page.tsx`, `src/lib/productSSR.ts`, `src/lib/seo.ts` |

**¿Coste o venta?** Se lee el campo público de precio del catálogo WooCommerce; no un campo de coste de proveedor ni un campo ACF de compra. Su semántica habitual es precio comercial del producto, pero el código no permite certificar cómo lo carga el importador ni si el origen está configurado con IVA. El nombre `regularPrice` de la función no cambia esa procedencia. El comentario «Precio base real» del servicio tampoco prueba que dividirlo por dos dé el coste real.

No hay una prioridad explícita salePrice → regularPrice en la calculadora activa. Si WooCommerce devuelve una oferta dentro de `price`, entrará esa oferta por ese campo, no porque el frontend seleccione `salePrice`.

### 3.2 Selección de familia

`src/lib/productPricingCategory.ts` toma los slugs en el orden recibido y selecciona **el primero presente en CATEGORY_TO_FAMILY_MAPPING**. Si no hay ninguno, usa el primer slug; sin categorías, `default`. No selecciona automáticamente la categoría más específica ni utiliza el nombre comercial del producto.

`src/services/pricingService.ts::loadPricingData`:

1. Caché en memoria por categoría.
2. Normaliza categoría a minúsculas y sustituye espacios por guiones.
3. Intenta JSON `src/data/pricing/<categoría>.json`.
4. Si no existe, categoría mapeada → `PRICING_FAMILIES`.
5. Categoría no mapeada → `src/data/pricing/_default.json`.

Solo existen dos JSON tarifarios en esa carpeta: `camisetas.json` y `_default.json`. El resto de familias están en TypeScript. La caché no tiene TTL ni versión de tarifa.

### 3.3 Otros datos

| Dato | Fuente exacta | Observación |
| --- | --- | --- |
| Cantidades | `quantities` en `src/hooks/useProductPricing.ts` | Suma de tallas; el color no cambia el precio base |
| Tramos / multiplicadores | `src/data/pricing/pricing-families.ts::PRICING_FAMILIES[*].factores_escalado`; JSON específicos | No proceden de GraphQL |
| Coste por zona | `coste_personalizacion[zona]` de la misma configuración | Importe por unidad **antes** de coeficiente y recargo |
| Zonas permitidas activas | `zonas_permitidas` de esa configuración | Sin validación física por producto |
| Técnicas | `src/data/pricing/printing-methods.ts`, `category-allowed-methods.ts` | Solo DTF globalmente activo |
| Configuración alternativa por técnica | `src/data/pricing/family-printing-config.ts::minQtyByMethod` | No gobierna el mínimo usado por calculateScaledPrice |
| Overrides de zonas | `src/data/pricing/category-allowed-zones.ts` | La calculadora activa pinta pricingData.zonas_permitidas directamente |
| Pedido mínimo activo | `pricingData.cantidad_minima` | No campo de producto/ACF consultado |
| Entrega | `shared/config/delivery-times.json::categories.default` | Solo hay configuración default |
| Fecha | `shared/utils/businessDays.ts::addBusinessDays`, `formatDeliveryDate` | Hoy + días hábiles, sábados/domingos/festivos |
| IVA | Literal `1.21` en servicio, Summary y popup | No depende de país, cliente o clase fiscal de Woo |
| Formato calculadora | `src/services/pricingService.ts::formatEuroPrice` | EUR, es-ES, dos decimales |
| Formato popup/email | `.toFixed(2)` | Punto decimal; puede diferir un céntimo del Intl |
| Persistencia | `src/services/productConfigService.ts`, `useProductConfig.ts`, `useRestoredProductConfig.ts` | Guarda selección, no cotización con versión; 7 días, localStorage `product_config_<slug>` |

No se han encontrado en este recorrido tarifas de proveedor, coste fijo por pantalla, coste por número de colores, portes reales, descuentos por cliente, promociones adicionales, dimensiones de impresión o mínimos específicos ACF. No se añade una partida de transporte: el recargo es por plazo y se aplica sobre todo el subtotal.

## 4. Fórmula exacta y recorrido

Sea P la entrada normalizada de `product.price`, Q la suma de cantidades, Z la suma de costes de zonas, C el coeficiente y R el porcentaje de entrega.

1. `useProductPricing` suma las cantidades de todas las tallas.
2. `usePriceCalculation` carga la tarifa por categoría; con Q=0 devuelve null, no un presupuesto.
3. `calculateScaledPrice` obtiene base interna **P / 2**.
4. Suma `coste_personalizacion[zona] || 0` para cada zona seleccionada.
5. `getEscaladoMultiplier` selecciona el umbral más alto ≤ Q. Si Q está por debajo del primer umbral, aplica igualmente el primero.
6. Precio unitario sin recargo = **(P / 2 + Z) × C**.
7. Total sin IVA y sin recargo = **unitario × Q**.
8. Total con IVA del motor = **total × 1,21**.
9. `Summary` calcula recargo = total sin IVA × R / 100.
10. Total sin IVA mostrado = subtotal + recargo.
11. Total con IVA mostrado = anterior × 1,21.
12. Unitario mostrado = unitario del motor × (1 + R / 100).
13. El formato visual se aplica al final; no se redondea antes de multiplicar.

Equivalencia explicativa, no una implementación nueva:

```text
Total sin IVA = Q × (P/2 + suma de zonas) × coeficiente(Q) × (1 + recargo/100)
Total con IVA = Total sin IVA × 1,21
```

El coeficiente multiplica **producto e impresión**. Por ejemplo, espalda ropa cuesta 0,40 € en configuración, pero su impacto a 25 uds es 0,40 × 5,16 = 2,064 €/ud antes de entrega/IVA. No es un extra comercial fijo de 0,40 €/ud.

### 4.1 Redondeo

No hay redondeo monetario de los números internos, ni por unidad ni por total. Son `number` de JavaScript (coma flotante binaria). La pantalla redondea cada valor independientemente.

Ejemplo DRIBE, Frontal, 50 Estándar:

- P=6; base interna=3; impresión=0,45; C=3,69.
- Unitario interno=12,7305 €; mostrado=12,73 €.
- Total interno=636,525 €; Intl muestra 636,53 €.
- Multiplicar el unitario mostrado: 12,73 × 50 = 636,50 €: diferencia de 0,03 €.
- IVA se calcula sobre el subtotal interno, no sobre el subtotal ya redondeado.
- Las líneas por talla del popup/email se redondean separadamente y su suma puede no coincidir al céntimo con el total agregado.

No confundir estas diferencias de céntimos con las caídas de cientos de euros por tramo o con el recargo perdido.

### 4.2 Técnica y zonas

`usePriceCalculation` llama al servicio sin pasar la técnica seleccionada; se usa el argumento predeterminado DTF. Incluso si se llama al servicio con una técnica inactiva, solo emite aviso: no incorpora otra fórmula ni rechaza la cotización.

La UI de ficha añade la primera zona válida si hay color y unidades y ninguna zona seleccionada. `includedZones.ts` hace que cabecera/escala tengan al menos una zona válida de referencia. Esta es una protección de UI, **no una garantía del servicio**: este acepta cero zonas, zonas desconocidas (coste 0) o duplicadas (las suma dos veces).

En `ProductQuoteCalculator.tsx`, «Ver desglose» puede mostrar el coste crudo de zona mediante `OptionalPrice`, sin coeficiente ni plazo. Esa etiqueta /ud puede confundirse con el precio incremental real.

### 4.3 Popup y email

Recorrido:
`ProductQuoteCalculator` → `QuoteRequestModal` → `src/contexts/QuoteContext.tsx::submitQuote` → `trpc.quote.submit` → `server/quoteRouter.ts` → `server/emailService.ts::sendQuoteEmail`.

- El popup recibe `priceCalculation` sin recargo y aparte `deliverySurchargePercent`.
- En sus totales visuales añade el recargo y el IVA, por lo que conceptualmente coincide con Summary.
- En el submit envía **pricing: priceCalculation**, sin ajustar.
- No transmite plazo, porcentaje de recargo, fecha ni técnica. Envía `sku: ''`.
- El email empresarial y el de cliente usan esos importes originales. No recalculan entrega ni tarifas.
- `src/services/emailService.ts` contiene el tipo QuoteData y una función obsoleta que lanza error si se llama; no es la ruta activa.
- La ruta activa usa SMTP/Nodemailer, no una automatización Brevo en este recorrido.
- `server/quoteRouter.ts` valida tipos, pero no recalcula ni exige cantidades positivas/enteras, coherencia suma-total, mínimo verdadero, precio de catálogo o tarifa vigente.

Ejemplos exactos de pérdida de recargo (totales con IVA, redondeados solo para lectura):

| SKU | Zonas | 50 Urgente en calculadora | Email sin recargo | Diferencia |
| --- | --- | --- | --- | --- |
| CA6709 | frontal | 1155,29 | 770,20 | 385,10 |
| CA6709 | frontal+espalda | 1289,24 | 859,49 | 429,75 |
| CA6660 | frontal | 1112,93 | 741,95 | 370,98 |
| CA6660 | frontal+espalda | 1246,88 | 831,25 | 415,63 |
| SU1074 | frontal | 3744,11 | 2496,08 | 1248,04 |
| SU1074 | frontal+espalda | 3865,40 | 2576,93 | 1288,47 |
| BO1977 | frontal | 694,24 | 462,83 | 231,41 |
| BO1977 | frontal+espalda | 898,43 | 598,95 | 299,48 |

La auditoría verifica el payload y las plantillas, no ha enviado emails reales.

## 5. Tablas de configuración completas

### 5.1 Todas las familias y multiplicadores

Datos literales de `src/data/pricing/pricing-families.ts`. «—» significa que no existe ese umbral, no multiplicador cero. Entre umbrales sigue activo el inferior.

| Familia | Mínimo | 10 | 20 | 25 | 50 | 100 | 250 | 500 | 1000 | 2000 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ropa | 25 | — | — | 5.16 | 3.69 | 2.47 | 1.85 | 1.32 | 1 | 0.89 |
| accesorios | 50 | — | — | — | 4.5 | 3 | 2 | 1.5 | 1 | 0.9 |
| hogar | 20 | — | 6 | — | 4 | 2.5 | 1.8 | 1.4 | 1 | 0.9 |
| papeleria | 100 | — | — | — | — | 5 | 3.5 | 2.5 | 1.5 | 1 |
| otros | 10 | 5.16 | — | 3.69 | 2.97 | 2.13 | 1.67 | 1.32 | 1 | 0.89 |

No hay tablas independientes de camisetas, sudaderas, bolsas, tazas o bidones cuando se resuelven a familia: camisetas y sudaderas mapeadas comparten ropa; bolsas accesorios; tazas/botellas/bidones mapeados hogar. **La pertenencia depende del slug exacto**: SU1074 demuestra que el nombre «sudadera» no basta.

### 5.2 JSON específicos con prioridad

| Archivo | Mínimo | Tramos exactos |
| --- | --- | --- |
| src/data/pricing/camisetas.json | 25 | 10:6.45 · 25:5.16 · 50:3.69 · 100:2.47 · 250:1.85 · 500:1.32 · 1000:1.0 · 2000:0.89 |
| src/data/pricing/_default.json | 10 | 10:5.16 · 25:3.69 · 50:2.97 · 100:2.13 · 250:1.67 · 500:1.32 · 1000:1.0 · 2000:0.89 |

`camisetas.json` tiene un tramo 10 aunque exige 25 de mínimo, y no es la tabla que reciben DRIBE (`t_shirts`) o CA6660 (`camisetas-manga-corta`). `_default.json` repite numéricamente otros y cambia su nombre a General.

### 5.3 Costes de impresión por unidad antes de multiplicador

| Familia / JSON | frontal | espalda | manga_izquierda | manga_derecha | frente |
| --- | --- | --- | --- | --- | --- |
| ropa | 0.45 | 0.4 | 0.5 | 0.5 | — |
| accesorios | 0.6 | 0.5 | — | — | — |
| hogar | 0.3 | — | — | — | — |
| papeleria | — | — | — | — | 0.2 |
| otros | 0.5 | 0.45 | 0.5 | 0.5 | — |
| camisetas.json | 0.45 | 0.4 | 0.5 | 0.5 | — |
| _default.json | 0.5 | 0.45 | 0.5 | 0.5 | — |

Unidades: EUR/ud, sin IVA en el cálculo. Las notas de los archivos dicen «IVA incluido», pero el servicio y las etiquetas finales los tratan como importes previos al 21 %: documentación interna contradictoria que requiere confirmar el origen fiscal.

No existen tarifas diferentes de zona por técnica en los datos activos:

| Técnica | Activa globalmente | Coste real definido |
| --- | --- | --- |
| DTF | Sí | Tabla anterior de zonas × coeficiente |
| SERIGRAFIA_1_COLOR | No | Sin fórmula específica ni coste de pantalla |
| BORDADO | No | Sin tarifa específica |
| DTF_UV | No | Sin tarifa específica |
| TAMPO_1_COLOR | No | Sin tarifa específica |
| SIN_IMPRESION | No | Sin fórmula propia; el servicio solo ve zonas |

### 5.4 Mínimos alternativos por técnica (no aplicados por el motor activo)

Fuente: `src/data/pricing/family-printing-config.ts`.

| Familia | Técnicas y mínimo configurado | activeInUI |
| --- | --- | --- |
| ropa | DTF 25; SERIGRAFIA_1_COLOR 50; BORDADO 25 | DTF |
| accesorios | DTF 50; SERIGRAFIA_1_COLOR 100; BORDADO 50 | DTF |
| hogar | DTF_UV 20; TAMPO_1_COLOR 100 | vacío |
| papeleria | DTF_UV 100; TAMPO_1_COLOR 250 | vacío |
| otros | DTF 10 | DTF |

Contradicción: `category-allowed-methods.ts` permite DTF para mugs/bottles/ball_pens y `getAvailablePrintingMethods` lo filtra por activación global, mientras la configuración familiar de rígidos deja activeInUI vacío. Hoy el recorrido activo no está gobernado por esa tabla familiar de técnicas.

### 5.5 Plazos, recargos y fechas

| ID | Texto UI | Días hábiles | Recargo subtotal | Descripción de configuración |
| --- | --- | --- | --- | --- |
| sin_prisa | Estándar | 14 | 0 % | 14 días hábiles |
| normal | Rápido | 10 | 20 % | 7 / 10 días hábiles |
| urgente | Urgente | 7 | 50 % | 5 / 7 días hábiles |

Todos los productos usan default. Al entrar en ficha, Estándar y recargo 0; no se restaura el plazo guardado. El selector usa la fecha del navegador, no una fecha confirmada por el proveedor, no una hora de corte ni la aprobación real del arte. No depende de Q o Z.

Festivos literales: 2026-01-01, 2026-01-06, 2026-04-03, 2026-04-06, 2026-05-01, 2026-08-15, 2026-10-12, 2026-11-01, 2026-12-06, 2026-12-08, 2026-12-25.

`addBusinessDays` empieza a contar al día siguiente, omite sábado/domingo y compara la fecha ISO con esa lista. No traslada festivos de domingo a lunes, no incluye festivos autonómicos/locales ni años futuros. Mezcla día local e ISO UTC, con riesgo cerca de medianoche. Las fechas memorizadas no se actualizan solas al pasar medianoche.

Ejecutando la utilidad real con 24/10/2026 a las 12:00 de Madrid: Estándar jueves 12/11; Rápido viernes 06/11; Urgente martes 03/11. Son resultados de esa lista, no confirmaciones logísticas.

La UI nueva dice «Entrega si confirmas hoy», mientras el JSON conserva «Todos los plazos son estimados» y el selector compartido del popup conserva su propia presentación.

## 6. Simulaciones

CSV en `calculadora/precios/simulaciones.csv`, UTF-8, separador coma, punto decimal, campos entre comillas. Importarlo indicando ese separador y decimal si Excel utiliza configuración española. Se preservan números internos de JavaScript, incluidas sus colas binarias; no multiplicar el unitario redondeado para reconstruir el total.

Columnas adicionales de auditoría: SKU, mínimo, cumple mínimo, base interna P/2, unitario sin recargo y total con IVA que recibe actualmente el email. «coste_impresion_ud_antes_coeficiente_eur» es Z, no Z×C. Las columnas principales de unitario y total incluyen el plazo de la fila. `sin_prisa` significa Estándar.

A continuación se reproducen las 104 filas con importes redondeados a dos decimales para lectura. **[no]** indica que no cumple mínimo. P se conserva con hasta cuatro decimales para mostrar el defecto de normalización.

### CA6709 — DRIBE

| Familia | Q | Zonas | Plazo | P € | C | Impresión Z € | €/ud sin IVA | Total sin IVA € | Con IVA € | Mínimo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ropa | 10 | frontal | Estándar | 6 | 5.16 | 0,45 | 17,80 | 178,02 | 215,40 | **[no]** |
| ropa | 24 | frontal | Estándar | 6 | 5.16 | 0,45 | 17,80 | 427,25 | 516,97 | **[no]** |
| ropa | 25 | frontal | Estándar | 6 | 5.16 | 0,45 | 17,80 | 445,05 | 538,51 | sí |
| ropa | 49 | frontal | Estándar | 6 | 5.16 | 0,45 | 17,80 | 872,30 | 1055,48 | sí |
| ropa | 50 | frontal | Estándar | 6 | 3.69 | 0,45 | 12,73 | 636,53 | 770,20 | sí |
| ropa | 99 | frontal | Estándar | 6 | 3.69 | 0,45 | 12,73 | 1260,32 | 1524,99 | sí |
| ropa | 100 | frontal | Estándar | 6 | 2.47 | 0,45 | 8,52 | 852,15 | 1031,10 | sí |
| ropa | 249 | frontal | Estándar | 6 | 2.47 | 0,45 | 8,52 | 2121,85 | 2567,44 | sí |
| ropa | 250 | frontal | Estándar | 6 | 1.85 | 0,45 | 6,38 | 1595,63 | 1930,71 | sí |
| ropa | 999 | frontal | Estándar | 6 | 1.32 | 0,45 | 4,55 | 4549,45 | 5504,83 | sí |
| ropa | 1000 | frontal | Estándar | 6 | 1 | 0,45 | 3,45 | 3450,00 | 4174,50 | sí |
| ropa | 2000 | frontal | Estándar | 6 | 0.89 | 0,45 | 3,07 | 6141,00 | 7430,61 | sí |
| ropa | 50 | frontal | Urgente | 6 | 3.69 | 0,45 | 19,10 | 954,79 | 1155,29 | sí |
| ropa | 10 | frontal+espalda | Estándar | 6 | 5.16 | 0,85 | 19,87 | 198,66 | 240,38 | **[no]** |
| ropa | 24 | frontal+espalda | Estándar | 6 | 5.16 | 0,85 | 19,87 | 476,78 | 576,91 | **[no]** |
| ropa | 25 | frontal+espalda | Estándar | 6 | 5.16 | 0,85 | 19,87 | 496,65 | 600,95 | sí |
| ropa | 49 | frontal+espalda | Estándar | 6 | 5.16 | 0,85 | 19,87 | 973,43 | 1177,86 | sí |
| ropa | 50 | frontal+espalda | Estándar | 6 | 3.69 | 0,85 | 14,21 | 710,33 | 859,49 | sí |
| ropa | 99 | frontal+espalda | Estándar | 6 | 3.69 | 0,85 | 14,21 | 1406,44 | 1701,80 | sí |
| ropa | 100 | frontal+espalda | Estándar | 6 | 2.47 | 0,85 | 9,51 | 950,95 | 1150,65 | sí |
| ropa | 249 | frontal+espalda | Estándar | 6 | 2.47 | 0,85 | 9,51 | 2367,87 | 2865,12 | sí |
| ropa | 250 | frontal+espalda | Estándar | 6 | 1.85 | 0,85 | 7,12 | 1780,63 | 2154,56 | sí |
| ropa | 999 | frontal+espalda | Estándar | 6 | 1.32 | 0,85 | 5,08 | 5076,92 | 6143,07 | sí |
| ropa | 1000 | frontal+espalda | Estándar | 6 | 1 | 0,85 | 3,85 | 3850,00 | 4658,50 | sí |
| ropa | 2000 | frontal+espalda | Estándar | 6 | 0.89 | 0,85 | 3,43 | 6853,00 | 8292,13 | sí |
| ropa | 50 | frontal+espalda | Urgente | 6 | 3.69 | 0,85 | 21,31 | 1065,49 | 1289,24 | sí |

### CA6660 — Camiseta de manga corta tubular con acabado vigoré y cuello redondo

| Familia | Q | Zonas | Plazo | P € | C | Impresión Z € | €/ud sin IVA | Total sin IVA € | Con IVA € | Mínimo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ropa | 10 | frontal | Estándar | 5.747 | 5.16 | 0,45 | 17,15 | 171,49 | 207,51 | **[no]** |
| ropa | 24 | frontal | Estándar | 5.747 | 5.16 | 0,45 | 17,15 | 411,58 | 498,01 | **[no]** |
| ropa | 25 | frontal | Estándar | 5.747 | 5.16 | 0,45 | 17,15 | 428,73 | 518,77 | sí |
| ropa | 49 | frontal | Estándar | 5.747 | 5.16 | 0,45 | 17,15 | 840,31 | 1016,78 | sí |
| ropa | 50 | frontal | Estándar | 5.747 | 3.69 | 0,45 | 12,26 | 613,19 | 741,95 | sí |
| ropa | 99 | frontal | Estándar | 5.747 | 3.69 | 0,45 | 12,26 | 1214,11 | 1469,07 | sí |
| ropa | 100 | frontal | Estándar | 5.747 | 2.47 | 0,45 | 8,21 | 820,90 | 993,29 | sí |
| ropa | 249 | frontal | Estándar | 5.747 | 2.47 | 0,45 | 8,21 | 2044,05 | 2473,30 | sí |
| ropa | 250 | frontal | Estándar | 5.747 | 1.85 | 0,45 | 6,15 | 1537,12 | 1859,91 | sí |
| ropa | 999 | frontal | Estándar | 5.747 | 1.32 | 0,45 | 4,39 | 4382,63 | 5302,99 | sí |
| ropa | 1000 | frontal | Estándar | 5.747 | 1 | 0,45 | 3,32 | 3323,50 | 4021,44 | sí |
| ropa | 2000 | frontal | Estándar | 5.747 | 0.89 | 0,45 | 2,96 | 5915,83 | 7158,15 | sí |
| ropa | 50 | frontal | Urgente | 5.747 | 3.69 | 0,45 | 18,40 | 919,78 | 1112,93 | sí |
| ropa | 10 | frontal+espalda | Estándar | 5.747 | 5.16 | 0,85 | 19,21 | 192,13 | 232,48 | **[no]** |
| ropa | 24 | frontal+espalda | Estándar | 5.747 | 5.16 | 0,85 | 19,21 | 461,12 | 557,95 | **[no]** |
| ropa | 25 | frontal+espalda | Estándar | 5.747 | 5.16 | 0,85 | 19,21 | 480,33 | 581,20 | sí |
| ropa | 49 | frontal+espalda | Estándar | 5.747 | 5.16 | 0,85 | 19,21 | 941,45 | 1139,15 | sí |
| ropa | 50 | frontal+espalda | Estándar | 5.747 | 3.69 | 0,85 | 13,74 | 686,99 | 831,25 | sí |
| ropa | 99 | frontal+espalda | Estándar | 5.747 | 3.69 | 0,85 | 13,74 | 1360,23 | 1645,88 | sí |
| ropa | 100 | frontal+espalda | Estándar | 5.747 | 2.47 | 0,85 | 9,20 | 919,70 | 1112,84 | sí |
| ropa | 249 | frontal+espalda | Estándar | 5.747 | 2.47 | 0,85 | 9,20 | 2290,06 | 2770,98 | sí |
| ropa | 250 | frontal+espalda | Estándar | 5.747 | 1.85 | 0,85 | 6,89 | 1722,12 | 2083,76 | sí |
| ropa | 999 | frontal+espalda | Estándar | 5.747 | 1.32 | 0,85 | 4,92 | 4910,10 | 5941,23 | sí |
| ropa | 1000 | frontal+espalda | Estándar | 5.747 | 1 | 0,85 | 3,72 | 3723,50 | 4505,43 | sí |
| ropa | 2000 | frontal+espalda | Estándar | 5.747 | 0.89 | 0,85 | 3,31 | 6627,83 | 8019,67 | sí |
| ropa | 50 | frontal+espalda | Urgente | 5.747 | 3.69 | 0,85 | 20,61 | 1030,48 | 1246,88 | sí |

### SU1074 — Sudadera con Capucha Unisex de Algodón Orgánico y Poliester Reciclado

| Familia | Q | Zonas | Plazo | P € | C | Impresión Z € | €/ud sin IVA | Total sin IVA € | Con IVA € | Mínimo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| otros (General) | 10 | frontal | Estándar | 26.7828 | 5.16 | 0,50 | 71,68 | 716,80 | 867,32 | sí |
| otros (General) | 24 | frontal | Estándar | 26.7828 | 5.16 | 0,50 | 71,68 | 1720,31 | 2081,58 | sí |
| otros (General) | 25 | frontal | Estándar | 26.7828 | 3.69 | 0,50 | 51,26 | 1281,48 | 1550,59 | sí |
| otros (General) | 49 | frontal | Estándar | 26.7828 | 3.69 | 0,50 | 51,26 | 2511,70 | 3039,16 | sí |
| otros (General) | 50 | frontal | Estándar | 26.7828 | 2.97 | 0,50 | 41,26 | 2062,87 | 2496,08 | sí |
| otros (General) | 99 | frontal | Estándar | 26.7828 | 2.97 | 0,50 | 41,26 | 4084,49 | 4942,23 | sí |
| otros (General) | 100 | frontal | Estándar | 26.7828 | 2.13 | 0,50 | 29,59 | 2958,87 | 3580,23 | sí |
| otros (General) | 249 | frontal | Estándar | 26.7828 | 2.13 | 0,50 | 29,59 | 7367,58 | 8914,77 | sí |
| otros (General) | 250 | frontal | Estándar | 26.7828 | 1.67 | 0,50 | 23,20 | 5799,66 | 7017,59 | sí |
| otros (General) | 999 | frontal | Estándar | 26.7828 | 1.32 | 0,50 | 18,34 | 18.318,31 | 22.165,16 | sí |
| otros (General) | 1000 | frontal | Estándar | 26.7828 | 1 | 0,50 | 13,89 | 13.891,40 | 16.808,59 | sí |
| otros (General) | 2000 | frontal | Estándar | 26.7828 | 0.89 | 0,50 | 12,36 | 24.726,69 | 29.919,30 | sí |
| otros (General) | 50 | frontal | Urgente | 26.7828 | 2.97 | 0,50 | 61,89 | 3094,31 | 3744,11 | sí |
| otros (General) | 10 | frontal+espalda | Estándar | 26.7828 | 5.16 | 0,95 | 74,00 | 740,02 | 895,42 | sí |
| otros (General) | 24 | frontal+espalda | Estándar | 26.7828 | 5.16 | 0,95 | 74,00 | 1776,04 | 2149,01 | sí |
| otros (General) | 25 | frontal+espalda | Estándar | 26.7828 | 3.69 | 0,95 | 52,92 | 1322,99 | 1600,82 | sí |
| otros (General) | 49 | frontal+espalda | Estándar | 26.7828 | 3.69 | 0,95 | 52,92 | 2593,07 | 3137,61 | sí |
| otros (General) | 50 | frontal+espalda | Estándar | 26.7828 | 2.97 | 0,95 | 42,59 | 2129,70 | 2576,93 | sí |
| otros (General) | 99 | frontal+espalda | Estándar | 26.7828 | 2.97 | 0,95 | 42,59 | 4216,80 | 5102,33 | sí |
| otros (General) | 100 | frontal+espalda | Estándar | 26.7828 | 2.13 | 0,95 | 30,55 | 3054,72 | 3696,21 | sí |
| otros (General) | 249 | frontal+espalda | Estándar | 26.7828 | 2.13 | 0,95 | 30,55 | 7606,25 | 9203,56 | sí |
| otros (General) | 250 | frontal+espalda | Estándar | 26.7828 | 1.67 | 0,95 | 23,95 | 5987,53 | 7244,92 | sí |
| otros (General) | 999 | frontal+espalda | Estándar | 26.7828 | 1.32 | 0,95 | 18,93 | 18.911,72 | 22.883,18 | sí |
| otros (General) | 1000 | frontal+espalda | Estándar | 26.7828 | 1 | 0,95 | 14,34 | 14.341,40 | 17.353,09 | sí |
| otros (General) | 2000 | frontal+espalda | Estándar | 26.7828 | 0.89 | 0,95 | 12,76 | 25.527,69 | 30.888,51 | sí |
| otros (General) | 50 | frontal+espalda | Urgente | 26.7828 | 2.97 | 0,95 | 63,89 | 3194,55 | 3865,40 | sí |

### BO1977 — KABIL

| Familia | Q | Zonas | Plazo | P € | C | Impresión Z € | €/ud sin IVA | Total sin IVA € | Con IVA € | Mínimo |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| accesorios | 10 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 76,50 | 92,57 | **[no]** |
| accesorios | 24 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 183,60 | 222,16 | **[no]** |
| accesorios | 25 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 191,25 | 231,41 | **[no]** |
| accesorios | 49 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 374,85 | 453,57 | **[no]** |
| accesorios | 50 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 382,50 | 462,83 | sí |
| accesorios | 99 | frontal | Estándar | 2.2 | 4.5 | 0,60 | 7,65 | 757,35 | 916,39 | sí |
| accesorios | 100 | frontal | Estándar | 2.2 | 3 | 0,60 | 5,10 | 510,00 | 617,10 | sí |
| accesorios | 249 | frontal | Estándar | 2.2 | 3 | 0,60 | 5,10 | 1269,90 | 1536,58 | sí |
| accesorios | 250 | frontal | Estándar | 2.2 | 2 | 0,60 | 3,40 | 850,00 | 1028,50 | sí |
| accesorios | 999 | frontal | Estándar | 2.2 | 1.5 | 0,60 | 2,55 | 2547,45 | 3082,41 | sí |
| accesorios | 1000 | frontal | Estándar | 2.2 | 1 | 0,60 | 1,70 | 1700,00 | 2057,00 | sí |
| accesorios | 2000 | frontal | Estándar | 2.2 | 0.9 | 0,60 | 1,53 | 3060,00 | 3702,60 | sí |
| accesorios | 50 | frontal | Urgente | 2.2 | 4.5 | 0,60 | 11,48 | 573,75 | 694,24 | sí |
| accesorios | 10 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 99,00 | 119,79 | **[no]** |
| accesorios | 24 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 237,60 | 287,50 | **[no]** |
| accesorios | 25 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 247,50 | 299,47 | **[no]** |
| accesorios | 49 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 485,10 | 586,97 | **[no]** |
| accesorios | 50 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 495,00 | 598,95 | sí |
| accesorios | 99 | frontal+espalda | Estándar | 2.2 | 4.5 | 1,10 | 9,90 | 980,10 | 1185,92 | sí |
| accesorios | 100 | frontal+espalda | Estándar | 2.2 | 3 | 1,10 | 6,60 | 660,00 | 798,60 | sí |
| accesorios | 249 | frontal+espalda | Estándar | 2.2 | 3 | 1,10 | 6,60 | 1643,40 | 1988,51 | sí |
| accesorios | 250 | frontal+espalda | Estándar | 2.2 | 2 | 1,10 | 4,40 | 1100,00 | 1331,00 | sí |
| accesorios | 999 | frontal+espalda | Estándar | 2.2 | 1.5 | 1,10 | 3,30 | 3296,70 | 3989,01 | sí |
| accesorios | 1000 | frontal+espalda | Estándar | 2.2 | 1 | 1,10 | 2,20 | 2200,00 | 2662,00 | sí |
| accesorios | 2000 | frontal+espalda | Estándar | 2.2 | 0.9 | 1,10 | 1,98 | 3960,00 | 4791,60 | sí |
| accesorios | 50 | frontal+espalda | Urgente | 2.2 | 4.5 | 1,10 | 14,85 | 742,50 | 898,43 | sí |

## 7. Anomalías detalladas

### 7.1 Saltos de total

Se detectan 48 saltos consecutivos en cantidades válidas. Importes **sin IVA, Estándar**, por producto/zona. La diferencia es el ahorro total al pedir una unidad más, no un descuento por unidad. Las diferencias se calculan antes del redondeo, por eso la resta de cifras ya redondeadas puede diferir 0,01 €.

| SKU | Zonas | Cantidad anterior | Total anterior € | Cantidad nueva | Total nuevo € | Bajada € |
| --- | --- | --- | --- | --- | --- | --- |
| CA6709 | frontal | 49 | 872,30 | 50 | 636,53 | 235,77 |
| CA6709 | frontal | 99 | 1260,32 | 100 | 852,15 | 408,17 |
| CA6709 | frontal | 249 | 2121,85 | 250 | 1595,63 | 526,23 |
| CA6709 | frontal | 499 | 3184,87 | 500 | 2277,00 | 907,87 |
| CA6709 | frontal | 999 | 4549,45 | 1000 | 3450,00 | 1099,45 |
| CA6709 | frontal | 1999 | 6896,55 | 2000 | 6141,00 | 755,55 |
| CA6709 | frontal+espalda | 49 | 973,43 | 50 | 710,33 | 263,11 |
| CA6709 | frontal+espalda | 99 | 1406,44 | 100 | 950,95 | 455,49 |
| CA6709 | frontal+espalda | 249 | 2367,87 | 250 | 1780,63 | 587,24 |
| CA6709 | frontal+espalda | 499 | 3554,13 | 500 | 2541,00 | 1013,13 |
| CA6709 | frontal+espalda | 999 | 5076,92 | 1000 | 3850,00 | 1226,92 |
| CA6709 | frontal+espalda | 1999 | 7696,15 | 2000 | 6853,00 | 843,15 |
| CA6660 | frontal | 49 | 840,31 | 50 | 613,19 | 227,13 |
| CA6660 | frontal | 99 | 1214,11 | 100 | 820,90 | 393,20 |
| CA6660 | frontal | 249 | 2044,05 | 250 | 1537,12 | 506,93 |
| CA6660 | frontal | 499 | 3068,09 | 500 | 2193,51 | 874,58 |
| CA6660 | frontal | 999 | 4382,63 | 1000 | 3323,50 | 1059,13 |
| CA6660 | frontal | 1999 | 6643,68 | 2000 | 5915,83 | 727,85 |
| CA6660 | frontal+espalda | 49 | 941,45 | 50 | 686,99 | 254,46 |
| CA6660 | frontal+espalda | 99 | 1360,23 | 100 | 919,70 | 440,53 |
| CA6660 | frontal+espalda | 249 | 2290,06 | 250 | 1722,12 | 567,95 |
| CA6660 | frontal+espalda | 499 | 3437,35 | 500 | 2457,51 | 979,84 |
| CA6660 | frontal+espalda | 999 | 4910,10 | 1000 | 3723,50 | 1186,60 |
| CA6660 | frontal+espalda | 1999 | 7443,28 | 2000 | 6627,83 | 815,45 |
| SU1074 | frontal | 24 | 1720,31 | 25 | 1281,48 | 438,83 |
| SU1074 | frontal | 49 | 2511,70 | 50 | 2062,87 | 448,83 |
| SU1074 | frontal | 99 | 4084,49 | 100 | 2958,87 | 1125,62 |
| SU1074 | frontal | 249 | 7367,58 | 250 | 5799,66 | 1567,92 |
| SU1074 | frontal | 499 | 11.576,12 | 500 | 9168,32 | 2407,80 |
| SU1074 | frontal | 999 | 18.318,31 | 1000 | 13.891,40 | 4426,91 |
| SU1074 | frontal | 1999 | 27.768,91 | 2000 | 24.726,69 | 3042,22 |
| SU1074 | frontal+espalda | 24 | 1776,04 | 25 | 1322,99 | 453,04 |
| SU1074 | frontal+espalda | 49 | 2593,07 | 50 | 2129,70 | 463,37 |
| SU1074 | frontal+espalda | 99 | 4216,80 | 100 | 3054,72 | 1162,08 |
| SU1074 | frontal+espalda | 249 | 7606,25 | 250 | 5987,53 | 1618,71 |
| SU1074 | frontal+espalda | 499 | 11.951,12 | 500 | 9465,32 | 2485,79 |
| SU1074 | frontal+espalda | 999 | 18.911,72 | 1000 | 14.341,40 | 4570,32 |
| SU1074 | frontal+espalda | 1999 | 28.668,46 | 2000 | 25.527,69 | 3140,77 |
| BO1977 | frontal | 99 | 757,35 | 100 | 510,00 | 247,35 |
| BO1977 | frontal | 249 | 1269,90 | 250 | 850,00 | 419,90 |
| BO1977 | frontal | 499 | 1696,60 | 500 | 1275,00 | 421,60 |
| BO1977 | frontal | 999 | 2547,45 | 1000 | 1700,00 | 847,45 |
| BO1977 | frontal | 1999 | 3398,30 | 2000 | 3060,00 | 338,30 |
| BO1977 | frontal+espalda | 99 | 980,10 | 100 | 660,00 | 320,10 |
| BO1977 | frontal+espalda | 249 | 1643,40 | 250 | 1100,00 | 543,40 |
| BO1977 | frontal+espalda | 499 | 2195,60 | 500 | 1650,00 | 545,60 |
| BO1977 | frontal+espalda | 999 | 3296,70 | 1000 | 2200,00 | 1096,70 |
| BO1977 | frontal+espalda | 1999 | 4397,80 | 2000 | 3960,00 | 437,80 |

Con un plazo igual en ambos pedidos, estos saltos también existen con recargo; el recargo y el IVA solo escalan la diferencia. Entre umbrales, el total aumenta linealmente: el problema está al cambiar C para **todo** el pedido.

Los coeficientes de hogar y papelería también bajan abruptamente en sus umbrales. No se han usado productos ficticios de esas familias en el CSV. La condición general para evitar caída al llegar al umbral n es `n × C_n >= (n-1) × C_anterior`, para una misma base+impresión positiva.

### 7.2 Familias, datos vacíos y ceros

- SU1074: slug `sudaderas-con-capucha` no mapeado, aunque sí lo están `swe` y `hoodies`. Mínimo real 10 en lugar de los 25 de ropa; frontal 0,50 en lugar de 0,45; coeficientes distintos. No se ha aplicado la tabla «esperada» en las simulaciones.
- Repeticiones ropa/camisetas y otros/_default son reales; pueden ser compatibilidad deliberada, no prueba automática de error. El riesgo es mantener fuentes duplicadas que diverjan.
- Todas las tablas presentes tienen coeficientes y costes numéricos positivos. No se han encontrado coeficientes explícitos 0 o tablas vacías en estos archivos.
- Un coeficiente 0 se sustituiría por 1 debido a `|| 1.0`. Una tabla sin claves podría fallar al convertir undefined a string.
- Una zona ausente vale 0 por `|| 0`, sin error. Papelería usa `frente`, no `frontal`: enviar frontal a esa familia no cobraría impresión. Hogar no tiene espalda.
- DRIBE, de tirantes, hereda mangas. No hay una fuente por producto que excluya zonas físicamente incompatibles.
- Sin `product.price`, la ficha usa 0, aunque exista regularPrice. Podría calcular solo impresión; la cabecera se oculta si el precio es inválido.
- No se usan los precios por variación, aunque CA6660 y SU1074 tienen rangos. Hay que decidir expresamente si la política comercial es precio uniforme o ajuste por talla, y validar el margen.
- Stock desconocido se sustituye por 9999 (y 999 en fallback de atributos) en `useProductPricing`; no es una tarifa, pero limita cantidades admitidas por la UI. El motor no valida stock.
- El validador de cantidad del hook limita a [0,stock], pero no impone por sí solo enteros. El servidor tampoco los exige.

### 7.3 Normalizador y fiscalidad

`normalizeProductPrice` elimina todo salvo números, puntos y comas, cambia solo la primera coma por punto y hace parseFloat. No separa rangos ni miles.

- `5,74&nbsp;€ - 7,01&nbsp;€` → `5,747,01` → 5,747.
- `26,78&nbsp;€ - 28,88&nbsp;€` → `26,7828,88` → 26,7828.
- Un valor con separador de miles también requiere tratamiento específico.
- El test actual solo cubre precios simples, no rangos ni miles.
- Las notas «IVA incluido» contradicen el añadido del 21 %. Si el origen ya incluye IVA y no se ajusta antes, habría una base fiscal incorrecta; **no se puede confirmar doble IVA sin revisar la configuración de origen**.

### 7.4 Cabecera, escala, total y SEO

La cabecera actual `FromPrice.tsx` usa la primera zona válida y el mayor umbral ≤1000, sin recargo. La escala usa las zonas seleccionadas (o una por defecto), añade recargo y muestra hasta cinco umbrales ≤1000. El total usa todas las cantidades y el tramo real, incluido 2000.

Con DRIBE actual:

- Cabecera: **3,45 €/ud + IVA, en 1000+, Frontal**.
- Escala 1000 con Frontal/Estándar: 3,45 €/ud.
- Total 1000 Frontal: 3.450 € sin IVA.
- Añadiendo Espalda: escala y total pasan a 3,85 €/ud; la cabecera permanece en el escenario de referencia de una zona, lo cual debe interpretarse con su condición.
- 2000 Frontal: 3,0705 €/ud, aunque el tramo no se muestra; a 1000 la escala puede afirmar «mejor precio por cantidad» pese a existir el de 2000.
- La función alternativa `calculateFromPrice` sigue usando el máximo (2000) **sin impresión**: DRIBE daría 2,67 €. No se ha encontrado consumidor activo de esa función fuera del propio servicio; es un riesgo latente, no la cabecera actual.
- Los valores históricos «7,29 / 8,21» no se reproducen con la entrada actual de DRIBE=6. No es riguroso adjudicarles una causa única sin conservar producto, zonas, plazo y versión de aquella captura. Actualmente escala y resumen reutilizan servicio/normalizador para iguales condiciones.
- El Offer JSON-LD usa el precio crudo del catálogo, sin dividir por dos, sin tramos ni impresión. DRIBE publica conceptualmente 6,00 mientras la cabecera de referencia es 3,45; CA6660 toma 5,74 en SEO, pero 5,747 en el motor. Es una fuente distinta de oferta/condiciones que debe unificarse o explicitarse.

### 7.5 Calculadora, popup y email

- **Confirmado:** email sin recargo. También faltan técnica, fecha, plazo y SKU en la solicitud.
- El detalle por talla del popup usa unitario sin recargo; su total final sí añade el recargo.
- `Intl.NumberFormat` y `toFixed` no son el mismo formato y pueden redondear distinto por representación binaria.
- Redondear las líneas por separado puede producir céntimos de diferencia frente al total.
- `usePriceCalculation` calcula de forma asíncrona: conserva el resultado anterior durante carga, y `isCalculating` solo es verdadero si no hay resultado previo. Existe una ventana potencial con cifras antiguas y CTA válido al cambiar configuración; no se ha realizado envío para probar esa carrera.
- Al restaurar configuraciones antiguas se recupera técnica/zonas sin una validación completa contra la tarifa vigente. Una selección antigua SIN_IMPRESION puede vaciar zonas; el cálculo sigue siendo DTF por defecto.
- No hay un identificador de tarifa o cotización firmado ni un cálculo autoritativo en el endpoint.

## 8. Valores fijos relevantes

Inventario de constantes que afectan al precio, elegibilidad, fecha o presentación de importes (no incluye medidas CSS):

| Valor | Archivo / significado |
| --- | --- |
| Divisor 2 | `src/services/pricingService.ts`; precio de entrada dividido por dos |
| IVA 1.21 / 21 % | Servicio, `product-quote/Summary.tsx`, `QuoteRequestModal.tsx`; email imprime 21 % |
| 0 de precio de respaldo | `ProductQuoteCalculator.tsx`, `useProductPricing.ts` |
| 0 de zona desconocida; 1 de multiplicador falsy | `pricingService.ts` |
| Todos los tramos, zonas y mínimos de §5 | JSON y TypeScript estáticos |
| DTF por defecto | Servicio y estado inicial de calculadora |
| 0/20/50 %; 14/10/7 días | `shared/config/delivery-times.json` |
| Festivos solo 2026 | Mismo JSON |
| Estándar/0 al entrar | `ProductQuoteCalculator.tsx` |
| 1000, máximo 5 puntos | `FromPrice.tsx`, `PriceScaleTable.tsx`; límite de presentación, no motor |
| 2 decimales, es-ES, EUR | `formatEuroPrice`; popup/email toFixed(2) |
| 9999/999 de stock desconocido, clamp a 0 | `useProductPricing.ts` |
| 7 días de persistencia, debounce 1000 ms | `productConfigService.ts`, `useProductConfig.ts` |
| 200 variaciones máximo por consulta | `GET_FULL_PRODUCT_QUERY`; catálogo grande podría quedar incompleto |
| 3600 s de revalidación SSR | `fetchProductForSSR`; precios podrían no coincidir instantáneamente con origen |
| Emergencia: mínimo10, factor1, frontal0.5 | `EMERGENCY_PRICING` declarado en servicio, sin uso encontrado |
| 2027-12-31 | `src/lib/seo.ts`: fecha fija de validez del Offer, no vigencia real de una tarifa |

## 9. Riesgos ordenados por gravedad

1. **Crítico — Integridad del presupuesto:** el servidor confía en los importes del cliente, sin recalcular. Permite enviar cantidades/importes incoherentes. No se ha explotado ni enviado ninguna petición de prueba.
2. **Alto — Recargo perdido:** presupuesto mostrado y email no coinciden cuando el plazo tiene recargo.
3. **Alto — Caídas de total:** incentivo a pedir más y pagar menos; riesgo comercial y de margen. Ver 48 casos exactos.
4. **Alto — Familia equivocada:** SU1074 cotiza con configuración General, con otros mínimos y costes.
5. **Alto — Base sin semántica confirmada:** divisor 2 fijo, rango mal interpretado y posible ambigüedad de IVA/coste vs venta.
6. **Alto — Técnica y zonas no garantizadas:** mismas tarifas DTF para familias distintas, mangas en tirantes, zonas desconocidas gratis.
7. **Medio — Condiciones inconsistentes:** 1000 visible/2000 calculable, «mejor precio» prematuro, Offer SEO de otra fuente.
8. **Medio — Reglas duplicadas:** JSON, familias, configuración de técnicas/zonas y formatos monetarios pueden divergir.
9. **Medio — Validación/estado:** cantidades decimales, datos restaurados obsoletos y ventana de cálculo asíncrono.
10. **Medio — Fechas prometidas:** calendario estático, ausencia de corte/aprobación/capacidad del proveedor.
11. **Bajo a medio — Céntimos de presentación:** unitario redondeado no reconstruye el total, formatos Intl/toFixed diferentes.

## 10. Opciones para corregir los saltos (ninguna aplicada)

| Opción | Cómo funciona | Ventajas | Inconvenientes |
| --- | --- | --- | --- |
| Tramos progresivos | El precio reducido se aplica solo a las unidades del nuevo intervalo | Total creciente con precios marginales positivos; evita saltos | Cambia mucho el precio medio; «50+ a X» deja de ser precio de todas las unidades; requiere coste/margen nuevo |
| Recalibrar coeficientes por tramo | Exigir `n*C_n >= (n-1)*C_anterior` en cada frontera | Conserva precio uniforme por unidad dentro del tramo | Permite descuentos muy pequeños al cambiar de tramo; no conserva las bajadas actuales |
| Suelo acumulado de total | Cobrar al menos el máximo total alcanzado en cantidades inferiores | Garantiza no decrecimiento y evita vender por debajo del máximo anterior | Crea mesetas y precios medios variables; sube ofertas actuales tras cada salto |
| Mejor total de cantidades superiores | Cobrar como máximo el mejor total disponible para una cantidad mayor, con condiciones claras | El cliente no paga más por pedir menos; puede mantener precios actuales de grandes lotes | Reduce ingresos antes del salto; mesetas; hay que validar margen/capacidad y definir si se entregan unidades extra |
| Tarifa continua de coste + preparación | Coste por unidad y costes fijos de preparación reales, descuentos suaves | Puede reflejar mejor proveedor, técnicas y economías de escala | Requiere datos reales nuevos y más pruebas; no es un ajuste de UI |
| Aviso «pide más por menos total» | Mantener fórmula y avisar/ofrecer siguiente cantidad | Transparente a corto plazo | **No corrige** la incoherencia ni garantiza margen |

**Sobre «cobrar como mínimo el total del tramo siguiente»:** por sí solo no es una solución general. Si el total actual a 49 ya es mayor que el de 50, aplicar un máximo entre ambos deja intacto el salto. Si lo que se busca es que el pedido pequeño no sea más caro que el siguiente, se trataría de un techo (mínimo entre ofertas superiores), no de un suelo. Para garantizar monotonía hay que definir una regla global y probar todos los umbrales, no solo el siguiente.

Propuesta de orden de trabajo, sin ejecutar: acordar semántica de precio y fiscalidad → normalizar rangos y familias → definir política de tramos/margen → cálculo único autoritativo → llevar el mismo desglose a cabecera, escala, popup y email → validar todos los límites y casos de técnica/plazo.

## 11. Apéndice de trazabilidad

### 11.1 Mapeo completo de categorías a familias

Fuente `src/data/pricing/category-to-family.ts`; no se deduce por textos ni nombres de producto.

**ropa**: `t_shirts`, `cam`, `cam_w`, `cat`, `camisetas-manga-corta`, `sp_tshi`, `industrytshirts`, `serviciostshirts`, `highvistshirts`, `pol_s`, `pol_l`, `swe`, `hoodies`, `cha`, `chuba`, `coats`, `w_coats`, `subcoats`, `raincoats`, `windbreak`, `pan`, `trousers`, `mono`, `chnd`, `servicioschalecos`, `highvischalecos`, `sanitarybata`, `foodindustrybata`, `horecachaqueta`, `horecacamisas`, `horecadelantal`, `sanitarycasaca`, `sanitarygorro`, `foodindustrygorro`, `industryjackets`, `servicioschaqutas`, `highvischaquetas`.

**accesorios**: `bags`, `sub_bags`, `drawstring_bag`, `bags_coolers`, `bags_travel`, `waterproof_dry_bags`, `summer_cooler_bags`, `subbackpacks`, `backpacks`, `gor`, `hats`, `travel_caps`, `christmas_hats`, `gloves`, `neckwarmer`, `travel_accessories`, `travel_adaptors`, `sunglasses`, `subsunglasses`, `sunglasses_pouches`, `tech_accessories`, `wireless_charger`, `car_charger`, `chargers`, `earphones`, `headphones`, `speakers`, `mouse_pad`, `acc`, `sport_accessories`, `acc_outdoor`, `take_away`, `pets_accessories`.

**hogar**: `mugs`, `submugs`, `cup_warmer`, `bottles`, `bottles_thermos_flas`, `glass_bottles`, `thermos_flasks`, `sports_bottles`, `home_gifts`, `kitchen`, `home_cocktail`, `decoration`, `decoration_games`, `decorations`.

**papeleria**: `ball_pens`, `notebooks`, `pencil_cases`, `diaries_calendars`, `writing`, `writing_office`.

**otros**: `default`.

### 11.2 Reproducción en memoria

El siguiente código es el utilizado para obtener resultados. Ejecutable desde la raíz con `node --import tsx --input-type=module` (entrada estándar o `-e`). Solo lee código/configuración y escribe resultados en stdout. Los productos se incluyen como instantánea para no depender de cambios posteriores del catálogo.

```js
import fs from "node:fs";
import {calculateScaledPrice,loadPricingData,calculateFromPrice} from "./src/services/pricingService.ts";
import {normalizeProductPrice} from "./src/lib/normalizeProductPrice.ts";
import {resolveProductPricingCategory} from "./src/lib/productPricingCategory.ts";
import {CATEGORY_TO_FAMILY_MAPPING} from "./src/data/pricing/category-to-family.ts";
import {PRICING_FAMILIES} from "./src/data/pricing/pricing-families.ts";
const products=[{"slug":"dribe","name":"DRIBE","sku":"CA6709","price":"6,00&nbsp;€","regularPrice":"6,00&nbsp;€","salePrice":null,"productCategories":{"nodes":[{"slug":"t_shirts","name":"Camisetas"},{"slug":"cam_po","name":"Camisetas y polos"}]}},{"slug":"camiseta-de-manga-corta-tubular-con-acabado-vigore-y-cuello-redondo","name":"Camiseta de manga corta tubular con acabado vigoré y cuello redondo","sku":"CA6660","price":"5,74&nbsp;€ - 7,01&nbsp;€","regularPrice":"5,74&nbsp;€ - 7,01&nbsp;€","salePrice":null,"productCategories":{"nodes":[{"slug":"camisetas-manga-corta","name":"Camisetas manga corta"}]}},{"slug":"sudadera-con-capucha-unisex-de-algodon-organico-y-poliester-reciclado","name":"Sudadera con Capucha Unisex de Algodón Orgánico y Poliester Reciclado","sku":"SU1074","price":"26,78&nbsp;€ - 28,88&nbsp;€","regularPrice":"26,78&nbsp;€ - 28,88&nbsp;€","salePrice":null,"productCategories":{"nodes":[{"slug":"sudaderas-con-capucha","name":"Sudaderas con capucha"}]}},{"slug":"kabil","name":"KABIL","sku":"BO1977","price":"2,20&nbsp;€","regularPrice":"2,20&nbsp;€","salePrice":null,"productCategories":{"nodes":[{"slug":"sub_bags","name":"Bolsas"},{"slug":"bags","name":"Bolsas"},{"slug":"bags_travel","name":"BOLSAS & VIAJE"}]}}];
const source=fs.readFileSync("src/components/pricing/product-quote/Summary.tsx","utf8");
const block=source.slice(source.indexOf("  const deliverySurcharge ="),source.indexOf("  const cta ="));
const delivery=new Function("precioTotalSinIVA","precioUnitarioFinal","deliverySurchargePercent",block+"return {precioTotalSinIVAConEntrega,precioTotalConIVAConEntrega,precioUnitarioFinalConEntrega};");
const config=JSON.parse(fs.readFileSync("shared/config/delivery-times.json","utf8"));
const rows=[],drops=[],meta=[];
for(const p of products){
 const category=resolveProductPricingCategory(p.productCategories.nodes);
 const data=await loadPricingData(category),base=normalizeProductPrice(p.price);
 meta.push({...p,category,family:CATEGORY_TO_FAMILY_MAPPING[category]||"otros (fallback General)",base,data});
 const qs=[...new Set([data.cantidad_minima,10,24,25,49,50,99,100,249,250,999,1000,2000])].sort((a,b)=>a-b);
 for(const zones of [["frontal"],["frontal","espalda"]]){
  for(const [q,plazo] of [...qs.map(q=>[q,"sin_prisa"]),[50,"urgente"]]){
   const calc=calculateScaledPrice(base,q,zones,data);
   const adjusted=delivery(calc.precioTotalSinIVA,calc.precioUnitarioFinal,config.categories.default[plazo].surchargePercent);
   rows.push({sku:p.sku,producto:p.name,familia:CATEGORY_TO_FAMILY_MAPPING[category]||"otros (General)",cantidad:q,zonas:zones.join("+"),plazo,precio_base:base,coeficiente:calc.escalado,impresion_ud:calc.precioPersonalizacion,unitario:adjusted.precioUnitarioFinalConEntrega,total:adjusted.precioTotalSinIVAConEntrega,iva:adjusted.precioTotalConIVAConEntrega,minimo:data.cantidad_minima,valido:calc.cumpleCantidadMinima,base_mitad:calc.precioUnitarioBase,unitario_sin_recargo:calc.precioUnitarioFinal,total_email:calc.precioTotalConIVA});
  }
  for(let q=data.cantidad_minima+1;q<=2000;q++){
   const a=calculateScaledPrice(base,q-1,zones,data),b=calculateScaledPrice(base,q,zones,data);
   if(b.precioTotalSinIVA<a.precioTotalSinIVA) drops.push({sku:p.sku,zonas:zones.join("+"),antes:q-1,despues:q,totalAntes:a.precioTotalSinIVA,totalDespues:b.precioTotalSinIVA,diferencia:a.precioTotalSinIVA-b.precioTotalSinIVA});
  }
 }
}
console.log("AUDIT_JSON:"+JSON.stringify({meta,rows,drops,families:PRICING_FAMILIES,mapping:CATEGORY_TO_FAMILY_MAPPING,delivery:config,deliverySource:block}));
```

El motor es el importado del proyecto. La función dinámica solo ejecuta el bloque literal de recargo ya existente, no una variante de la regla.

### 11.3 Verificación final

- CSV releído: 104 filas de datos, 17 columnas, cuatro referencias, ocho filas Urgente y 16 filas por debajo del mínimo.
- Los tres importes finales de cada fila se compararon de nuevo con `calculateScaledPrice` y el bloque literal de entrega: **104/104 filas coinciden, cero diferencias**.
- Comprobado que siguen iguales las huellas SHA-256 del servicio, normalizador, selector de categoría, Summary, familias, ambos JSON tarifarios y configuración de entrega antes y después de crear los informes.
- El estado Git conserva los cambios locales preexistentes. En esta auditoría solo se han escrito los dos entregables de `calculadora/precios/`.
- No se ejecutó build ni tests con generación de cachés/artefactos del proyecto. Las pruebas numéricas se ejecutaron en memoria.

Huellas de las fuentes principales:

```text
974fc7a5f8ac7d26589530ae32d43a48af014ba44b88770a1977c7303418dbd2  src/services/pricingService.ts
160a7f9c366eb928a788782b5fedebef3957d6dfe3a4c8b811aca2c7c380f961  src/lib/normalizeProductPrice.ts
50bb56732aa7ced2e3414035d1d09247d3222da3954682addc852f7f43e2e33d  src/lib/productPricingCategory.ts
fdf670861bca80092335ba8dcd4f762533cc95c640f46457fe4bcac8d5d82479  src/components/pricing/product-quote/Summary.tsx
245438ab86e43a3824786fcd326d13969cb396d133218f12f6e9ec46fef87c6f  src/data/pricing/pricing-families.ts
e5354b0cabf9cc19ac0be68307bd87d85f94df92c7b03aaad95411f9bd002ff5  src/data/pricing/_default.json
cf34c9cfcbdcb8e4994b676239411f33187f0f13357e40b7936411f3cdd69a77  src/data/pricing/camisetas.json
8e4d62605c26ab1786eb95035584897cdbf04bbfc2c8a39a7891a11133b5ca4a  shared/config/delivery-times.json
```

### 11.4 Límites de la conclusión

- No se ha consultado el coste de compra real del proveedor ni la configuración fiscal administrativa de WordPress.
- No se ha certificado la configuración de LIVE ni se ha desplegado.
- Las simulaciones no garantizan disponibilidad de stock ni compatibilidad de impresión.
- No se ha enviado correo ni probado una manipulación del endpoint.
- Ninguna corrección sugerida se ha aplicado.
