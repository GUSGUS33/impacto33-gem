# Flujo seguro para ZIP de Google AI Studio Builder

El repositorio local y GitHub son la fuente canónica del proyecto. Un ZIP generado por Builder se considera una propuesta de cambios, nunca una copia lista para sobrescribir el proyecto.

## Revisión automática

Ejecutar desde la raíz del proyecto:

```bash
npm run builder:review -- /ruta/al/impacto33-b2b-ecommerce.zip
```

El comando:

1. valida las rutas internas del ZIP;
2. lo extrae en un directorio temporal fuera del proyecto;
3. compara hashes contra la versión canónica;
4. detecta archivos sensibles, secretos, enlaces simbólicos e imágenes corruptas;
5. avisa de regresiones de dependencias, archivos protegidos ausentes y referencias de AI Studio;
6. genera un informe en `.builder-reviews/`, carpeta excluida de Git;
7. elimina únicamente su extracción temporal y nunca modifica el proyecto.

Un estado `BLOQUEADO` no significa que todo el ZIP sea inútil. Significa que no se puede integrar en bloque y que deben seleccionarse manualmente los archivos correspondientes a la tarea solicitada.

## Integración

1. Solicitar a Builder una sola tarea concreta.
2. Exportar un ZIP al terminar esa tarea.
3. Ejecutar el verificador.
4. Revisar el informe y el diff de los archivos esperados.
5. Integrar únicamente los cambios aprobados mediante un commit o rama específica.
6. Regenerar los lockfiles localmente si cambia `package.json`; no copiar lockfiles antiguos sin comprobarlos.
7. Ejecutar `npm run check`, `npm test`, `npm run lint` y `npm run build`.
8. Confirmar el resultado con `npm audit --omit=dev` cuando cambien dependencias.

## Reglas de protección

- No descomprimir un ZIP directamente sobre el repositorio.
- No copiar el proyecto completo desde Builder.
- No aceptar `.env`, claves privadas, `node_modules`, `.next` ni `.git` desde el ZIP.
- No eliminar archivos locales porque falten en Builder sin autorización explícita.
- Mantener un commit limpio antes de iniciar cada tarea de Builder.
