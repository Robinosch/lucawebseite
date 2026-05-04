import { Injectable, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';
import {Animal, AnimalCategory, AnimalCategoryInfo} from '../models/animal.model';

/**
 * AnimalService – Statischer Datendienst für alle Tierdaten der Zucht „Highlander vom Weetfeld".
 *
 * Bildpfade verweisen auf /images/... (public-Verzeichnis).
 * Bildgrößen-Konvention:
 * - picture-200 → Thumbnail / klein (~200px)
 * - picture-1600 → Mittel (~1600px)
 * - picture-2600 → Groß / Hero (~2600px)
 */
@Injectable({providedIn: 'root'})
export class AnimalService {
  private readonly http = inject(HttpClient);

  private readonly dataPaths = {
    categories: '/data/animals/categories.json',
    stammkuehe: '/data/animals/stammkuehe.json',
    mutterkuehe: '/data/animals/mutterkuehe.json',
    zuchtbullen: '/data/animals/zuchtbullen.json',
    kaelber: '/data/animals/kaelber.json',
    faersen: '/data/animals/faersen.json',
    jungbullen: '/data/animals/jungbullen.json'
  };

  private readonly fallbackCategories: AnimalCategoryInfo[] = [];

  // ===== STAMMKÜHE =====
  private readonly stammkuehe: Animal[] = [];

  // ===== MUTTERKÜHE =====
  private readonly mutterkuehe: Animal[] = [];

  // ===== ZUCHTBULLEN =====
  private readonly zuchtbullen: Animal[] = [];

  // ===== KÄLBER (keine Einzeltiere) =====
  private readonly kaelber: Animal[] = [];

  // ===== FÄRSEN =====
  private readonly faersen: Animal[] = [];

  // ===== JUNGBULLEN =====
  private readonly jungbullen: Animal[] = [];

  private readonly fallbackAnimals: Animal[] = [];

  private readonly externalData = toSignal(
    forkJoin({
      categories: this.http.get<AnimalCategoryInfo[]>(this.dataPaths.categories),
      stammkuehe: this.http.get<Animal[]>(this.dataPaths.stammkuehe),
      mutterkuehe: this.http.get<Animal[]>(this.dataPaths.mutterkuehe),
      zuchtbullen: this.http.get<Animal[]>(this.dataPaths.zuchtbullen),
      kaelber: this.http.get<Animal[]>(this.dataPaths.kaelber),
      faersen: this.http.get<Animal[]>(this.dataPaths.faersen),
      jungbullen: this.http.get<Animal[]>(this.dataPaths.jungbullen)
    }).pipe(
      map(({ categories, stammkuehe, mutterkuehe, zuchtbullen, kaelber, faersen, jungbullen }) => ({
        categories,
        animals: [...stammkuehe, ...mutterkuehe, ...zuchtbullen, ...kaelber, ...faersen, ...jungbullen]
      })),
      catchError(() => of(null))
    ),
    { initialValue: null }
  );

  private readonly data = computed(() => {
    const external = this.externalData();
    return {
      categories: external?.categories ?? [],
      animals: external?.animals ?? []
    };
  });

  readonly categories = computed(() => this.data().categories);

  // ===== Öffentliche Methoden =====

  getAnimalsByCategory(category: AnimalCategory): Animal[] {
    return this.data().animals.filter(animal => animal.category === category);
  }

  getAnimalById(category: AnimalCategory, id: string): Animal | undefined {
    return this.getAnimalsByCategory(category).find(a => a.id === id);
  }

  getCategoryLabel(category: AnimalCategory): string {
    const fallbackLabels: Record<AnimalCategory, string> = {
      stammkuehe: 'Stammkühe', mutterkuehe: 'Mutterkühe', zuchtbullen: 'Zuchtbullen',
      kaelber: 'Kälber', faersen: 'Färsen', jungbullen: 'Jungbullen'
    };
    return this.data().categories.find(c => c.slug === category)?.label || fallbackLabels[category] || category;
  }

  getCategoryDescription(category: AnimalCategory): string {
    const fallbackDescriptions: Record<AnimalCategory, string> = {
      stammkuehe: 'Die Stammkühe sind die Basis der Zucht „Highlander vom Weetfeld". Sie sind die Gründungstiere des Bestands und prägen maßgeblich die Zuchtziele und die genetische Grundlage aller Nachkommen.',
      mutterkuehe: 'Die Mutterkühe „vom Weetfeld" sind die aktive Zuchtbasis des Betriebs. Sie sind überwiegend aus eigener Nachzucht entstanden und tragen das „vom Weetfeld"-Namenssuffix.',
      zuchtbullen: 'Die Zuchtbullen spielen eine zentrale Rolle in der Zucht „Highlander vom Weetfeld". Sie werden sorgfältig ausgewählt und müssen dem Zuchtideal in Typ, Charakter und Abstammung entsprechen.',
      kaelber: 'Highland-Cattle-Kälber sind sehr robust und werden von ihren Müttern naturnah aufgezogen – ohne Zufütterung oder künstliche Eingriffe.',
      faersen: 'Die Färsen des Betriebs sind weibliche Jungtiere, die entweder als zukünftige Zuchttiere im Bestand verbleiben oder als hochwertige Zuchttiere an andere Züchter abgegeben werden.',
      jungbullen: 'Die Jungbullen sind männliche Nachzuchten aus dem Betrieb „vom Weetfeld". Sie werden entweder als zukünftige Zuchtbullen gehalten oder zur Direktvermarktung (Fleisch) vorgesehen.'
    };
    return this.data().categories.find(c => c.slug === category)?.description || fallbackDescriptions[category] || '';
  }

  getCategoryRoute(category: AnimalCategory): string {
    const routes: Record<AnimalCategory, string> = {
      stammkuehe: '/unsere-highlander/stammkuehe', mutterkuehe: '/unsere-highlander/mutterkuehe',
      zuchtbullen: '/unsere-highlander/zuchtbullen', kaelber: '/unsere-highlander/kaelber',
      faersen: '/unsere-highlander/jungtiere/faersen', jungbullen: '/unsere-highlander/jungtiere/jungbullen'
    };
    return routes[category] || '/unsere-highlander';
  }

  getAdjacentAnimals(category: AnimalCategory, id: string): { prev?: Animal; next?: Animal } {
    const animals = this.getAnimalsByCategory(category);
    const index = animals.findIndex(a => a.id === id);
    return {
      prev: index > 0 ? animals[index - 1] : undefined,
      next: index < animals.length - 1 ? animals[index + 1] : undefined
    };
  }
}
