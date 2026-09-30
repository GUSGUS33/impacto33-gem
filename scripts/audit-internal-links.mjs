import fs from 'node:fs';
import { JSDOM } from 'jsdom';

// Read-only HTTP audit; writes only its local report. Missing sitemap entries
// are not assumed to be broken: each destination is checked separately.
const base = process.env.AUDIT_BASE || 'http://127.0.0.1:3400';
const sources = process.argv.slice(2);
if (!sources.length) throw new Error('Indica las rutas origen que quieres auditar.');
const checks = new Map();
const findings = [];
const sourceErrors = [];
for (const source of sources) {
  const response = await fetch(new URL(source, base), { signal: AbortSignal.timeout(30000) });
  if (!response.ok) { sourceErrors.push({ source, status: response.status }); continue; }
  const doc = new JSDOM(await response.text()).window.document;
  const links = new Map();
  for (const anchor of doc.querySelectorAll('a[href]')) {
    const raw = anchor.getAttribute('href');
    if (!raw || raw.startsWith('#')) continue;
    let url;
    try { url = new URL(raw, 'https://impacto33.com' + source); } catch { continue; }
    if (!['impacto33.com', 'www.impacto33.com', new URL(base).hostname].includes(url.hostname)) continue;
    if (!['http:', 'https:'].includes(url.protocol)) continue;
    const target = url.pathname + url.search;
    links.set(target, anchor.textContent.trim().replace(/\s+/g, ' '));
  }
  for (const [target, label] of links) {
    if (!checks.has(target)) {
      try {
        const r = await fetch(new URL(target, base), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
        checks.set(target, { status: r.status, location: r.headers.get('location') });
        await r.body?.cancel();
      } catch (error) { checks.set(target, { status: null, error: error.message }); }
    }
    const result = checks.get(target);
    if (result.status !== 200) findings.push({ source, label, target, ...result });
  }
}
const report = { base, sources, checkedTargets: checks.size, sourceErrors, findings };
fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/internal-links-audit.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
