import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://impacto33.com';
const GRAPHQL_URL = 'https://creativu.es/graphql';
const PRODUCTS_PER_PAGE = 100;

// GraphQL query to fetch all products with pagination
const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        slug
        name
        ... on SimpleProduct {
          price
          modified
          productCategories {
            nodes {
              slug
            }
          }
        }
        ... on VariableProduct {
          price
          modified
          productCategories {
            nodes {
              slug
            }
          }
        }
        image {
          sourceUrl
        }
      }
    }
  }
`;

// Function to fetch products from GraphQL API
async function fetchAllProducts() {
  const allProducts = [];
  let hasNextPage = true;
  let afterCursor = null;
  let pageCount = 0;

  console.log('🔄 Fetching products from WooCommerce GraphQL API...');

  while (hasNextPage) {
    pageCount++;
    console.log(`   Fetching page ${pageCount}...`);

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: GET_ALL_PRODUCTS_QUERY,
          variables: {
            first: PRODUCTS_PER_PAGE,
            after: afterCursor,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        throw new Error('GraphQL query failed');
      }

      const products = data.data?.products?.nodes || [];
      const pageInfo = data.data?.products?.pageInfo || {};

      allProducts.push(...products);
      hasNextPage = pageInfo.hasNextPage;
      afterCursor = pageInfo.endCursor;

      console.log(`   Found ${products.length} products (Total: ${allProducts.length})`);

      // Small delay to avoid rate limiting
      if (hasNextPage) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error fetching page ${pageCount}:`, error.message);
      hasNextPage = false;
    }
  }

  return allProducts;
}

// Function to generate product sitemap XML
function generateProductSitemap(products) {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  products.forEach(product => {
    if (!product.slug) return;

    // Get last modified date or use today
    const lastMod = product.modified 
      ? new Date(product.modified).toISOString().split('T')[0]
      : today;

    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}/producto/${product.slug}</loc>\n`;
    xml += `    <lastmod>${lastMod}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';

    // Add product image if available
    if (product.image?.sourceUrl) {
      xml += '    <image:image>\n';
      xml += `      <image:loc>${product.image.sourceUrl}</image:loc>\n`;
      xml += `      <image:title>${escapeXml(product.name)}</image:title>\n`;
      xml += '    </image:image>\n';
    }

    xml += '  </url>\n';
  });

  xml += '</urlset>';

  return xml;
}

// Function to escape XML special characters
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Function to generate sitemap index
function generateSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  
  xml += '  <sitemap>\n';
  xml += `    <loc>${BASE_URL}/sitemap.xml</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  xml += '  <sitemap>\n';
  xml += `    <loc>${BASE_URL}/sitemap-products.xml</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += '  </sitemap>\n';
  
  xml += '</sitemapindex>';

  return xml;
}

// Main execution
async function main() {
  console.log('🚀 Starting product sitemap generation...\n');

  // Fetch all products
  const products = await fetchAllProducts();

  if (products.length === 0) {
    console.log('⚠️  No products found. Sitemap will be empty.');
  }

  // Generate product sitemap
  console.log('\n📝 Generating sitemap-products.xml...');
  const productSitemap = generateProductSitemap(products);

  // Generate sitemap index
  console.log('📝 Generating sitemap-index.xml...');
  const sitemapIndex = generateSitemapIndex();

  // Write files to public directory
  const publicDir = path.join(__dirname, 'client/public');

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(path.join(publicDir, 'sitemap-products.xml'), productSitemap);
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), sitemapIndex);

  console.log('\n✅ Sitemaps generated successfully!');
  console.log(`   - sitemap-products.xml: ${products.length} product URLs`);
  console.log(`   - sitemap-index.xml: Index file linking all sitemaps`);
  console.log(`\n📍 Files saved to: ${publicDir}`);
}

main().catch(console.error);
