import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DECADES } from '../models/profile.model';
import type {
  Movie,
  MovieDetail,
  SearchResult,
  Video,
  ProviderResult,
  PaginatedResponse,
  VideoResponse,
} from '../models/movie.model';

export interface ProfileFilters {
  decades?: string[];
  minRating?: number;
  platformIds?: number[];
}

@Injectable({ providedIn: 'root' })
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.tmdbBaseUrl;

  // ─── Trending ───────────────────────────────────────────────────────────────

  getTrending(type: 'all' | 'movie' | 'tv' = 'movie', timeWindow: 'day' | 'week' = 'week'): Observable<Movie[]> {
    return this.http
      .get<PaginatedResponse<Movie>>(`${this.base}/trending/${type}/${timeWindow}`)
      .pipe(map(r => r.results));
  }

  // ─── Discover ───────────────────────────────────────────────────────────────

  discoverByGenres(
    type: 'movie' | 'tv',
    genreIds: number[],
    anime = false,
    profileFilters: ProfileFilters = {}
  ): Observable<Movie[]> {
    const endpoint = `${this.base}/discover/${type}`;

    const buildParams = (page: number): HttpParams => {
      let params = new HttpParams()
        .set('sort_by',        'popularity.desc')
        .set('with_genres',    genreIds.join('|'))
        .set('vote_count.gte', '20')
        .set('page',           String(page));

      if (anime) {
        params = params
          .set('with_original_language', 'ja')
          .set('with_genres',            '16');
      }

      // Profile: minimum rating
      if (profileFilters.minRating && profileFilters.minRating > 0) {
        params = params.set('vote_average.gte', String(profileFilters.minRating));
      }

      // Profile: decade range (use the broadest span if multiple selected)
      const { decades } = profileFilters;
      if (decades && decades.length > 0) {
        const ranges = decades
          .map(d => DECADES.find(dec => dec.id === d))
          .filter(Boolean) as typeof DECADES;

        const from = ranges.map(r => r.from).sort()[0];
        const to   = ranges.map(r => r.to).sort().at(-1)!;

        if (type === 'movie') {
          params = params
            .set('primary_release_date.gte', from)
            .set('primary_release_date.lte', to);
        } else {
          params = params
            .set('first_air_date.gte', from)
            .set('first_air_date.lte', to);
        }
      }

      // Profile: streaming platforms (watch region = BR)
      if (profileFilters.platformIds && profileFilters.platformIds.length > 0) {
        params = params
          .set('with_watch_providers', profileFilters.platformIds.join('|'))
          .set('watch_region',         'BR');
      }

      return params;
    };

    return forkJoin([
      this.http.get<PaginatedResponse<Movie>>(endpoint, { params: buildParams(1) }),
      this.http.get<PaginatedResponse<Movie>>(endpoint, { params: buildParams(2) }),
      this.http.get<PaginatedResponse<Movie>>(endpoint, { params: buildParams(3) }),
    ]).pipe(
      map(pages => {
        const seen = new Set<number>();
        return pages
          .flatMap(p => p.results)
          .filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
      })
    );
  }

  // ─── Search ─────────────────────────────────────────────────────────────────

  searchMulti(query: string): Observable<SearchResult[]> {
    const params = new HttpParams()
      .set('query',          query)
      .set('include_adult',  'false')
      .set('language',       'pt-BR');

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
