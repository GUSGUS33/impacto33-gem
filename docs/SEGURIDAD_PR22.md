# Correcciones de seguridad — PR #22

## Alcance y base

Rama: `codex/calculadora-ux-presupuestos`. Actualizada mediante fast-forward a `dc66894`, que incorpora `main`, antes de modificar archivos. Sin merge adicional a main ni despliegue.

Auditoría inicial reproducida: 21 paquetes afectados (4 críticos, 6 altos, 5 moderados, 6 bajos). Son recuentos de paquetes afectados, no necesariamente 21 fallos independientes.

## Versiones corregidas

| Dependencia | Antes (lockfile) | Después (lockfile) |
| --- | --- | --- |
| Next.js | 16.3.8 | 16.4.3 |
| eslint-config-next | 16.3.3 | 16.4.3 |
| Nodemailer | 10.0.13 | 10.2.1 |
| Zod | 3.25.76 | 4.6.7 |
| Vite | 6.4.3 | 6.4.5 |
| Vitest y sus módulos | 4.1.11 | 4.1.12 |
| body-parser | 1.20.6 | 1.20.9 |
| DOMPurify | 3.4.16 | 3.4.17 |
| follow-redirects | 1.16.0 | 1.16.2 |
| postcss-selector-parser | 6.0.10 | 6.1.5 |
| proxy-addr | 2.0.7 | 2.0.8 |
| sharp | 0.35.4 | 0.35.5 |
| shell-quote | 1.10.0 | 1.12.0 |
| source-map-js | 1.2.1 | 1.2.2 |

El lockfile incluye los binarios y módulos correspondientes a Next, Sharp y Vitest, además de actualizaciones compatibles de chai, fastq y tinyrainbow. No se ejecutó `npm audit fix --force`.

## Compatibilidad evaluada

- **Zod 4 es el único salto mayor directo.** Revisados los dos consumidores: `server/quoteRouter.ts` y `server/_core/systemRouter.ts`. Usan objetos, números, cadenas, enums, `safeParse`, `superRefine`, `issues` y `record` con clave y valor explícitos. No usan `errorMap`, `required_error`, `invalid_type_error`, `.errors` ni los tipos internos eliminados. Los tests verifican cantidades inválidas, mínimos, importes no finitos, payload antiguo y el recorrido calculadora → popup → router → ambas plantillas. No se modifica ningún esquema ni fórmula para hacer pasar la migración.
- **Next sigue en 16 y Vite en 6.** No se activa React Compiler ni se cambian caché, configuración de imágenes, rutas o proxy. Se alinea eslint-config-next con Next.
- **Typography:** npm proponía retroceder a 0.5.4. Se conserva 0.5.19 y se aplica un override limitado a su dependencia `postcss-selector-parser` 6.1.5, dentro de la misma versión mayor del parser. La compilación comprueba su integración con CSS/Tailwind.
- **Streamdown:** no se fuerza la migración 1 → 2 ni KaTeX 0.16 → 0.18 fuera de los rangos de sus consumidores. Los seis avisos bajos restantes corresponden a KaTeX y los paquetes que lo incorporan (mermaid, micromark-extension-math, rehype-katex, remark-math y streamdown). No bloquean el umbral `moderate` existente. Requieren una actualización separada y comprobaciones de renderizado de matemáticas/diagramas; no se consideran resueltos.

Referencias: [migración de Zod 4](https://zod.dev/v4/changelog), [releases oficiales de Next](https://github.com/vercel/next.js/releases), [aviso de KaTeX pendiente](https://github.com/advisories/GHSA-238p-pmpm-9mq7). Los demás avisos y rangos corregidos se obtuvieron directamente de `npm audit --json` y los metadatos del registro npm.

## Corrección de ESLint

`ProductQuoteCalculator.tsx`: se mueve el `useMemo` de fechas inmediatamente después de resolver `categorySlug`, antes de pasar la categoría a otros consumidores. Se mantienen función, argumentos y dependencia. Resuelve `react-hooks/preserve-manual-memoization` sin desactivar la regla ni alterar fechas, precios o payload.

La copia previa se conserva con extensión `.tsx.original` en `calculadora/backup/seguridad-pr22-2026-10-26/`: no se ejecuta como código. No se modifican ESLint, Vitest ni Quality Gate para ocultar resultados.

## Comprobaciones

Primera validación en Node 24.18.0: auditoría al umbral moderate correcta (6 bajos), TypeScript correcto, ESLint 0 errores / 18 advertencias, 286 pruebas superadas / 65 omitidas / 1 fallo esperado preexistente, build Next y Express correctos.

Validación repetida con **Node 20.20.2 / npm 10.9.9**, desde instalación limpia:

| Comprobación | Resultado |
| --- | --- |
| `npm ci --no-audit --no-fund` | Correcto; lockfile reproducible |
| `npm audit --audit-level=moderate` | Exit 0; 0 críticos, 0 altos, 0 moderados, 6 bajos |
| `npm run check` | Exit 0 |
| `npm run lint` | Exit 0; 0 errores y 18 advertencias |
| `npm test` | Exit 0; 39 archivos superados, 11 omitidos; 286 pruebas superadas, 65 omitidas y 1 fallo esperado preexistente |
| `npm run build` | Exit 0; Next 16.4.3, 186/186 páginas generadas |
| `npm run build:server` | Exit 0; bundle Express generado |

No se modificaron scripts, tests ni configuración de CI para conseguir estos resultados. La ejecución remota de GitHub debe consultarse en el PR #22 después del push; estos resultados corresponden a la validación local (macOS), incluida la versión mayor de Node utilizada por CI.

Las advertencias de lint existentes se mantienen visibles. El fallo esperado corresponde a monotonía del sistema de precios, fuera de este lote. La compilación advierte de credenciales locales de Supabase ausentes; no acredita funcionamiento de autenticación ni entrega SMTP real. Las pruebas de email utilizan transporte simulado y no envían a clientes.

## Archivos y exclusiones

- Cambios de ejecución: `package.json`, `package-lock.json`, `src/components/pricing/product-quote/ProductQuoteCalculator.tsx`.
- Informe: este archivo.
- Backups conservados localmente en `calculadora/backup/seguridad-pr22-2026-10-26/` y excluidos de Git.
- Los sitemaps generados por el build reflejan cambios recientes en WordPress. No se incluyen esas actualizaciones de catálogo en el commit de seguridad.
- No se modifican fórmulas, coeficientes, normalización de precios, mejoras procedentes de main ni el umbral del Quality Gate.
