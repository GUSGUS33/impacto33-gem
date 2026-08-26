import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DYNAMIC_BLOCKS_PATH = path.join(__dirname, '../client/src/data/dynamic-blocks.json');
const GRAPHQL_URL = 'https://creativu.es/graphql';

async function fetchAllCategories() {
  const fullCategoriesPath = path.join(__dirname, '../all_categories_full.json');
  if (fs.existsSync(fullCategoriesPath)) {
    return JSON.parse(fs.readFileSync(fullCategoriesPath, 'utf-8'));
  }
  return [];
}

async function monitorSlugs() {
  console.log('🔍 Iniciando auditoría de slugs...');
  
  // 1. Cargar configuración local
  const dynamicBlocks = JSON.parse(fs.readFileSync(DYNAMIC_BLOCKS_PATH, 'utf-8'));
  console.log(`📂 Cargados ${dynamicBlocks.length} bloques dinámicos.`);

  // 2. Obtener categorías reales de la API
  const realCategories = await fetchAllCategories();
  const realSlugs = new Set(realCategories.map(c => c.slug));
  console.log(`🌐 Obtenidas ${realCategories.length} categorías reales de la API.`);

  // 3. Validar
  const errors = [];
  const warnings = [];

  dynamicBlocks.forEach(block => {
    const slug = block.catalog_category_slug;
    
    // Error: Slug no existe en la API
    if (!realSlugs.has(slug)) {
      errors.push(`❌ ERROR: El slug '${slug}' (usado en ${block.url}) NO existe en la API.`);
    }

    // Warning: Uso de slugs genéricos sospechosos
    if (slug === 't_shirts' && !block.url.includes('camisetas')) {
      warnings.push(`⚠️ WARNING: Uso genérico de 't_shirts' en ${block.url}. Considera buscar un slug más específico.`);
    }
  });

  // 4. Reporte
  console.log('\n--- REPORTE DE AUDITORÍA ---');
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Todo perfecto. Todos los slugs son válidos y específicos.');
  } else {
    if (errors.length > 0) {
      console.log('\nERRORES CRÍTICOS (Slugs inválidos):');
      errors.forEach(e => console.log(e));
    }
    if (warnings.length > 0) {
      console.log('\nADVERTENCIAS (Slugs genéricos):');
      warnings.forEach(w => console.log(w));
    }
  }
}

monitorSlugs();
