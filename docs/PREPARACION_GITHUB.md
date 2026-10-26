# Preparación para GitHub — 26/10/2026

## Estado

Lote preparado y validado técnicamente en local. No se ha creado commit, hecho push ni desplegado a producción durante esta preparación.

- Remoto configurado: `https://github.com/GUSGUS33/impacto33-gem.git`.
- Rama local actual: `codex/fix-sport-redirect-one-hop`.
- Antes de publicar, conviene crear una rama específica, por ejemplo `codex/calculadora-ux-presupuestos`, comprobar el estado actualizado del remoto y revisar el diff completo.

## Alcance del lote acumulado

- Presentación de la calculadora, resumen, escalas, stock y adaptación móvil.
- Coherencia de importes transmitidos al formulario y a las plantillas de email, validación básica de solicitudes y formato monetario.
- Precio personalizado de cabecera disponible en el HTML inicial mediante la configuración existente.
- Banner de presupuesto, navegación, imágenes y productos relacionados por categoría.
- Tests, especificaciones e informes de auditoría y correcciones.

La corrección final del renderizado de cabecera reutiliza las funciones de precios existentes; no modifica la fórmula, los coeficientes ni los costes de impresión.

## Validaciones realizadas

- Tests: 39 archivos superados, 11 omitidos; 286 pruebas superadas, 65 omitidas y 1 fallo esperado de monotonía de precios ya documentado.
- TypeScript: `npx tsc --noEmit --incremental false`, correcto.
- Build: `next build` y `npm run build:server`, correctos.
- `git diff --check`, correcto.
- Escaneo básico de patrones de credenciales en los 55 archivos candidatos previos a este informe: sin coincidencias. No sustituye una auditoría de secretos completa.
- Prueba de solicitud y plantillas con transporte de email simulado: sin envíos a clientes.

## Exclusiones y conservación

Se han excluido mediante `.gitignore` `calculadora/backup/` y `calculadora/capturas/`. Permanecen en disco; no se ha borrado ningún archivo. El original de `.gitignore` se conserva en `calculadora/backup/preparacion-github-2026-10-26/gitignore-original`.

Se mantienen las especificaciones, los informes y los CSV de auditoría como documentación del proyecto. Los archivos reales de entorno no forman parte del lote; debe revisarse también cualquier archivo nuevo antes de hacer commit.

## Pendiente antes de LIVE

1. QA visual final en móvil real y escritorio. El control del navegador está bloqueado por política en esta sesión; no se declara superada esta comprobación.
2. Comprobación de entrega real del email con una dirección de prueba autorizada. Las pruebas actuales verifican el contenido, no la entrega SMTP.
3. Revisar la configuración de entorno de producción. El build advierte de credenciales de Supabase ausentes en local; no se ha resuelto ni validado la autenticación.
4. Los problemas conocidos del sistema de precios siguen pendientes del rediseño: monotonía, cálculo autoritativo en servidor, redondeos y datos de proveedor. Véanse `calculadora/precios/CORRECCIONES.md` e `INFORME_PRECIOS.md`.

## Secuencia de publicación propuesta

1. Revisar el remoto y crear la rama específica sin perder los cambios locales.
2. Revisar y seleccionar explícitamente los archivos del lote; comprobar el diff staged y los secretos.
3. Crear commit y publicar la rama cuando se autorice la subida.
4. Revisar la PR y sus comprobaciones. La subida a GitHub no autoriza por sí sola el despliegue a Plesk.
5. Resolver o aceptar expresamente los pendientes de LIVE y seguir el despliegue reversible del proyecto.
