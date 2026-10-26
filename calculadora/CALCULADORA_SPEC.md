# Calculadora de presupuesto · Ficha de producto impacto33.com

Especificación para rediseñar la calculadora de la ficha de producto. **El objetivo es cambiar la UX/UI de la calculadora, no el resto de la ficha** (galería, descripción, FAQ, relacionados se quedan como están).

Referencia visual y de comportamiento: `calculadora-referencia.html` (ver sección 10 para cómo leerla).

---

## ⚠️ Restricción principal: cambiamos el workflow y la UI, no la lógica

Este trabajo es de **presentación y flujo**. Lo que ya funciona se conserva tal cual:

**NO se modifica:**
- La lógica de cálculo de precios ni sus funciones (el bug del subtotal se corrige aparte, en backend).
- Las queries/mutations de GraphQL, los endpoints, Apollo, Supabase, tRPC ni el servidor Express.
- Los nombres de variables, estados, props, tipos, stores ni claves de SessionStorage existentes.
- Los nombres de campos de ACF/WPGraphQL ni el modelo de datos.
- El popup/formulario de "Solicitar presupuesto" ni el envío del email (solo se le pasan datos que ya existen).
- Otros componentes de la ficha (galería, descripción, FAQ, relacionados) ni componentes compartidos con otras páginas.

**SÍ se modifica:**
- Orden y agrupación de los bloques, estados atenuado/activo, visibilidad condicional.
- Maquetación, estilos, textos, iconos y versión móvil.
- Componentes de presentación nuevos que **consumen** los datos y funciones que ya existen.

**Si algo de esta spec no se puede hacer sin tocar lógica o datos** (p. ej. un campo que no existe), **no lo improvises**: déjalo fuera, apúntalo en la lista "Pendiente de lógica/backend" del informe (`calculadora/INFORME.md`) y sigue con lo demás.

Las funciones marcadas con 🔧 en esta spec son **nuevas** (requieren lógica que hoy no existe) y van en la **Fase 2**, solo cuando se aprueben aparte:

- 🔧 Pedido multicolor (varias filas de color en un mismo presupuesto).
- 🔧 Consejo de técnica ("con serigrafía ahorras X €") y precio del pedido en cada tarjeta de técnica.
- 🔧 Aviso de ahorro por tramo y botón "Subir a N uds".
- 🔧 Miniaturas de zona a partir de printTemplates (si los datos no llegan ya a la ficha).
- 🔧 Descargar PDF y WhatsApp con la configuración precargada (si no existen ya).
- 🔧 Subida de logo dentro de la calculadora (si no existe ya).

**Fase 1 = todo lo demás**, usando solo lo que ya existe.

---

## 0. Reglas de oro

1. **El color va siempre primero.** El stock depende del color; sin color no se puede introducir cantidad.
2. **Los pasos se desbloquean en orden.** Al entrar, los pasos 2–5 se ven atenuados (`opacity: .42`, sin interacción), nunca ocultos. Así no hay saltos de página.
3. **Nada de precios inventados en el front.** Precios, tramos, mínimos, técnicas, zonas, recargos de plazo y stock vienen del backend (WordPress / WPGraphQL). Los números del mockup son de ejemplo.
4. **El total nunca puede bajar al subir la cantidad.** Añadir un test que lo compruebe para todos los tramos.
5. **Precios B2B sin IVA como dato principal**; el total con IVA como dato secundario.
6. Un único componente sirve para **todo el catálogo** (camisetas, sudaderas, tazas, bolsas, bidones…). Nada específico de camisetas hardcodeado.

---

## 1. Flujo y estados

```
1 Color → 2 Tallas/cantidad → 3 Personalización → 4 Plazo → 5 Presupuesto
```

| Estado | Paso 1 | Paso 2 | Pasos 3–5 |
|---|---|---|---|
| Sin color | activo + aviso "Elige un color para ver tallas y stock" | atenuado | atenuados |
| Color elegido, 0 uds | activo | activo | atenuados |
| ≥1 ud | activo | activo | activos |
| Por debajo del mínimo | activo | activo + barra de progreso | activos; CTA deshabilitado: "AÑADE X UDS PARA SOLICITAR" |
| ≥ mínimo | activo | activo | activos; CTA habilitado |

- Si el producto tiene **un solo color**, se preselecciona y se empieza en el paso 2.
- Si el producto tiene **talla única**, el paso 2 es un solo input de cantidad (misma lógica de stock y mínimo).

---

## 2. Paso 1 · Color

- Swatch (30 px) + **nombre legible** del color + **señal de stock** debajo:
  - `En stock` (verde) · `Pocas uds` (ámbar, umbral configurable) · `Agotado` (rojo, swatch tachado, `disabled`).
- Seleccionado: borde oscuro. Colores que ya están en el pedido (multicolor) pero no se están editando: anillo azul.
- Al elegir color, la galería cambia a las imágenes de ese color.
- Usar siempre el **nombre legible** ("Naranja fuego"), nunca el slug (`naranja-fuego`), en calculadora, desglose, formulario y PDF.

### Multicolor
- Botón "+ Añadir otro color al pedido" (debajo de la matriz de tallas): deja el color activo vacío para elegir otro.
- Bloque "Tu pedido" en el paso 1: una fila por color con unidades > 0 → `● Negro · 60 uds` / `S 20 · M 25 · L 15` / acciones **Editar** y **Quitar**. La fila en edición se marca "Editando".
- **El tramo de precio se calcula sobre el total de todas las filas**, no por color.
- Al cambiar de color nunca se pierden cantidades: cada color conserva las suyas.

---

## 3. Paso 2 · Tallas y cantidades

- Rejilla de tallas (escritorio: una columna por talla). Cada celda: talla, input, stock.
- Input con `placeholder="0"` (vacío, no "0" escrito). Celda con cantidad > 0 resaltada (borde y fondo azul claro).
- Stock por talla del **color activo**: `+500` si ≥ 500 · número si 51–499 · `Quedan N` en ámbar si ≤ 50 · `Agotado` (input deshabilitado) si 0.
- Si se escribe más que el stock: se ajusta al máximo y se muestra aviso ámbar: *"Solo quedan 12 uds en talla XL de Naranja fuego. Hemos ajustado la cantidad; puedes completar con otro color."*
- Debajo: total de unidades + **barra de progreso hacia el mínimo**:
  - 0 uds: "Mínimo de pedido: 25 uds"
  - por debajo: "Faltan 14 uds para el mínimo [con serigrafía 1 color]" (ámbar)
  - alcanzado: "Mínimo de 25 uds alcanzado" (verde)
- **El mínimo depende de la técnica elegida** (paso 3). Usar siempre la palabra "mínimo" (no "recomendado"/"orientativo").

### Móvil
- La rejilla pasa a **lista vertical**: talla · stock · stepper (− cantidad +), botones de 44 px. Tallas agotadas atenuadas sin stepper. Ver artboard móvil del mockup.

---

## 4. Paso 3 · Personalización

### Técnica
- **Varias técnicas** (configuradas en el admin): tarjetas de opción única (radio) en rejilla de 2 columnas. Cada tarjeta:
  - nombre ("DTF a todo color", "Serigrafía 1 color")
  - descripción de 1 línea
  - chips de condiciones ("Colores ilimitados", "Pantalla 25 € por zona")
  - línea de precio:
    - 0 uds → "Pedido mínimo N uds"
    - uds < mínimo de esa técnica → "Disponible desde N uds" (ámbar)
    - si no → "XXX,XX € para tu pedido" (total sin IVA con esa técnica y la configuración actual)
- **Una sola técnica**: línea compacta de solo lectura con check: "**DTF a todo color** · única técnica disponible para este producto". Sin tarjeta, sin caja informativa.
- **Consejo de técnica** (franja verde con botón de acción):
  - si otra técnica sale más barata con la configuración actual: *"Si tu diseño es de un solo color, con serigrafía ahorras 120 €."* → botón "Cambiar a serigrafía"
  - si la técnica elegida exige más unidades: *"Con 30 uds no llegas al mínimo de serigrafía (50). El DTF sí está disponible."* → "Cambiar a DTF"

### Zonas
- Rejilla de 4 columnas, **selección múltiple** (checkbox visible en la esquina; texto "Puedes elegir varias").
- Cada zona: miniatura, nombre, **tamaño máximo de impresión** ("Hasta 30×40 cm").
- **Precio de la zona oculto por defecto**; solo visible con el interruptor "Desglose de precios" activo.
- Zonas no admitidas por la técnica elegida: atenuadas, `disabled`, texto "No disponible". Al cambiar de técnica, se deseleccionan las zonas no válidas; si no queda ninguna, se selecciona la frontal (o la zona por defecto del producto).
- **Miniatura de zona**: usar la **imagen real de la vista del producto** con el área de impresión superpuesta (rectángulo discontinuo; relleno azul al seleccionar). Las áreas ya existen en las plantillas de áreas del personalizador (printTemplates: vista + rectángulo). Fallback si no hay imagen: pictograma genérico por familia (camiseta, sudadera, taza, bolsa, bidón…). **No hay que diseñar nada por producto.**
- Nada de emojis como iconos.

---

## 5. Paso 4 · Plazo de entrega

- 3 tarjetas en orden **Estándar → Rápido → Urgente**, cada una con etiqueta, fecha (día y mes) y día de la semana.
- **Por defecto siempre Estándar**, en cada producto (no arrastrar la elección de otra ficha/sesión).
- **Seleccionado en verde**: borde `#157F3B`, fondo `#E9F7EF`, etiqueta verde, check verde en la esquina.
- Etiqueta "Urgente" en rojo cuando no está seleccionada (aviso, no estado).
- Coste de cada plazo ("Incluido" / "+97,20 €") **oculto por defecto**; visible solo con "Desglose de precios".
- Indicar que la fecha es de **entrega estimada**.

---

## 6. Paso 5 · Presupuesto

Orden de arriba a abajo:

1. **Tramos de precio por cantidad** (bloque destacado, fondo crema `#FFF8E1`, borde `#F3E2AE`, radio 12 px):
   - título "Precio por unidad según cantidad" + nota "Prenda + impresión · sin IVA" (+ "· pantallas aparte" si la técnica tiene coste fijo)
   - 4 columnas; cada una con una línea fina de 3 px encima:
     - tramos superados: línea azul claro
     - tramo actual: línea azul, etiqueta azul, precio grande en negrita, texto "Tu precio"
     - tramo siguiente: "Faltan N uds"
     - resto: línea beige, texto apagado
   - El precio de cada tramo = prenda + suma de zonas seleccionadas (por unidad).
2. **Aviso de ahorro por tramo** (solo si aplica): *"Por 31 € más te llevas 50 uds a 11,60 €/ud."* o *"Pedir 50 uds te sale X € más barato que 46 uds."* + botón "Subir a 50 uds" que reparte las unidades que faltan en el color activo respetando el stock.
3. **Total sin IVA** (grande) + "X € con IVA (21%)" debajo. A la derecha: **precio por unidad** "todo incluido, sin IVA".
4. **Desglose** (solo con el interruptor activo), sin precio unitario por línea, solo cantidad y método:
   - `Camisetas · 111 uds` → importe
   - `DTF a todo color · Frontal + Espalda · 111 uds` → importe
   - `Pantallas de serigrafía · 2 zonas` → importe (solo si la técnica tiene coste fijo)
   - `Plazo rápido (+15%)` → importe (solo si no es Estándar)
   - Subtotal sin IVA · IVA 21% · Total con IVA
5. **Adjunta tu logo (opcional)**: zona de subida (PNG, PDF, AI, SVG).
6. **CTA "SOLICITAR PRESUPUESTO"** → abre el **popup de formulario que ya existe** en la web. El popup debe recibir la configuración completa ya rellenada (producto, colores con tallas, técnica, zonas, plazo, total, logo adjunto); el cliente solo añade sus datos de contacto. El email resultante lleva el presupuesto en PDF.
7. Acciones secundarias (2 botones al 50%): **Descargar PDF** · **WhatsApp** (mensaje precargado con la configuración). **No hay botón "Enviar por email"**.
8. Nota: "Precios orientativos. Revisamos tu diseño y confirmamos el presupuesto antes de producir."

---

## 7. Interruptor "Desglose de precios"

- Interruptor (switch) en la cabecera de la calculadora, junto al "Desde X €/ud". **Apagado por defecto.**
- Apagado: se muestran total, precio por unidad, tramos, línea de precio de cada técnica y avisos de ahorro.
- Encendido: además se muestran precio por zona (paso 3), coste de cada plazo (paso 4) y desglose (paso 5).
- Cabecera de precio: "Desde 7,40 €/ud" + "+ IVA · en 250+ uds, sin impresión".

---

## 8. Cálculo (referencia de lógica)

```
tramo(n)        = mayor tramo con tramo.n <= max(n, primerTramo.n)
zonasSel        = zonas seleccionadas ∩ zonas de la técnica (si vacío → zona por defecto)
impresionUd     = Σ técnica.precioZona[z] para z en zonasSel
fijo            = técnica.costeFijoPorZona × |zonasSel|
base(n)         = n × (tramo(n).precioPrenda + impresionUd) + fijo
total(n)        = base(n) × (1 + plazo.recargo)
porUnidad       = total(n) / n
iva             = total × 0.21
deltaPlazo(p)   = base(max(n, mínimo)) × p.recargo
```

`n` = suma de unidades de todos los colores del pedido. **Esta fórmula es solo para entender el mockup. No se implementa ni se sustituye la existente**: la UI usa las funciones de cálculo actuales del proyecto. Si la función actual no devuelve algún componente por separado (p. ej. el coste de cada plazo), ese dato se oculta y se apunta como pendiente.

---

## 9. Datos que necesita el componente (del admin / WPGraphQL)

```ts
type Product = {
  id: string; name: string; family: 'camiseta' | 'sudadera' | 'taza' | 'bolsa' | 'bidon' | string;
  colors: { id: string; name: string; hex: string; images: string[];
            stock: Record<string /*talla*/, number> }[];   // talla única → { "U": 500 }
  sizes: string[];                                          // orden de tallas
  tiers: { minQty: number; unitPrice: number }[];           // precio prenda por tramo
  techniques: {
    id: string; name: string; description: string; chips: string[];
    minQty: number; setupPerZone: number;
    zonePrices: Record<string /*zoneId*/, number>;          // zonas admitidas y su precio/ud
  }[];
  zones: { id: string; name: string; maxArea: string;       // "Hasta 30×40 cm"
           viewImage?: string;                              // imagen de la vista del producto
           rect?: { x: number; y: number; w: number; h: number } // % sobre la imagen (printTemplates)
         }[];
  leadTimes: { id: 'std' | 'fast' | 'urg'; name: string; date: string; surcharge: number }[];
  lowStockThreshold: number;                                // p. ej. 50
};
```

Esto es el **modelo ideal de referencia**, no un cambio a aplicar: **no se renombran ni se crean campos**. Mapear cada punto a los datos que ya llegan al componente. Si alguno no existe, no se crea ni se hardcodea: se lista en el informe como "Pendiente de lógica/backend".

---

## 10. Cómo leer `calculadora-referencia.html`

Es el mockup interactivo hecho en un formato de componente propio. **No se copia tal cual**: es la referencia de layout, estados, textos y lógica.

- El HTML dentro de `<x-dc>` es la plantilla. `{{ algo }}` son valores calculados; `<sc-for list="{{ x }}" as="y">` es un bucle; `<sc-if value="{{ x }}">` es un condicional.
- La lógica está en el `<script type="text/x-dc">`: `class Component` con `state` (estado de React) y `renderVals()`, que calcula todo lo que pinta la plantilla. Traducirlo a componentes React + hooks del proyecto.
- Los estilos (`<helmet><style>` + estilos inline) son la guía visual: colores, radios, tamaños y espaciados. Adaptarlos al sistema de estilos del proyecto.
- `data()` contiene **datos de ejemplo** (colores, stock, tramos, técnicas, zonas, plazos). En producción vienen de la sección 9.

Paleta usada: texto `#0F1B33` · secundario `#556070` · borde `#E3E8EF` · fondo `#F4F6FA` · azul acción `#1A5FD0` · verde `#157F3B` / `#E9F7EF` · ámbar `#A54A05` / `#FFF4E5` · rojo `#B42318` · crema tramos `#FFF8E1` / `#F3E2AE`. Tipografía: Montserrat (la de la web).

---

## 11. Criterios de aceptación

- [ ] Al entrar en una ficha con varios colores: solo el paso 1 activo; pasos 2–5 visibles y atenuados.
- [ ] Ficha con un solo color: color preseleccionado, paso 2 activo.
- [ ] Ficha con talla única: input único de cantidad, misma lógica de stock y mínimo.
- [ ] No se puede introducir más cantidad que el stock de la talla/color; aparece el aviso.
- [ ] Pedido multicolor: el tramo se calcula sobre el total de todos los colores; editar y quitar funcionan.
- [ ] El mínimo y las zonas disponibles cambian al cambiar de técnica.
- [ ] Producto con una técnica: línea compacta. Con varias: tarjetas con el precio del pedido en cada una.
- [ ] Plazo por defecto Estándar en cada producto; seleccionado en verde.
- [ ] Interruptor de desglose apagado por defecto; controla precios de zonas, plazos y desglose.
- [ ] Los cambios no modifican funciones de cálculo, queries, nombres de variables/estados/props ni campos de datos existentes.
- [ ] Existe la lista "Pendiente de lógica/backend" en `calculadora/INFORME.md` (vacía si no hay nada).
- [ ] CTA deshabilitado por debajo del mínimo con texto "AÑADE X UDS PARA SOLICITAR".
- [ ] "Solicitar presupuesto" abre el popup existente con la configuración precargada.
- [ ] No hay botón "Enviar por email".
- [ ] Móvil: tallas en lista con steppers; barra fija inferior con unidades, total sin IVA y CTA.
- [ ] Sin emojis como iconos; nombres legibles (no slugs) en toda la calculadora.
- [ ] Accesible: botones reales, `aria-pressed` en selecciones, `label` en inputs, contraste AA.

---

## 12. Fuera de alcance (fases siguientes)

- Franja de guía contextual y chat IA que asesora y rellena la calculadora.
- Selector de fecha "¿Para cuándo lo necesitas?" que recomienda el plazo.
- Ajuste real de precios (hay un bug conocido en el subtotal actual; se corrige aparte en backend).
