import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { PedigreeEntry, PedigreeRawEntry } from '../models/pedigree.model';

@Injectable({ providedIn: 'root' })
export class PedigreeService {
  private readonly http = inject(HttpClient);
  private readonly dataPath = '/staumbaum/data.json';

  getEntries(): Observable<PedigreeEntry[]> {
    return this.http.get<PedigreeRawEntry[]>(this.dataPath).pipe(
      map(entries => entries
        .filter(entry => entry.id.trim().length > 0)
        .map(entry => this.normalizeEntry(entry)))
    );
  }

  private normalizeEntry(entry: PedigreeRawEntry): PedigreeEntry {
    return {
      id: entry.id.trim(),
      sire: this.normalizeText(entry.sire),
      // Fallback auf dom, falls Datenquelle den Schluessel so liefert.
      dam: this.normalizeText(entry.dam ?? entry.dom),
      info: this.normalizeText(entry.info),
      path: this.normalizeText(entry.path),
      highlight: Boolean(entry.highlight)
    };
  }

  private normalizeText(value?: string | null): string | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : undefined;
  }
}

