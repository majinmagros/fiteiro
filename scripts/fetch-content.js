#!/usr/bin/env node
// scripts/fetch-content.js
// Build-time content fetcher via 9Router web/fetch
// Usage: node scripts/fetch-content.js
// Requires: NINEROUTER_URL, NINEROUTER_KEY env vars
// Generates: data/exhibitions.json, data/artists.json

import { config } from 'dotenv';
config({ path: '.env' });

const NINEROUTER_URL = process.env.NINEROUTER_URL || 'http://localhost:20128';
const NINEROUTER_KEY = process.env.NINEROUTER_KEY;

if (!NINEROUTER_KEY) {
  console.error('❌ NINEROUTER_KEY não definido. Configure no .env ou variáveis de ambiente.');
  process.exit(1);
}

const FETCH_ENDPOINT = `${NINEROUTER_URL}/v1/web/fetch`;
const DEFAULT_MODEL = 'fetch-combo';

import fs from 'fs';
import path from 'path';

// URLs to fetch — adicione conforme necessário
const SOURCES = {
  exhibitions: [
    { id: 'mercosul-2009', url: 'https://www.bienaldemercosul.org.br/2009/', label: 'Bienal do Mercosul 2009' },
    { id: 'utopics-2009', url: 'https://utopics.org/', label: 'Utopics 2009' },
    { id: 'medialab-2010', url: 'https://medialab.usp.br/', label: 'Medialab 2010' },
    { id: 'art-for-world', url: 'https://artfortheworld.net/', label: 'ART for the World' },
  ],
  artists: [
    // Exemplo: { id: 'fabiana-barros', url: 'https://...', label: 'Fabiana de Barros' },
  ],
};

async function fetchVia9Router(url, model = DEFAULT_MODEL) {
  const body = JSON.stringify({ model, url, format: 'markdown', max_characters: 8000 });
  const res = await fetch(FETCH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NINEROUTER_KEY}`,
      'Content-Type': 'application/json',
    },
    body,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`9Router fetch falhou (${res.status}): ${err}`);
  }
  const json = await res.json();
  return json;
}

function extractTitleAndExcerpt(markdown, fallbackTitle) {
  const lines = markdown.trim().split('\n');
  let title = fallbackTitle;
  let excerpt = '';
  for (const line of lines) {
    if (line.startsWith('# ')) {
      title = line.slice(2).trim();
      continue;
    }
    if (!excerpt && line.trim() && !line.startsWith('#') && !line.startsWith('![')) {
      excerpt = line.trim().slice(0, 200);
    }
  }
  return { title, excerpt };
}

async function processCategory(category, sources) {
  console.log(`\n📥 Buscando ${category} (${sources.length} fontes)...`);
  const results = [];
  for (const src of sources) {
    try {
      console.log(`  → ${src.label}: ${src.url}`);
      const data = await fetchVia9Router(src.url);
      const markdown = data.content?.text || '';
      const { title, excerpt } = extractTitleAndExcerpt(markdown, src.label);
      results.push({
        id: src.id,
        label: src.label,
        url: src.url,
        title,
        excerpt,
        markdown,
        fetchedAt: new Date().toISOString(),
        provider: data.provider,
      });
      console.log(`    ✅ ${markdown.length} chars (provider: ${data.provider})`);
    } catch (e) {
      console.error(`    ❌ ${src.label}: ${e.message}`);
      results.push({
        id: src.id,
        label: src.label,
        url: src.url,
        error: e.message,
        fetchedAt: new Date().toISOString(),
      });
    }
  }
  return results;
}

async function main() {
  console.log('🚀 Iniciando fetch de conteúdo via 9Router...');
  console.log(`   Endpoint: ${FETCH_ENDPOINT}`);

  const [exhibitions, artists] = await Promise.all([
    processCategory('exhibitions', SOURCES.exhibitions),
    processCategory('artists', SOURCES.artists),
  ]);

  const output = {
    generatedAt: new Date().toISOString(),
    exhibitions,
    artists,
  };

  await fs.promises.writeFile(
    path.resolve('./data/exhibitions.json'),
    JSON.stringify({ generatedAt: output.generatedAt, items: exhibitions }, null, 2)
  );
  await fs.promises.writeFile(
    path.resolve('./data/artists.json'),
    JSON.stringify({ generatedAt: output.generatedAt, items: artists }, null, 2)
  );

  console.log('\n✅ Concluído!');
  console.log(`   data/exhibitions.json: ${exhibitions.length} itens`);
  console.log(`   data/artists.json: ${artists.length} itens`);
}

main().catch((e) => {
  console.error('❌ Erro fatal:', e);
  process.exit(1);
});