# Lote técnico local: categorías y enlaces

## Cambios de este lote

| Archivos | Cambio |
|---|---|
| `src/lib/transactionalPrefetch.ts`, `app/[slug]/page.tsx`, `app/[slug]/[child]/page.tsx` | Precarga en servidor de productos por categoría/etiqueta, IDs y SKU y de páginas hijas/hermanas. Mantiene los índices de bloques y elimina productos duplicados. |
| `TransactionalPageClient.tsx`, `BlockRenderer.tsx`, `ProductosDinamicosBlock.tsx` | Transportan los datos iniciales al grid interactivo. Un fallo cliente no sustituye una lista útil por un panel de error. Se aceptan bloques configurados solo con etiqueta. |
| `useFilteredProducts.ts`, `useChildPages.ts` | Usan datos del servidor durante la carga cliente. El grid sustituye los productos iniciales cuando todas sus consultas terminan correctamente. |
| `HeroSlider.tsx` | Un solo H1, en la primera diapositiva con título. Las siguientes usan H2 con las mismas clases visuales. |
| `GridCategorias.tsx`, `InterlinkingBlock.tsx`, `ProductosDinamicosBlock.tsx` | Normalización de enlaces internos sin barra final. |
| `CategoriesCarousel.tsx` | Actualiza los enlaces de Deporte y Mascotas a destinos publicados con HTTP 200. |
| `scripts/audit-internal-links.mjs` | Auditoría HTTP de enlaces presentes en el HTML de las páginas indicadas. Guarda origen, texto del enlace, destino, estado y redirección/error. |
| `transactionalPrefetch.test.ts`, `useFilteredProducts.server.test.tsx` | Seis pruebas de prioridad manual, deduplicación, navegación, fallback y actualización de resultados. |

Los cambios previos de 404/sitemaps y schemas ya presentes en el directorio no deben confundirse con este lote. Se han conservado. No se ha hecho commit ni despliegue.

## Resultados

- `npm run check`: correcto.
- `npm test`: 235 pruebas correctas, 65 omitidas; 28 archivos correctos, 11 omitidos.
- `git diff --check`: correcto.
- Compilación intermedia de producción con webpack: correcta. Verificación HTML: portada con un H1; categoría madre con 20 enlaces únicos a productos; subcategoría con 23. HTTP 200 y sin “Cargando” ni skeleton en esas respuestas.
- Auditoría de tres páginas origen: 205 destinos comprobados; ver `internal-links-audit.json`. Es un registro previo a normalizar barras finales. Los timeouts no equivalen a 404.

La información que requiere edición o decisión en WordPress está en `tareas-manuales-seo.md`.

## Incidencia transitoria y cierre de la verificación final

La última compilación compiló JavaScript y superó TypeScript, pero varias páginas agotaron los 60 segundos durante la generación. Una consulta mínima independiente a `https://creativu.es/graphql` también agotó 15 segundos sin recibir datos (curl 28, HTTP 000). Se detuvo la compilación antes de seguir reintentando.

Tras reintentar, GraphQL respondió HTTP 200 en 1,704 segundos. La compilación final `next build --webpack` terminó con código 0 y generó 186/186 páginas (85 segundos de generación). No se puede atribuir el timeout anterior a una caída general de WordPress: pudo ser transitorio o de conectividad desde este entorno.

Comprobaciones de la compilación final con `next start` en 3400:

| Ruta | HTTP | H1 | Destinos únicos de producto en HTML |
|---|---|---|---|
| `/` | 200 | 1 | 14 |
| `/camisetas-personalizadas` | 200 | 1 | 20 |
| `/camisetas-personalizadas/camisetas-manga-corta` | 200 | 1 | 23 |
| `/sector/hosteleria-y-restauracion` | 200 | 1 | 0 |
| `/producto/mascara-antifaz-de-viaje-en-microfibra-para-descanso-y-confort` | 200 | 1 | 4 |
| `/servicios/no-existe-validacion-final` | 404 | 0 | 0 |

Ninguna de esas respuestas contenía “Cargando” ni `animate-pulse`. El sector no tiene enlaces de ficha en esta muestra: enlaza categorías. Se observan todavía canonicals con barra final en la subcategoría y el sector, mientras los enlaces normalizados no llevan barra; queda registrado para homogeneizar en la revisión SEO, sin atribuirlo a este cambio del grid. No se ha desplegado ni hecho commit.
