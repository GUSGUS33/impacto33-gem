# Auditoría del sistema de estilos de Impacto33

Fecha: 08/10/2026. Auditoría estática del árbol local, no de LIVE. **Veredicto: sí, con preparación previa.** Hay un motor reutilizable, pero no una piel sustituible únicamente cambiando un CSS.

Alcance: 302 archivos `.ts/.tsx/.js/.jsx/.css` de `src/` y `app/`, excluyendo nombres `.test.` y `.spec.`. Se incluyen pantallas antiguas, backups, emails y `testpage.tsx`: existencia no implica uso en producción. No se inspeccionaron los contenidos remotos de WordPress, estilos inyectados por terceros, base de datos, RLS, ni todas las pantallas en navegador. No se ejecutaron build, tests ni mutaciones remotas.

Se conserva el trabajo local previo del menú y `next-env.d.ts`. La única escritura dentro del proyecto es este informe, conforme a la instrucción específica de entrega; no se ha hecho commit.

## 1. Stack de estilos

### Tecnología y configuración

- **Tailwind CSS 4.2.4 instalado y en package-lock**, declarado `^4.0.0`. Configuración CSS-first en `src/index.css:1`; no se encontró `tailwind.config.*` en raíz.
- `postcss.config.mjs:1`: activa `@tailwindcss/postcss`.
- `src/index.css:1`: CSS global, plugin typography, animaciones, variante dark, tokens y estilos base/container/hero.
- `src/components/menu-motion.module.css:1`: único CSS Module encontrado en el alcance; movimiento, estado cerrado y reduced-motion del menú.
- **shadcn/ui + Radix**, acreditado por `components.json:2` y `src/components/ui/button.tsx:1`. Son fuentes locales, no un paquete “shadcn” único. `components.json:8` apunta a `client/src/index.css`, mientras la app importa `@/index.css` en `app/layout.tsx:2`: configuración del generador desalineada.
- No hay dependencia declarada styled-components ni Emotion en package.json; no se encontró otro archivo CSS en src/app.
- `src/components/ui/carousel.tsx` implementa Embla; el HeroSlider activo es propio, no ese componente. Tener una dependencia no prueba su uso.

Dependencias relacionadas, versiones **declaradas** en `package.json` (no confundir rangos con instalada):

| Dependencia | Versión |
| --- | --- |
| `@radix-ui/react-accordion` | `^1.2.12` |
| `@radix-ui/react-alert-dialog` | `^1.1.15` |
| `@radix-ui/react-aspect-ratio` | `^1.1.7` |
| `@radix-ui/react-avatar` | `^1.1.10` |
| `@radix-ui/react-checkbox` | `^1.3.3` |
| `@radix-ui/react-collapsible` | `^1.1.12` |
| `@radix-ui/react-context-menu` | `^2.2.16` |
| `@radix-ui/react-dialog` | `^1.1.15` |
| `@radix-ui/react-dropdown-menu` | `^2.1.16` |
| `@radix-ui/react-hover-card` | `^1.1.15` |
| `@radix-ui/react-label` | `^2.1.7` |
| `@radix-ui/react-menubar` | `^1.1.16` |
| `@radix-ui/react-navigation-menu` | `^1.2.14` |
| `@radix-ui/react-popover` | `^1.1.15` |
| `@radix-ui/react-progress` | `^1.1.7` |
| `@radix-ui/react-radio-group` | `^1.3.8` |
| `@radix-ui/react-scroll-area` | `^1.2.10` |
| `@radix-ui/react-select` | `^2.2.6` |
| `@radix-ui/react-separator` | `^1.1.7` |
| `@radix-ui/react-slider` | `^1.3.6` |
| `@radix-ui/react-slot` | `^1.2.3` |
| `@radix-ui/react-switch` | `^1.2.6` |
| `@radix-ui/react-tabs` | `^1.1.13` |
| `@radix-ui/react-toggle` | `^1.1.10` |
| `@radix-ui/react-toggle-group` | `^1.1.11` |
| `@radix-ui/react-tooltip` | `^1.2.8` |
| `class-variance-authority` | `^0.7.1` |
| `clsx` | `^2.1.1` |
| `cmdk` | `^1.1.1` |
| `embla-carousel-react` | `^8.6.0` |
| `framer-motion` | `^11.11.17` |
| `input-otp` | `^1.2.4` |
| `lucide-react` | `^0.453.0` |
| `next-themes` | `^0.4.4` |
| `react-day-picker` | `^9.14.0` |
| `react-resizable-panels` | `^2.0.16` |
| `recharts` | `^2.12.7` |
| `sonner` | `^1.4.41` |
| `tailwind-merge` | `^2.3.0` |
| `tailwindcss-animate` | `^1.0.7` |
| `vaul` | `^1.1.2` |
| `@tailwindcss/postcss` | `^4.0.0` |
| `@tailwindcss/typography` | `^0.5.10` |
| `autoprefixer` | `^10.4.19` |
| `postcss` | `^8.4.38` |
| `tailwindcss` | `^4.0.0` |

### Fuentes y temas

`app/layout.tsx:5` carga **Montserrat mediante next/font/google**, pesos 300–900 y variable `--font-sans`; se aplica en html y body (45, 53). Sin embargo, `src/index.css:150` impone **Poppins con !important en body**. No se encontró carga de Poppins ni @font-face propia en el código analizado; los preconnect de layout no descargan la fuente. El resultado puede diferir entre body y elementos con font-sans; requiere inspección de fuente computada, no se afirma qué fuente pinta cada elemento. La pantalla antigua `src/screens/ProductPage.tsx:300` además usa font-['Montserrat'].

Hay variables dark (`src/index.css:109`) y un ThemeContext light/dark (`src/contexts/ThemeContext.tsx:20`), pero `app/providers.tsx:57` monta light sin switchable: no es un selector de marcas. next-themes está declarado, pero el provider raíz es el propio. Los bg-white/text-slate directos impiden que todos los elementos sigan el tema semántico.

## 2. Variables de diseño y recuentos

### Tokens existentes

Fuente principal: `src/index.css:7–141`.

| Grupo | Definición |
| --- | --- |
| Marca | --color-brand: #279BCA |
| Sobrescritura paleta | --color-blue-600: #1e293b; --color-blue-700: #0f172a |
| Radio | --radius: 0.65rem; --radius-sm/md/lg/xl derivados restando 4px/2px, directo, sumando 4px |
| Semánticos | background, foreground, card, card-foreground, popover, popover-foreground, primary, primary-foreground, secondary, secondary-foreground, muted, muted-foreground, accent, accent-foreground, destructive, destructive-foreground, border, input, ring |
| Gráficos | chart-1 a chart-5 |
| Sidebar | sidebar, sidebar-foreground, sidebar-primary, sidebar-primary-foreground, sidebar-accent, sidebar-accent-foreground, sidebar-border, sidebar-ring |
| Variables antiguas | --blue, --indigo, --purple, --pink, --red, --orange, --yellow, --green, --teal, --cyan, --white, --gray, --gray-dark; --primary-color, --secondary-color, --success-color, --info-color, --warning-color, --danger-color, --light-color, --dark-color |
| Exposición Tailwind | @theme inline mapea los semánticos anteriores a --color-* |
| Fuente | --font-sans generado por Montserrat en app/layout.tsx:10 |
| Movimiento local | --menu-ease y --menu-header-bottom en menu-motion.module.css:2 y :22 |

No hay escala **de marca** centralizada de tamaños tipográficos, espaciados, sombras o breakpoints. Se hereda la de Tailwind: `node_modules/tailwindcss/theme.css:325` define --spacing:0.25rem; 327–331 define sm/md/lg/xl/2xl (40/48/64/80/96rem). Sus tamaños, pesos, sombras y radios estándar siguen disponibles. El container global contiene medidas literales, no tokens propios (sección 5).

**Riesgo concreto:** blue-600 ya no significa azul, sino slate oscuro; cambiar la paleta azul global para otra marca afectaría simultáneamente botones, enlaces, banners y gráficos (`src/index.css:12,74,78`). Separar brand/action de info/status es más seguro que sustituir “blue” indiscriminadamente.

### Método y límites de los números

Conteo léxico de ocurrencias, no colores computados ni nodos DOM. Se quitaron comentarios de bloque y líneas completas de comentario; hex precedido por & se excluyó para no contar entidades HTML. Las variantes hover/md y duplicaciones en distintas ramas cuentan por aparición. No se resuelven concatenaciones dinámicas ni estilos ACF remotos. Los nombres abreviados y largos (#fff/#ffffff) se mantienen distintos. No se fusiona un hex con su equivalente Tailwind.

| Métrica | Ocurrencias | Interpretación |
| --- | --- | --- |
| Colores Tailwind arbitrarios | 16 | bg/text/border/ring/outline/fill/stroke/from/via/to con [#…/rgb/hsl/oklch] |
| Literales de color fuera de clases arbitrarias | 149 | Incluye 70 declaraciones de tokens; 79 fuera de esos tokens |
| De esos 79 fuera de tokens | 49 emails + 30 restantes | 38 orderEmailService + 11 app/api/newsletter; resto CSS, swatches y otros componentes |
| Literales hex/rgb/hsl/oklch en CSS global fuera de tokens | 2 | rgba del overlay y #fff: index.css:214,223 |
| Clases de paleta con tono | 2854 | 12 familias; tabla siguiente |
| Fuente arbitraria numérica | 48 | text-[…px/rem/em/vw]; no cuenta colores ni familias de fuente |
| Espaciado arbitrario | 12 | p/m por ejes/lados, gap, space-x/y |
| Radio arbitrario | 10 | rounded-[…] y variantes |
| style={{…}} | 16 | No incluye style={variable}, aserciones ni cadenas HTML de emails |
| Literales totales de color | 165 | 16 arbitrarios +149 restantes; 76 valores escritos distintos |

Los 30 literales restantes no son todos “malos tokens”: ColorSelector tiene 24 colores de producto que representan mercancía, no la marca; no deben recolorearse por tema (`src/components/pricing/ColorSelector.tsx:98`). Los literales de style y CSS no se confunden aquí con toda la paleta: el conteo global incluye mapas de swatches y emails. Los style={{}} pueden ser dimensiones dinámicas correctas (`LazyBlock.tsx:40`, `ui/progress.tsx:23`).

| Familia Tailwind | Ocurrencias |
| --- | --- |
| slate | 1657 |
| blue | 804 |
| red | 147 |
| green | 95 |
| amber | 58 |
| emerald | 23 |
| yellow | 21 |
| gray | 21 |
| purple | 18 |
| orange | 4 |
| cyan | 4 |
| indigo | 2 |

Además, utilidades bg/text/border/ring/fill/stroke/from/to/via sin tono: white 423, black 15, transparent 53 y current 9 (últimas dos no son colores fijos). No se incluyen como familias con tono.

### Top 15 archivos por valores directos

Índice = literales de color + clases de paleta + fuente/espaciado/radio arbitrarios + style={{}}. Es una medida de dispersión, no de gravedad ni de tráfico. Se excluye index.css del ranking por ser el fichero de tokens. No se suman dos veces los hex dentro de clases arbitrarias.

| Archivo | Índice | Paleta directa | Colores arbitrarios | Fuente / espaciado / radio | Inline |
| --- | --- | --- | --- | --- | --- |
| `src/screens/MiCuenta.tsx` | 240 | 240 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/CheckoutPage.tsx` | 225 | 225 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/InfoPage.tsx` | 188 | 181 | 0 | 7 / 0 / 0 | 0 |
| `src/layouts/MainLayout.tsx` | 146 | 136 | 4 | 6 / 0 / 0 | 0 |
| `src/screens/ServicePage.tsx` | 142 | 142 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/ProvinciasHubPage.tsx` | 135 | 134 | 0 | 1 / 0 / 0 | 0 |
| `src/components/pricing/QuoteRequestModal.tsx` | 101 | 101 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/ThankYouTransferPage.tsx` | 70 | 70 | 0 | 0 / 0 / 0 | 0 |
| `src/components/pricing/PriceCalculator.tsx` | 65 | 65 | 0 | 0 / 0 / 0 | 0 |
| `app/busqueda/page.tsx` | 55 | 52 | 0 | 3 / 0 / 0 | 0 |
| `src/screens/shop/CategoryPage.tsx` | 54 | 54 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/CartPage.tsx` | 50 | 50 | 0 | 0 / 0 / 0 | 0 |
| `src/screens/ProductPage.tsx` | 49 | 47 | 1 | 1 / 0 / 0 | 0 |
| `src/screens/ServicePage.backup.tsx` | 45 | 45 | 0 | 0 / 0 / 0 | 0 |
| `src/components/MegaMenu.tsx` | 44 | 39 | 0 | 5 / 0 / 0 | 0 |

CheckoutPage, ProductPage antiguo y ServicePage.backup entran por estar en el árbol; no son prueba de rutas activas.

### Paleta literal completa del alcance

Incluye tokens, emails y mapas de colores de producto: **76 representaciones distintas**, no 76 colores visibles de marca.

| Literal | Frecuencia |
| --- | --- |
| `#007bff` | 2 |
| `#0f172a` | 2 |
| `#128c7e` | 1 |
| `#16a34a` | 2 |
| `#17a2b8` | 2 |
| `#1a1a19` | 2 |
| `#1e293b` | 10 |
| `#1e3a8a` | 2 |
| `#1e40af` | 3 |
| `#1f2937` | 2 |
| `#20c997` | 1 |
| `#2563eb` | 4 |
| `#25d366` | 1 |
| `#279bca` | 1 |
| `#28a745` | 2 |
| `#334155` | 2 |
| `#34322d` | 1 |
| `#343a40` | 2 |
| `#48475c` | 4 |
| `#64748b` | 9 |
| `#6610f2` | 1 |
| `#6b7280` | 2 |
| `#6c757d` | 2 |
| `#6f42c1` | 1 |
| `#78350f` | 1 |
| `#858481` | 1 |
| `#92400e` | 1 |
| `#9333ea` | 2 |
| `#94a3b8` | 1 |
| `#ccc` | 3 |
| `#dc2626` | 2 |
| `#dc3545` | 2 |
| `#e2e8f0` | 8 |
| `#e49b9b` | 1 |
| `#e5e7eb` | 1 |
| `#e83e8c` | 1 |
| `#eab308` | 2 |
| `#ec4899` | 2 |
| `#eff6ff` | 1 |
| `#f1f5f9` | 3 |
| `#f5f5f5` | 1 |
| `#f8f8f7` | 1 |
| `#f8f9fa` | 2 |
| `#f8fafc` | 3 |
| `#f97316` | 2 |
| `#f9fafb` | 2 |
| `#fd7e14` | 1 |
| `#fde68a` | 1 |
| `#fefce8` | 1 |
| `#ffc107` | 2 |
| `#fff` | 4 |
| `#ffffff` | 3 |
| `oklch(0.141 0.005 285.823)` | 3 |
| `oklch(0.21 0.006 285.885)` | 3 |
| `oklch(0.235 0.015 65)` | 4 |
| `oklch(0.24 0.006 286.033)` | 1 |
| `oklch(0.274 0.006 286.033)` | 3 |
| `oklch(0.4 0.015 65)` | 1 |
| `oklch(0.488 0.243 264.376)` | 2 |
| `oklch(0.552 0.016 285.938)` | 1 |
| `oklch(0.577 0.245 27.325)` | 1 |
| `oklch(0.623 0.214 259.815)` | 2 |
| `oklch(0.7 0.005 65)` | 1 |
| `oklch(0.704 0.191 22.216)` | 1 |
| `oklch(0.705 0.015 286.067)` | 1 |
| `oklch(0.85 0.005 65)` | 4 |
| `oklch(0.92 0.004 286.32)` | 3 |
| `oklch(0.92 0.005 65)` | 1 |
| `oklch(0.967 0.001 286.375)` | 3 |
| `oklch(0.98 0.001 286.375)` | 1 |
| `oklch(0.985 0 0)` | 4 |
| `oklch(1 0 0 / 10%)` | 2 |
| `oklch(1 0 0 / 15%)` | 1 |
| `oklch(1 0 0)` | 3 |
| `rgba(0, 0, 0, 0.15)` | 1 |
| `rgba(0,0,0,0.08)` | 2 |

### Tonos Tailwind distintos y frecuencia

Se agrupan text/bg/border/etc por tono. La equivalencia visual depende de @theme (especialmente blue-600/700); no se suman a los hex como si fueran necesariamente colores nuevos.

| Tono | Frecuencia |
| --- | --- |
| amber-100 | 8 |
| amber-200 | 8 |
| amber-300 | 1 |
| amber-400 | 2 |
| amber-50 | 12 |
| amber-500 | 5 |
| amber-600 | 9 |
| amber-700 | 4 |
| amber-800 | 8 |
| amber-900 | 1 |
| blue-100 | 49 |
| blue-200 | 33 |
| blue-300 | 16 |
| blue-400 | 22 |
| blue-50 | 59 |
| blue-500 | 177 |
| blue-600 | 294 |
| blue-700 | 125 |
| blue-800 | 14 |
| blue-900 | 14 |
| blue-950 | 1 |
| cyan-200 | 2 |
| cyan-50 | 1 |
| cyan-500 | 1 |
| emerald-100 | 2 |
| emerald-200 | 3 |
| emerald-400 | 4 |
| emerald-50 | 3 |
| emerald-500 | 3 |
| emerald-600 | 4 |
| emerald-700 | 3 |
| emerald-900 | 1 |
| gray-200 | 6 |
| gray-300 | 1 |
| gray-50 | 4 |
| gray-500 | 4 |
| gray-600 | 4 |
| gray-700 | 2 |
| green-100 | 24 |
| green-200 | 5 |
| green-50 | 13 |
| green-500 | 7 |
| green-600 | 30 |
| green-700 | 12 |
| green-800 | 4 |
| indigo-50 | 1 |
| indigo-500 | 1 |
| orange-50 | 2 |
| orange-600 | 2 |
| purple-100 | 3 |
| purple-400 | 2 |
| purple-50 | 3 |
| purple-500 | 2 |
| purple-600 | 5 |
| purple-700 | 2 |
| purple-800 | 1 |
| red-100 | 11 |
| red-200 | 15 |
| red-300 | 1 |
| red-400 | 2 |
| red-50 | 19 |
| red-500 | 47 |
| red-600 | 33 |
| red-700 | 13 |
| red-800 | 6 |
| slate-100 | 141 |
| slate-200 | 230 |
| slate-300 | 120 |
| slate-400 | 74 |
| slate-50 | 155 |
| slate-500 | 146 |
| slate-600 | 213 |
| slate-700 | 149 |
| slate-800 | 57 |
| slate-900 | 366 |
| slate-950 | 6 |
| yellow-100 | 1 |
| yellow-200 | 1 |
| yellow-400 | 11 |
| yellow-50 | 1 |
| yellow-500 | 2 |
| yellow-600 | 3 |
| yellow-700 | 1 |
| yellow-800 | 1 |


## 3. Componentes

### Inventario base

54 módulos en `src/components/ui/`. Columna “usos” = archivos con import literal hacia /ui/nombre o ./nombre en el alcance; incluye importaciones entre primitives, no solo páginas. No identifica imports dinámicos construidos. **36 módulos sin importaciones detectadas**; no se propone eliminarlos.

| Módulo | Archivos importadores | Reutilizable |
| --- | --- | --- |
| `src/components/ui/OptimizedImage.tsx` | 6 | Sí, primitive/utilidad |
| `src/components/ui/accordion.tsx` | 4 | Sí, primitive/utilidad |
| `src/components/ui/alert-dialog.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/alert.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/aspect-ratio.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/avatar.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/badge.tsx` | 2 | Sí, primitive/utilidad |
| `src/components/ui/breadcrumb.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/button-group.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/button.tsx` | 30 | Sí, primitive/utilidad |
| `src/components/ui/calendar.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/card.tsx` | 2 | Sí, primitive/utilidad |
| `src/components/ui/carousel.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/chart.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/checkbox.tsx` | 1 | Sí, primitive/utilidad |
| `src/components/ui/collapsible.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/command.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/context-menu.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/dialog.tsx` | 5 | Sí, primitive/utilidad |
| `src/components/ui/drawer.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/dropdown-menu.tsx` | 1 | Sí, primitive/utilidad |
| `src/components/ui/empty.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/field.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/form.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/hover-card.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/input-group.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/input-otp.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/input.tsx` | 11 | Sí, primitive/utilidad |
| `src/components/ui/item.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/kbd.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/label.tsx` | 4 | Sí, primitive/utilidad |
| `src/components/ui/menubar.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/navigation-menu.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/pagination.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/popover.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/progress.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/radio-group.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/resizable.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/scroll-area.tsx` | 1 | Sí, primitive/utilidad |
| `src/components/ui/select.tsx` | 1 | Sí, primitive/utilidad |
| `src/components/ui/separator.tsx` | 4 | Sí, primitive/utilidad |
| `src/components/ui/sheet.tsx` | 2 | Sí, primitive/utilidad |
| `src/components/ui/sidebar.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/skeleton.tsx` | 8 | Sí, primitive/utilidad |
| `src/components/ui/slider.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/sonner.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/spinner.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/switch.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/table.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/tabs.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/textarea.tsx` | 3 | Sí, primitive/utilidad |
| `src/components/ui/toggle-group.tsx` | 0 | Sí, primitive/utilidad |
| `src/components/ui/toggle.tsx` | 1 | Sí, primitive/utilidad |
| `src/components/ui/tooltip.tsx` | 2 | Sí, primitive/utilidad |

Uso JSX por nombre exacto (complementa, no sustituye resolver imports):

| Componente | Archivos con JSX | Instancias JSX |
| --- | --- | --- |
| Button | 27 | 60 |
| Card | 2 | 6 |
| Tabs | 0 | 0 |
| Accordion | 4 | 4 |
| Badge | 1 | 3 |
| Input | 10 | 21 |
| Dialog | 3 | 3 |
| Breadcrumbs | 2 | 2 |
| BreadcrumbsWithSchema | 2 | 2 |
| MegaMenu | 1 | 1 |
| MainLayout | 1 | 1 |
| CheckoutForm | 0 | 0 |

- **Header/Footer:** no hay piezas independientes en el layout actual; están incrustados en `src/layouts/MainLayout.tsx:106,509`. Se reutiliza el layout entero desde `app/MainLayoutWrapper.tsx` (1 uso JSX).
- **MegaMenu:** `src/components/MegaMenu.tsx`, 1 consumidor JSX; MegaMenuContent recibe datos, wrapper usa useMainMenu. Es reutilizable con su contrato, pero incluye estilos y detalles de servicios específicos.
- **Breadcrumbs:** `src/components/Breadcrumbs.tsx` y `BreadcrumbsWithSchema.tsx`, 2 consumidores JSX cada uno; conviven con breadcrumbs escritos en la ficha (`screens/shop/ProductPage.tsx:113`). No confundir con primitive ui/breadcrumb sin importadores.
- **ProductCard:** no se encontró un archivo/componente base con ese nombre. La tarjeta se escribe en varios listados.
- **Modal:** primitive Dialog (5 importadores), Sheet (2), y modal específico `src/components/pricing/QuoteRequestModal.tsx`; no son intercambiables sin conservar callbacks y contrato.

### Duplicación o paralelismo

| Grupo | Evidencia | Lectura |
| --- | --- | --- |
| Tarjetas y consulta de productos | home/ProductosDestacados.tsx:8,60 y home/TabProductos.tsx:8,56 | Consulta casi idéntica y tarjeta repetida; buen primer candidato a extracción |
| Tarjeta dinámica | blocks/ProductosDinamicosBlock.tsx:330 | Misma función comercial con variaciones seleccionables; unificar vista, no borrar comportamiento |
| Ficha antigua/nueva | screens/ProductPage.tsx:25 frente a screens/shop/ProductPage.tsx:27 | La ruta actual usa shop vía app/producto/[slug]/ProductPageClient.tsx:3; no asumir ambas activas |
| Plantilla transaccional | screens/TransactionalPage.tsx y components/TransactionalPageClient.tsx | Implementaciones paralelas; las rutas actuales importan la segunda |
| FAQ/acordeón | blocks/FaqBlock.tsx:15, infoBlocks/AcordeonBlock.tsx, ui/accordion.tsx | Semántica y montaje diferentes; FAQ además genera JSON-LD |
| Servicios | screens/ServicePage.tsx y ServicePage.backup.tsx | Copia/versión de respaldo presente, no requiere eliminación para rediseñar |
| Botones | ui/button.tsx:40 y 124 etiquetas button nativas en el alcance | Base disponible pero no aplicada universalmente |

No se ha demostrado igualdad completa de los pares ni que todos estén en el bundle activo.

Interfaz escrita en páginas: `app/busqueda/page.tsx:188` define H1 con tipografía/layout y sus estados; `app/page.tsx:32` fija fondo del main. La mayor mezcla no está en page.tsx sino en screens (CheckoutPage/MiCuenta) y en MainLayout. Convertir cada page.tsx en un wrapper no resolvería por sí solo esa mezcla.

## 4. Separación lógica / presentación

### Fronteras de datos reales

| Capa | Evidencia | Estado |
| --- | --- | --- |
| WordPress servidor | src/lib/wpGraphql.ts:34; app/page.tsx:16 | Fetch centralizado, revalidación; home obtiene bloques antes de presentar |
| Transaccionales | app/[slug]/page.tsx:261; app/[slug]/[child]/page.tsx:180; src/lib/transactionalPrefetch.ts:175 | Prefetch servidor de productos/hijos; pasan initialData a vista |
| Ficha servidor | app/producto/[slug]/page.tsx:24,32,67 | cache(fetchProductForSSR), metadata, inexistentes y datos separados de JSX cliente |
| Ficha visual | src/screens/shop/ProductPage.tsx:32,83 | Apollo fallback, normalización de precio, categoría, imagen y maquetación juntos |
| Home productos | home/TabProductos.tsx:23 y ProductosDestacados.tsx:23 | Son server components, pero consulta GraphQL y tarjeta comparten archivo |
| Listados cliente | DynamicProductBlock.tsx:37; blocks/HubsBlock.tsx:256 | useQuery dentro de componente visual |
| Carrito | hooks/useCart.ts:11 → services/cartService.ts:1,56 | Hook + servicio Supabase separados; pantalla sigue orquestando acciones |
| Checkout | screens/CheckoutPage.tsx:81,203; services/checkoutService.ts:107,163 | Servicio de pedidos separado, validación/orquestación/formulario mezclados |
| tRPC | app/providers.tsx:41; src/lib/trpc.ts:1 | Provider común; no debe cambiar al cambiar botones o grid |
| Stripe | components/CheckoutForm.tsx:27,102 | Placeholder explícito, no pago completo demostrado |
| Precio/configuración | components/pricing/ProductPricingFlow.tsx:31,77,140 | Hooks reutilizables, pero restauración, selección, persistencia y UI en el orquestador |

**Los más críticos para un reskin:** ProductPricingFlow; screens/shop/ProductPage; MainLayout (auth/cart/search + header/footer); bloques dinámicos; CartPage; CheckoutPage si se va a activar. Mantener sus hooks/servicios y extraer vistas con props/eventos, no reescribir cálculos para adaptar el diseño.

**Límite funcional importante:** CheckoutPage existe pero no se encontró importación suya en src/app ni app/checkout/page.tsx; CartPage:55 navega a /checkout. No se acredita un checkout operativo. `components/CheckoutForm.tsx` tampoco tiene uso JSX detectado y se describe como placeholder. El reskin no debe prometer preservar un pago cuya ruta no se ha verificado.

### Registro ACF

| Familia | Archivo | Recuento |
| --- | --- | --- |
| Transaccional | src/components/blocks/BlockRenderer.tsx:34 | 36 claves/aliases → 25 componentes distintos |
| Informacional | src/components/InfoBlockRenderer.tsx:29 | 13 cases por __typename |
| Home | src/components/home/HomeBlocks.tsx:25 | 9 cases por __typename; CTA final devuelve null |

No existe un único registro para todo el sitio. BlockRenderer:106 omite subcategorías porque el hero las absorbe; también tiene fallback por nombre/contenido hub. Mantener esas excepciones y los nombres ACF para evitar pérdida de contenido. La cifra de claves no es número de bloques visibles ni número de layouts ACF únicos en WordPress.

### Independencia por zona

| Zona | Evaluación | Contrato a preservar |
| --- | --- | --- |
| Home | Alta para wrappers, media en listas | app/page.tsx → HomeBlocks; separar fetch/tarjeta en destacados y tabs |
| Categoría madre | Media-alta | TransactionalPageClient + prefetch, encabezados y enlaces de hijos |
| Subcategoría | Media-alta | Mismo renderer; conservar filtros, initialProducts y URL |
| Producto | Media | Separar vista de shop/ProductPage y ProductPricingFlow; conservar SSR y precios |
| Sector / ocasión / provincia | Media-alta si usan plantilla transaccional | Mantener resolución genérica de [slug]/[child]; no se ha enumerado cada contenido CMS |
| Hub provincias | Media | screens/ProvinciasHubPage.tsx tiene presentación propia y 134 colores directos |
| Informativas | Alta en bloques ACF; media en fallback | app/[slug]/page.tsx:190,202 elige InfoPageRenderer o screens/InfoPage |
| Carrito / checkout | Media / no verificado operativo | useCart y servicios; estados, validación y navegación requieren pruebas |
| Personalizador Fabric | No determinable | No se encontró dependencia fabric, import Fabric ni canvas en código propio examinado |

No confundir configuración de impresión/precios con editor visual Fabric. No se puede evaluar la piel de un editor ausente o externo. Los datos ACF admiten HTML libre (`infoBlocks/HtmlLibreBlock.tsx:16`), que puede incorporar estilos de WordPress fuera del control de tokens.

## 5. Maquetación y responsive

Hay una base, pero no un sistema uniforme de composición:

- `src/index.css:168`: container 100%, centrado, padding 1rem; desde 640px 1.5rem; desde 1024px 2rem y max-width 1280px.
- `BlockRenderer.tsx` aplica section py-16 md:py-24 y container/px-4; alterna white/slate-50/blue-50. Por tanto los fondos también están acoplados al renderer, no solo a cada bloque.
- Home usa py-12/md:py-16/lg:py-[100px] (`home/ProductosDestacados.tsx:41`) y container/px-4/md:px-6. Tabs repite ese patrón. Hay decisiones compartidas por copia, no tokens Section.
- Max-w-3xl/4xl/5xl y grids locales: `home/HeroSlider.tsx:57`, `HeroAdvancedSearch.tsx:29`, `Resenas.tsx:17`, `TabProductos.tsx:46`. No todo debe tener el mismo ancho, pero faltan roles explícitos (lectura, contenido, catálogo).

Breakpoints por ocurrencia léxica: md 597, sm 199, lg 144, xl 23, 2xl 10. Coinciden con la escala Tailwind heredada. `src/hooks/useMobile.tsx:3` usa 768; menú actual cambia en xl; son umbrales distintos para funciones distintas, no necesariamente bug. Se debe probar 767/768, 1023/1024 y 1279/1280 al extraer layout.

| Interacción | Implementación / accesibilidad estática | HTML inicial |
| --- | --- | --- |
| Hero | home/HeroSlider.tsx:12,14; estado y autoplay propios, indicadores con aria-label (:101) | JSX incluye slides; primer título H1 y siguientes H2 (:64,68) |
| Tabs de home | home/TabsProductosUI.tsx:28; botones propios sin roles tab/tablist ni aria-selected | Solo children[activeTab] se inserta (:44); no todos los paneles en DOM inicial |
| FAQ transaccional | blocks/FaqBlock.tsx:59; button nativo pero sin aria-expanded/controls | Respuesta se monta solo al abrir (:72); JSON-LD sí sale antes |
| Acordeón base | ui/accordion.tsx → Radix | No afirmar respuestas cerradas en SSR sin revisar política forceMount |
| Menú | MegaMenu.tsx:190,225; aria-expanded/controls, inert/aria-hidden y teclado | Paneles desktop retenidos; móvil se monta tras primera apertura en MainLayout |
| Carousel base | ui/carousel.tsx:122,159, Embla | 0 importadores detectados; no extrapolar a Hero |
| Modal/dropdown | ui/dialog, sheet, dropdown-menu sobre Radix | Depende de estado/portal; no son contenido editorial principal |

“use client” no significa “sin SSR”. El comentario inicial de app/providers.tsx simplifica incorrectamente esa idea; la conclusión aquí se basa en props iniciales y condiciones de montaje. No se certifica accesibilidad completa: faltan teclado real, lector de pantalla, contrastes y móvil físico.

## 6. Riesgos para SEO y funcionamiento

| Riesgo | Evidencia | Protección propuesta para futuro rediseño |
| --- | --- | --- |
| Perder H1/jerarquía | HeroSlider:64; TransactionalPageClient:181; shop/ProductPage:178 | Contratos de headings y snapshots de HTML sin JS |
| Perder schema al reemplazar acordeón | blocks/FaqBlock.tsx:21 genera FAQPage en la vista | Separar generación SEO de vista y conservar correspondencia con contenido visible |
| Breadcrumbs distintos | BreadcrumbsWithSchema y breadcrumb manual en ficha:113 | Unificar vista conservando enlaces y chain de slugMap |
| Metadata/canonical de marca fijos | app/layout.tsx:14,21; app/[slug]/page.tsx:80; producto/page.tsx:26 | No reescribir estas rutas durante la fase visual; parametrizar marca después |
| Regresión soft404 | app/ClientProviders.tsx:5 y producto/page.tsx:77 | No envolver rutas en Suspense/loading global; retestar status |
| Ocultar texto/enlaces a rastreo | LazyBlock.tsx:40 monta children condicionado a viewport | Scroll reveal debe animar contenido existente, no retrasar su montaje |
| HTML de CMS libre | HtmlBlock.tsx:141 y HtmlLibreBlock.tsx:16 | Auditar HTML remoto y encapsular estilos; no asumir que todo son componentes |
| Estilos globales invasivos | index.css:145 universal border/outline; :176 altera todas las .flex | Delimitar alcance antes de sustituir layout |
| Fuente forzada | index.css:150, único !important en los CSS propios inspeccionados | Acordar una fuente/token, comprobar computed styles |
| Selectores estructurales | HtmlBlock:142–149 prose-headings/prose-a/prose-blockquote; menu-motion estados | Cambiar DOM puede cambiar estilos y movimiento aunque no cambien clases del wrapper |
| Configuración de producto | ProductPricingFlow:77,140, ColorSelector:98 | No tratar colores de mercancía ni cálculos como branding |
| Personalizador externo | Sin Fabric/canvas localizado | No se pueden descartar colisiones con contenido/script externo no inspeccionado |

### Tests encontrados y cobertura que no se debe presuponer

37 ficheros .test/.spec en src/app; además `proxy.test.ts`, `next.config.test.ts` y tres tests de server (auth.logout, emailService, supabase.connection). 42 en esos ámbitos combinados. `vitest.config.ts:5` usa jsdom; package.json ejecuta vitest run. No se han ejecutado en esta auditoría.

Inventario de src/app:

- `src/components/MegaMenu.server.test.tsx`
- `src/components/pricing/ColorSelector.server.test.tsx`
- `src/config/stripeConfig.test.ts`
- `src/hooks/useFilteredProducts.server.test.tsx`
- `src/hooks/useMainMenu.test.ts`
- `src/hooks/useProductPricing.test.ts`
- `src/hooks/useRestoredProductConfig.test.tsx`
- `src/hooks/useTransactionalPages.test.ts`
- `src/hooks/useUserOrders.fix.test.ts`
- `src/hooks/useUserOrders.test.ts`
- `src/hooks/useViewedProductsWithData.test.ts`
- `src/hooks/useWishlistProductsWithData.test.ts`
- `src/lib/productContent.test.ts`
- `src/lib/productPricingCategory.test.ts`
- `src/lib/productSSR.test.tsx`
- `src/lib/redirects.test.ts`
- `src/lib/seo.test.ts`
- `src/lib/siteConfig.test.ts`
- `src/lib/slugMap.test.ts`
- `src/lib/slugUtils.test.ts`
- `src/lib/supabaseClient.test.ts`
- `src/lib/transactionalPrefetch.test.ts`
- `src/lib/url.test.ts`
- `src/services/addressService.test.ts`
- `src/services/authService.test.ts`
- `src/services/cartService.test.ts`
- `src/services/checkoutService.test.ts`
- `src/services/multisite.integration.test.ts`
- `src/services/ordersService.test.ts`
- `src/services/pricingService.test.ts`
- `src/services/profileOnboardingService.test.ts`
- `src/services/profileService.test.ts`
- `src/services/searchHistoryService.test.ts`
- `src/services/trackingService.test.ts`
- `src/services/wishlistService.test.ts`
- `app/bolsas-ferias-eventos/bolsa-sea-roly/route.test.ts`
- `app/sitemap.test.ts`

Los tests de MegaMenu/productSSR/filteredProducts/colorSelector cubren contratos SSR; pricing/cart/checkout cubren parte de lógica, no un viaje completo del usuario. Hay verificadores de sitemap y redirects en scripts. No se encontraron configuración/dependencias de Playwright o Cypress ni suite de snapshots visuales en el inventario. No se afirma que los 42 pasen ni que prueben LIVE. “integration” en un nombre tampoco acredita prueba contra servicio real.

## 7. Veredicto y plan

### Puntuación (1 = débil; 5 = preparado)

| Eje | Nota | Motivo |
| --- | --- | --- |
| Centralización de tokens | 2/5 | Semánticos y radios existen, pero 2.854 referencias de paleta y fuentes competidoras |
| Reutilización | 3/5 | 54 primitives y renderers ACF, pero 36 sin importadores, tarjetas repetidas y controles propios |
| Lógica/presentación | 3/5 | Servicios/prefetch reutilizables; ficha, listas y precio aún orquestan dentro de vistas |
| Coherencia layout | 3/5 | Container y breakpoints comunes; sección/espaciado/ancho definidos por plantilla |
| Preparación multitema | 2/5 | Light/dark no equivale a marca; datos de marca y dominio repartidos |

**Sí, con preparación previa.** No hace falta rehacer WordPress, rutas ni reglas de precio para aplicar una estética de fotografía grande, más aire y un acento. Pero “cambiar solo la piel” necesita crear esa frontera: hoy una parte de los componentes visuales también contiene reglas funcionales. La preservación exacta se demuestra con contratos y pruebas, no solo con que el build termine.

### Preparación priorizada

S: 0,5–2 jornadas; M: 3–5; L: 1–2 semanas. Estimaciones de desarrollo/revisión, no presupuestos; no aditivas ni incluyen carga de contenido/fotografía.

| Prioridad | Trabajo | Esfuerzo |
| --- | --- | --- |
| P0 | Fijar rutas activas y baseline HTML/status/title/canonical/schema, precios y acciones de carrito; aclarar alcance de checkout/editor | M |
| P1 | Definir tokens de marca/semánticos y escalas; resolver Montserrat/Poppins y config shadcn | M |
| P1 | Extraer vista de ProductPricingFlow y ficha sin cambiar hooks, formatos ni persistencia | L |
| P1 | ProductCard común, Button con variantes y secciones/container con roles | M |
| P2 | Sustituir tabs/FAQ propios por contratos accesibles conservando SSR/schema | M |
| P2 | Separar Header/Footer de MainLayout conservando auth/cart/search/menu | M |
| P2 | Auditar HTML ACF real y colores que llegan del CMS | M |
| P3 | Parametrizar brand/domain/tenant y assets con pruebas entre marcas | L |

### Fases de rediseño recomendadas

| Fase | Archivos afectados en una tarea futura | Puerta de salida |
| --- | --- | --- |
| 0. Contratos | tests existentes SSR/SEO/pricing; nuevas pruebas de navegación y visuales | Baseline reproducible; ninguna ruta o función reclasificada silenciosamente |
| 1. Tokens | src/index.css, app/layout.tsx, components.json, src/config/siteConfig.ts | Una tipografía y roles de color; estado actual visualmente estable |
| 2. Base | src/components/ui/button.tsx, card.tsx, input.tsx, tabs.tsx, accordion.tsx; nueva ProductCard/Section; MainLayout | Móvil/teclado y contraste; mismas acciones y enlaces |
| 3. Home piloto | home/HomeBlocks.tsx, HeroSlider.tsx, GridCategorias.tsx, ProductosDestacados.tsx, TabProductos.tsx, TabsProductosUI.tsx | Diseño aprobado; mismo contenido indexable/H1 y sin CLS introducido |
| 4. Plantillas | TransactionalPageClient.tsx, blocks/*, InfoBlockRenderer.tsx, infoBlocks/*, InfoPageRenderer.tsx | Categorías/subcategorías/sectores/ocasiones/provincias representativas validadas |
| 5. Producto/área cliente | screens/shop/ProductPage.tsx, components/pricing/*, screens/CartPage.tsx, pantallas de cuenta | Precio/configuración/restauración/carrito invariantes |
| 6. Segunda marca | configuración visual + siteConfig/seo/metadata, inventarios/menú/assets | Ningún enlace, logo, canonical, email o tenant cruzado |

Mantener fuera de la fase puramente visual proxy.ts, next.config.js, rutas de sitemap, slugMap, servicios de precio y persistencia. Cualquier cambio funcional detectado debe convertirse en tarea aparte. No eliminar versiones antiguas ni backups sin autorización.

### Multimarca

Es viable como evolución, **no cambiando hoy solo tema y contenido**:

- `src/config/siteConfig.ts:1` centraliza parte de marca/contacto/meta, buena base.
- `src/lib/siteConfig.ts:18` fija SITE_SLUG y SITE_ID_FALLBACK de Impacto33: existe infraestructura de site_id, no selección genérica de tenant.
- `app/layout.tsx:16,21` y `app/page.tsx:12` fijan nombre/dominio; MainLayout contiene logo y enlaces/contenido propios.
- Falta contrato único BrandConfig (dominio, identidad, fuentes, assets, contactos, SEO), esquema de tokens por marca y selección controlada del catálogo/tenant.
- Hay que comprobar aislamiento real de datos, políticas y entornos antes de lanzar otra marca. Esta auditoría no accedió a Supabase ni acredita ese aislamiento.
- DeportPrint y EstampaBolsas podrían compartir componentes, queries y reglas con adaptadores; si catálogo/precios/flujo difieren, eso es configuración de negocio adicional, no un cambio de color.

**Recomendación final:** conservar el motor y empezar por tokens + primitives + una home piloto. No hacer una sustitución masiva de clases ni rediseñar el flujo de precios para conseguir un aspecto nuevo.
