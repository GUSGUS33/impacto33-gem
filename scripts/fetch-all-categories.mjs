import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, '../all_categories_full.json');
const GRAPHQL_URL = 'https://creativu.es/graphql';

async function fetchCategories(after = null) {
  const query = `
    query getCategories($after: String) {
      productCategories(first: 100, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          slug
        }
      }
    }
  `;

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { after } }),
  });

  const result = await response.json();
  return result.data.productCategories;
}

async function main() {
  console.log('🚀 Iniciando descarga completa de categorías...');
  let allCategories = [];
  let hasNextPage = true;
  let cursor = null;

  while (hasNextPage) {
    console.log(`📥 Descargando página... (Cursor: ${cursor || 'Inicio'})`);
    try {
      const data = await fetchCategories(cursor);
      const nodes = data.nodes;
      allCategories = [...allCategories, ...nodes];
      
      hasNextPage = data.pageInfo.hasNextPage;
      cursor = data.pageInfo.endCursor;
      
      console.log(`✅ Recibidos ${nodes.length} categorías. Total acumulado: ${allCategories.length}`);
    } catch (error) {
      console.error('❌ Error en la descarga:', error);
      break;
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allCategories, null, 2));
  console.log(`💾 Guardado exitoso en ${OUTPUT_PATH}`);
  console.log(`🎉 Total final de categorías: ${allCategories.length}`);
}

main();
