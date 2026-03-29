import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  Movie,
  MovieDetail,
  SearchResult,
  Video,
  ProviderResult,
  PaginatedResponse,
  VideoResponse,
} from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.tmdbBaseUrl;

  // ─── Discover ───────────────────────────────────────────────────────────────

  discoverByGenres(
    type: 'movie' | 'tv',
    genreIds: number[],
    anime = false
  ): Observable<Movie[]> {
    const endpoint = `${this.base}/discover/${type}`;
    let params = new HttpParams()
      .set('sort_by', 'popularity.desc')
      .set('with_genres', genreIds.join(','))
      .set('vote_count.gte', '50');

    if (anime) {
      params = params.set('with_original_language', 'ja');
    }

    return this.http
      .get<PaginatedResponse<Movie>>(endpoint, { params })
      .pipe(map(r => r.results));
  }

  // ─── Search ─────────────────────────────────────────────────────────────────

  searchMulti(query: string): Observable<SearchResult[]> {
    const params = new HttpParams()
      .set('query', query)
      .set('include_adult', 'false')
      .set('language', 'pt-BR');

    return this.http
      .get<PaginatedResponse<SearchResult>>(`${this.base}/search/multi`, { params })
      .pipe(map(r => r.results.filter(i => i.media_type !== 'person')));
  }

  // ─── Recommendations ────────────────────────────────────────────────────────

  getRecommendations(id: number, type: 'movie' | 'tv'): Observable<Movie[]> {
    return this.http
      .get<PaginatedResponse<Movie>>(`${this.base}/${type}/${id}/recommendations`)
      .pipe(map(r => r.results));
  }

  // ─── Detail ─────────────────────────────────────────────────────────────────

  getDetail(id: number, type: 'movie' | 'tv'): Observable<MovieDetail> {
    const params = new HttpParams().set('language', 'pt-BR');
    return this.http.get<MovieDetail>(`${this.base}/${type}/${id}`, { params });
  }

  // ─── Videos ─────────────────────────────────────────────────────────────────

  getVideos(id: number, type: 'movie' | 'tv'): Observable<Video[]> {
    const params = new HttpParams().set('language', 'pt-BR');
    return this.http
      .get<VideoResponse>(`${this.base}/${type}/${id}/videos`, { params })
      .pipe(
        map(r => {
          // prefer PT-BR trailers, fall back to EN
          const ptTrailers = r.results.filter(v => v.site === 'YouTube' && v.type === 'Trailer');
          return ptTrailers.length ? ptTrailers : r.results.filter(v => v.site === 'YouTube');
        })
      );
  }

  // ─── Watch Providers ────────────────────────────────────────────────────────

  getWatchProviders(id: number, type: 'movie' | 'tv'): Observable<ProviderResult> {
    return this.http.get<ProviderResult>(`${this.base}/${type}/${id}/watch/providers`);
  }
}
