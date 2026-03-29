import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ALL_GENRES } from '../models/movie.model';
import type { GeminiResponse, UserProfile } from '../models/profile.model';

const FALLBACK: GeminiResponse = {
  greeting: 'Seu gosto cinematográfico é único. Explore nossas curadorias especiais para você.',
  suggestions: [],
};

@Injectable({ providedIn: 'root' })
export class GeminiService {
  private readonly http = inject(HttpClient);

  private get endpoint(): string {
    return `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${environment.geminiApiKey}`;
  }

  getSuggestions(profile: UserProfile): Observable<GeminiResponse> {
    if (!environment.geminiApiKey || environment.geminiApiKey.includes('COLOQUE')) {
      return of(FALLBACK);
    }

    const genreNames = profile.favoriteGenreIds
      .map(id => ALL_GENRES.find(g => g.id === id)?.name ?? String(id))
      .join(', ');

    const contentLabel =
      profile.contentType === 'all' ? 'filmes e séries'
      : profile.contentType === 'movie' ? 'filmes'
      : profile.contentType === 'tv' ? 'séries'
      : 'anime';

    const prompt = `Você é um curador cinematográfico especialista. Analise este perfil e retorne recomendações.

Perfil do usuário:
- Gêneros favoritos: ${genreNames || 'variados'}
- Tipo de conteúdo: ${contentLabel}
- Décadas preferidas: ${profile.decades.length ? profile.decades.join(', ') : 'todas as décadas'}
- Nota mínima: ${profile.minRating ? profile.minRating + '+' : 'qualquer nota'}

Retorne EXATAMENTE este JSON válido (sem markdown, sem texto adicional):
{
  "greeting": "Uma frase curta e evocativa (máx 120 chars) sobre o gosto cinematográfico deste usuário",
  "suggestions": [
    {
      "label": "Nome criativo da curadoria (máx 40 chars)",
      "genreIds": [2 ou 3 IDs de gênero TMDB para filmes],
      "tvGenreIds": [2 ou 3 IDs de gênero TMDB para séries],
      "mood": "um de: nostalgic|tense|inspiring|dark|reflexive|fun|complex|elegant"
    }
  ]
}

IDs de gênero TMDB — Filmes: Ação=28, Aventura=12, Animação=16, Comédia=35, Crime=80, Documentário=99, Drama=18, Família=10751, Fantasia=14, História=36, Terror=27, Mistério=9648, Romance=10749, Ficção Científica=878, Suspense=53
IDs de gênero TMDB — Séries: Ação e Aventura=10759, Animação=16, Comédia=35, Crime=80, Documentário=99, Drama=18, Família=10751, Mistério=9648, Sci-Fi e Fantasia=10765

Retorne exatamente 3 sugestões. Responda APENAS com o JSON válido.`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
    };

    return this.http.post<any>(this.endpoint, body).pipe(
      map(res => {
        const text: string = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        const cleaned = text.replace(/```json\s*|\s*```/g, '').trim();
        return JSON.parse(cleaned) as GeminiResponse;
      }),
      catchError(() => of(FALLBACK))
    );
  }
}
