#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const workspace = resolve(scriptDir, "..");
const zipArgument = process.argv[2];

if (!zipArgument) {
  console.error("Uso: npm run builder:review -- /ruta/al/proyecto.zip");
  process.exit(1);
}

const zipPath = resolve(zipArgument);
if (!existsSync(zipPath) || !statSync(zipPath).isFile()) {
  console.error(`No se encontró el ZIP: ${zipPath}`);
  process.exit(1);
}

const ignoredDirectories = new Set([
  ".builder-reviews",
  ".git",
  ".next",
  ".pnpm-store",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const textExtensions = new Set([
  ".cjs", ".css", ".env", ".example", ".html", ".js", ".json", ".jsonc",
  ".jsx", ".md", ".mjs", ".mts", ".sql", ".svg", ".toml", ".ts", ".tsx",
  ".txt", ".yaml", ".yml",
]);
const imageExtensions = new Set([".gif", ".ico", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const requiredLocalFiles = [
  ".htaccess",
  "public/favicon.ico",
  "public/site.webmanifest",
];

function normalizeArchivePath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function extension(path) {
  const name = basename(path).toLowerCase();
  const position = name.lastIndexOf(".");
  return position === -1 ? "" : name.slice(position);
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function walkFiles(root) {
  const files = new Map();
  const symlinks = [];

  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
      const absolute = join(directory, entry.name);
      const key = relative(root, absolute).split(sep).join("/");
      const stats = lstatSync(absolute);
      if (stats.isSymbolicLink()) {
        symlinks.push(key);
      } else if (stats.isDirectory()) {
        visit(absolute);
      } else if (stats.isFile()) {
        files.set(key, { absolute, hash: sha256(absolute), size: stats.size });
      }
    }
  }

  visit(root);
  return { files, symlinks };
}

function isValidImage(path) {
  const ext = extension(path);
  const data = readFileSync(path);
  if (data.length === 0) return false;
  if (ext === ".png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === ".jpg" || ext === ".jpeg") return data[0] === 0xff && data[1] === 0xd8 && data.at(-2) === 0xff && data.at(-1) === 0xd9;
  if (ext === ".gif") return data.subarray(0, 6).toString("ascii") === "GIF87a" || data.subarray(0, 6).toString("ascii") === "GIF89a";
  if (ext === ".webp") return data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  if (ext === ".ico") return data.length >= 4 && data[0] === 0 && data[1] === 0 && data[2] === 1 && data[3] === 0;
  if (ext === ".svg") return /<svg(?:\s|>)/i.test(data.subarray(0, 64 * 1024).toString("utf8"));
  return true;
}

function readText(path) {
  const stats = statSync(path);
  if (stats.size > 2 * 1024 * 1024 || !textExtensions.has(extension(path))) return null;
  const contents = readFileSync(path, "utf8");
  return contents.includes("\0") ? null : contents;
}

function formatList(items, limit = 150) {
  if (items.length === 0) return "- Ninguno";
  const visible = items.slice(0, limit).map(item => `- \`${item}\``);
  if (items.length > limit) visible.push(`- … y ${items.length - limit} elementos más`);
  return visible.join("\n");
}

function dependencyChanges(currentPackage, builderPackage) {
  const changes = [];
  for (const section of ["dependencies", "devDependencies"]) {
    const current = currentPackage[section] ?? {};
    const incoming = builderPackage[section] ?? {};
    const names = [...new Set([...Object.keys(current), ...Object.keys(incoming)])].sort();
    for (const name of names) {
      if (current[name] !== incoming[name]) {
        changes.push(`${section}.${name}: ${current[name] ?? "∅"} → ${incoming[name] ?? "∅"}`);
      }
    }
  }
  return changes;
}

let temporaryDirectory;
let exitCode = 0;

try {
  const rawEntries = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const entries = rawEntries.split(/\r?\n/).filter(Boolean).map(normalizeArchivePath);
  const unsafePaths = entries.filter(entry => {
    const parts = entry.split("/");
    return entry.startsWith("/") || /^[A-Za-z]:\//.test(entry) || parts.includes("..") || entry.includes("\0");
  });
  if (entries.length > 50_000) unsafePaths.push(`Demasiadas entradas: ${entries.length}`);
  if (unsafePaths.length > 0) {
    console.error("ZIP rechazado por rutas inseguras:\n" + formatList(unsafePaths));
    process.exit(2);
  }

  temporaryDirectory = mkdtempSync(join(tmpdir(), "impacto33-builder-review-"));
  execFileSync("unzip", ["-qq", zipPath, "-d", temporaryDirectory], { stdio: "pipe" });

  const extractedEntries = readdirSync(temporaryDirectory, { withFileTypes: true });
  const extractedFilesAtRoot = extractedEntries.filter(entry => !entry.isDirectory());
  const extractedDirectories = extractedEntries.filter(entry => entry.isDirectory());
  const builderRoot = extractedFilesAtRoot.length === 0 && extractedDirectories.length === 1
    ? join(temporaryDirectory, extractedDirectories[0].name)
    : temporaryDirectory;

  const resolvedBuilderRoot = realpathSync(builderRoot);
  if (!resolvedBuilderRoot.startsWith(realpathSync(temporaryDirectory) + sep) && resolvedBuilderRoot !== realpathSync(temporaryDirectory)) {
    throw new Error("La raíz extraída escapa del directorio temporal.");
  }

  const current = walkFiles(workspace);
  const incoming = walkFiles(builderRoot);
  const added = [];
  const modified = [];
  const missing = [];

  for (const [path, file] of incoming.files) {
    if (!current.files.has(path)) added.push(path);
    else if (current.files.get(path).hash !== file.hash) modified.push(path);
  }
  for (const path of current.files.keys()) {
    if (!incoming.files.has(path)) missing.push(path);
  }
  added.sort();
  modified.sort();
  missing.sort();

  const blockers = [];
  const warnings = [];
  const dangerousArchiveFiles = [...incoming.files.keys()].filter(path => {
    const parts = path.split("/");
    const name = basename(path).toLowerCase();
    return parts.some(part => [".git", ".next", "node_modules"].includes(part))
      || (/^\.env(?:\.|$)/.test(name) && name !== ".env.example")
      || /\.(?:key|p12|pfx|pem)$/i.test(name);
  });
  blockers.push(...dangerousArchiveFiles.map(path => `Archivo sensible o generado incluido: ${path}`));
  blockers.push(...incoming.symlinks.map(path => `Enlace simbólico no permitido: ${path}`));

  const corruptedImages = [];
  const aiStudioReferences = [];
  const suspectedSecrets = [];
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\bgh[oprs]_[A-Za-z0-9]{30,}\b/,
    /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/,
  ];

  for (const [path, file] of incoming.files) {
    if (imageExtensions.has(extension(path)) && !isValidImage(file.absolute)) corruptedImages.push(path);
    const text = readText(file.absolute);
    if (text === null) continue;
    if (/google ai studio|aistudio\.google\.com|dev:studio/i.test(text)) aiStudioReferences.push(path);
    if (basename(path) !== ".env.example" && secretPatterns.some(pattern => pattern.test(text))) suspectedSecrets.push(path);
  }
  blockers.push(...corruptedImages.map(path => `Imagen inválida o corrupta: ${path}`));
  blockers.push(...suspectedSecrets.map(path => `Posible secreto incrustado: ${path}`));
  warnings.push(...aiStudioReferences.map(path => `Referencia de AI Studio: ${path}`));

  const routerFiles = ["package.json", "package-lock.json", "pnpm-lock.yaml", "bun.lock"]
    .filter(path => incoming.files.has(path))
    .filter(path => /react-router(?:-dom)?/i.test(readFileSync(incoming.files.get(path).absolute, "utf8")));
  blockers.push(...routerFiles.map(path => `React Router reaparece en ${path}`));

  for (const path of requiredLocalFiles) {
    if (current.files.has(path) && !incoming.files.has(path)) warnings.push(`El ZIP no contiene el archivo local protegido: ${path}`);
  }

  let dependencies = [];
  if (current.files.has("package.json") && incoming.files.has("package.json")) {
    try {
      const currentPackage = JSON.parse(readFileSync(current.files.get("package.json").absolute, "utf8"));
      const builderPackage = JSON.parse(readFileSync(incoming.files.get("package.json").absolute, "utf8"));
      dependencies = dependencyChanges(currentPackage, builderPackage);
      for (const protectedDependency of ["next", "react-day-picker"]) {
        const localVersion = currentPackage.dependencies?.[protectedDependency];
        const incomingVersion = builderPackage.dependencies?.[protectedDependency];
        if (localVersion && incomingVersion && localVersion !== incomingVersion) {
          warnings.push(`Versión distinta de ${protectedDependency}: local ${localVersion}, ZIP ${incomingVersion}`);
        }
      }
    } catch (error) {
      blockers.push(`package.json no se pudo analizar: ${error.message}`);
    }
  } else {
    blockers.push("El ZIP no contiene package.json en la raíz del proyecto.");
  }

  blockers.sort();
  warnings.sort();
  dependencies.sort();
  corruptedImages.sort();
  aiStudioReferences.sort();

  const status = blockers.length > 0 ? "BLOQUEADO: requiere revisión manual" : "APTO PARA REVISIÓN MANUAL";
  const timestamp = new Date().toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
  const reportDirectory = join(workspace, ".builder-reviews");
  mkdirSync(reportDirectory, { recursive: true });
  const reportPath = join(reportDirectory, `${basename(zipPath, ".zip")}-${timestamp}.md`);
  const report = `# Revisión de ZIP de Builder

- Estado: **${status}**
- ZIP: \`${zipPath}\`
- Proyecto comparado: \`${workspace}\`
- Fecha: ${new Date().toISOString()}
- Archivos del proyecto en ZIP: ${incoming.files.size}
- Añadidos por Builder: ${added.length}
- Modificados por Builder: ${modified.length}
- Presentes solo en local: ${missing.length}

> Este informe es de solo lectura. Ningún archivo del ZIP se ha integrado automáticamente.

## Bloqueos

${formatList(blockers)}

## Advertencias

${formatList(warnings)}

## Cambios de dependencias

${formatList(dependencies)}

## Archivos modificados

${formatList(modified)}

## Archivos añadidos por Builder

${formatList(added)}

## Archivos presentes solo en local

${formatList(missing)}
`;
  writeFileSync(reportPath, report, "utf8");

  console.log(`Estado: ${status}`);
  console.log(`Informe: ${reportPath}`);
  console.log(`Cambios: ${modified.length} modificados, ${added.length} añadidos, ${missing.length} solo locales`);
  console.log(`Bloqueos: ${blockers.length}; advertencias: ${warnings.length}`);
  exitCode = blockers.length > 0 ? 2 : 0;
} catch (error) {
  console.error(`No se pudo revisar el ZIP: ${error.message}`);
  exitCode = 1;
} finally {
  if (temporaryDirectory && temporaryDirectory.startsWith(tmpdir() + sep)) {
    rmSync(temporaryDirectory, { recursive: true, force: true });
  }
}

process.exit(exitCode);
