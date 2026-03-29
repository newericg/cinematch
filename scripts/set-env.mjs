/**
 * Injeta variáveis de ambiente no environment.prod.ts antes do build.
 * Usado pelo Cloudflare Pages via: npm run build:cf
 *
 * Variáveis esperadas:
 *   TMDB_API_KEY   — chave da API do TMDB (obrigatória)
 *   GEMINI_API_KEY — chave da API do Google Gemini (opcional, IA desabilitada se ausente)
 */
import { readFileSync, writeFileSync } from 'fs';

const tmdbKey   = process.env['TMDB_API_KEY'];
const geminiKey = process.env['GEMINI_API_KEY'] ?? '';

if (!tmdbKey) {
  console.error('❌  Variável TMDB_API_KEY não encontrada. Configure-a no Cloudflare Pages.');
  process.exit(1);
}

const envFile = 'src/environments/environment.prod.ts';
let content = readFileSync(envFile, 'utf8');

content = content.replace('COLOQUE_SUA_CHAVE_AQUI',        tmdbKey);
content = content.replace('COLOQUE_SUA_CHAVE_GEMINI_AQUI', geminiKey);

writeFileSync(envFile, content, 'utf8');

console.log('✅  TMDB_API_KEY injetada em environment.prod.ts');
if (geminiKey) {
  console.log('✅  GEMINI_API_KEY injetada em environment.prod.ts');
} else {
  console.log('ℹ️  GEMINI_API_KEY não configurada — IA usará fallback sem sugestões personalizadas.');
}
