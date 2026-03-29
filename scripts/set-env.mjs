/**
 * Injeta a variável de ambiente TMDB_API_KEY no environment.prod.ts antes do build.
 * Usado pelo Cloudflare Pages via: npm run build:cf
 */
import { readFileSync, writeFileSync } from 'fs';

const key = process.env['TMDB_API_KEY'];

if (!key) {
  console.error('❌  Variável TMDB_API_KEY não encontrada. Configure-a no Cloudflare Pages.');
  process.exit(1);
}

const envFile = 'src/environments/environment.prod.ts';
const original = readFileSync(envFile, 'utf8');

if (!original.includes('COLOQUE_SUA_CHAVE_AQUI')) {
  console.log('ℹ️  Placeholder já substituído anteriormente — pulando.');
  process.exit(0);
}

const updated = original.replace('COLOQUE_SUA_CHAVE_AQUI', key);
writeFileSync(envFile, updated, 'utf8');

console.log('✅  TMDB_API_KEY injetada em environment.prod.ts');
