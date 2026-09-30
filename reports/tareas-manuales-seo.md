# Tareas manuales y trabajo técnico — 29/09/2026

Estado: cambios locales pendientes de revisión. No hay despliegue ni commit de este lote.

## Lo que debes hacer en WordPress

Estas cuatro páginas existen, pero el inventario no encuentra el H1 en `heroPageSeo.tituloPrincipal`. Por eso el filtro de calidad las ha excluido del sitemap. Exclusión del sitemap no equivale a 404 ni a noindex.

| Página | Acción concreta | H1 sugerido para revisar |
|---|---|---|
| `/camisetas-personalizadas/camisetas-tecnicas` | Editar la página en WordPress → bloque Hero SEO → título principal. Revisar también introducción y categoría de productos. | Camisetas técnicas personalizadas |
| `/chaquetas-personalizadas/chaquetas-horeca-cocina` | Completar título principal, introducción y selección de productos adecuados para cocina. | Chaquetas de cocina personalizadas |
| `/sudaderas-personalizadas/sudaderas-para-empresas` | Completar título principal y una introducción específica para pedidos corporativos. | Sudaderas personalizadas para empresas |
| `/sudaderas-personalizadas/sudaderas-alta-visibilidad-2` | Comparar con `/sudaderas-personalizadas/sudaderas-alta-visibilidad` antes de redactar. Decidir si tiene una intención distinta o es un duplicado. | Pendiente de esa decisión |

No cambies slugs de las tres primeras para completar sus campos. Sus enlaces del menú pueden conservarse si se termina el contenido. Para la cuarta, si confirmas que es duplicada, yo prepararé el 301 y actualizaré los enlaces; no hace falta borrar la página ahora.

## Decisiones sobre enlaces y categorías

Primera corrección manual comprobada:

| Página origen | Elemento | Enlace actual | Cambiar por |
|---|---|---|---|
| `/camisetas-personalizadas` | Interlink “Polos personalizados para empresas y eventos” | `/polos-personalizadas/` | `/polos-personalizados` |

El destino correcto devuelve HTTP 200. El enlace actual redirige primero para quitar la barra y su destino agotó el tiempo de espera; no se le atribuye un 404 sin respuesta comprobada. Busca el elemento en los bloques ACF de interlinking o HTML de esa página y corrige la errata.

En `/sector/hosteleria-y-restauracion`, la tarjeta “Chaquetas para hostelería” enlaza a `/chaquetas-horeca`, que agotó dos comprobaciones. Antes de sustituirlo, completa la página `/chaquetas-personalizadas/chaquetas-horeca-cocina` indicada arriba y confirma que cubre esa oferta; entonces usa esa URL en el enlace de la tarjeta. La tarjeta de pantalones apunta a `/pantalones-horeca`, que en la segunda comprobación devolvió 200, H1 específico e index/follow: no se recomienda modificarla por el primer timeout.

Los siguientes enlaces están en el carrusel del área privada (`/inicio`, componente CategoriesCarousel), no se han identificado como enlaces del carrusel público de la portada. Los cambios de código los haré yo; estas decisiones son tuyas.

| Enlace actual | Destino candidato | Decisión necesaria |
|---|---|---|
| `/deporte-personalizado` | `/deportes-personalizados` | Corregido en código local tras comprobar HTTP 200. Sin tarea manual. |
| `/mascotas-personalizadas` | `/accesorios-para-mascotas-personalizados` | Corregido en código local tras comprobar HTTP 200. Sin tarea manual. |
| `/monos-personalizados` | `/vestuario-laboral/monos-industria` | Confirmar si “Monos” se refiere a industria; también existe `/vestuario-laboral/monos-ignifugos`. |
| `/papeleria-personalizada` | `/escritura-personalizada` | Confirmar si ambas tarjetas deben agruparse: el carrusel ya incluye “Escritura”. |
| `/accesorios-viaje` | Sin equivalente general confirmado | Decidir si se crea la categoría. `/bolsas-personalizadas/bolsas-viaje` solo cubre bolsas, no todos los accesorios. |

El informe de exclusiones contiene 106 rutas de inventarios antiguos que no figuran como páginas publicadas. No significa que haya 106 enlaces rotos visibles ni que debas crear 106 páginas. Los JSON históricos de categorías tampoco demuestran que una ruta esté en uso. El auditor `scripts/audit-internal-links.mjs` comprueba enlaces presentes en HTML y su respuesta HTTP; el detalle queda en `reports/internal-links-audit.json`.

Para cualquier interlink almacenado en WordPress: editar la página origen → bloque de interlinking/hubs/HTML o menú → sustituir solo la URL confirmada, conservando un texto de enlace coherente. No hacer sustituciones masivas de slugs por parecido.

## Información que debes confirmar

- Precios comerciales: qué incluye cada “desde” (cantidad, impresión e IVA). Yo ajustaré la presentación técnica cuando esos datos estén confirmados.
- Datos de empresa: dirección que se puede publicar, teléfono, correo y perfiles oficiales. No inventar direcciones de talleres ni reseñas para completar schemas.
- Nuevas páginas: avísame cuando publiques nuevos slugs. La lista cerrada del build requiere regeneración para que se sirvan; los sitemaps locales también se regeneran en build.
- Search Console y redirecciones de URLs antiguas: mantienes la gestión que ya asumiste. Después del despliegue revisaremos una URL real y una inexistente antes de pedir validación.

## Lo que hago yo en código

- Precargar productos y navegación de categorías en el servidor, manteniendo las interacciones del navegador.
- Conservar los productos precargados si falla la consulta posterior y permitir que datos nuevos sustituyan los iniciales cuando la consulta tiene éxito.
- Dejar un solo H1 en el carrusel de portada, sin cambiar sus textos ni apariencia.
- Auditar enlaces internos con respuestas HTTP reales y separar redirecciones, 404 y fallos temporales.
- Normalizar barras finales en el grid de categorías de portada, navegación del grid de productos y bloque de interlinking. Corregir las dos equivalencias de Deporte y Mascotas en el carrusel privado.
- Mantener el lote previo de 404 reales y sitemaps para revisión conjunta. El despliegue seguirá el procedimiento manual de Plesk cuando lo autorices.

## Comprobación realizada antes de esta entrega

La compilación local de producción con webpack terminó correctamente. En el HTML inicial se observó: portada 200 con 1 H1; `/camisetas-personalizadas` 200 con 20 destinos de producto; `/camisetas-personalizadas/camisetas-manga-corta` 200 con 23 destinos de producto. Las tres respuestas no contenían “Cargando” ni `animate-pulse`. El recuento es de enlaces únicos de toda la página, no exclusivamente del grid.

Limitaciones: estos resultados son una muestra local, no una garantía de indexación ni una auditoría visual completa de todas las categorías. Una caída de WordPress aún puede impedir obtener datos; debe comprobarse también en producción tras el futuro despliegue.

La auditoría inicial recorrió tres páginas origen y comprobó 205 destinos distintos. Su JSON conserva los resultados previos a la normalización de barras finales para poder rastrear cada hallazgo. Los timeouts son incidencias de comprobación, no códigos 404. Las comprobaciones posteriores de este documento aclaran los destinos recuperados.

Actualización de cierre (30/09): la revisión final supera 235 pruebas y TypeScript. Tras recuperar la respuesta de GraphQL, la compilación final terminó correctamente (186/186 páginas) y se comprobaron portada, categorías, sector y producto con HTTP 200, un H1 y sin skeletons; una ruta de servicio inventada respondió 404. Los detalles están en `lote-tecnico-local.md`. No se ha desplegado.
