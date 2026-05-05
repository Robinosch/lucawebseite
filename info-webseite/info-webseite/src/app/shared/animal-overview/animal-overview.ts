import { Component, inject, input, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { AnimalService } from '../../services/animal.service';
import { AnimalCategory } from '../../models/animal.model';

/**
 * Generische Tier-Übersichtskomponente.
 * Zeigt alle Tiere einer Kategorie als responsive Card-Grid an.
 * Wird von den kategoriespezifischen Übersichtsseiten wiederverwendet.
 */
@Component({
  selector: 'app-animal-overview',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatButtonToggleModule, MatDividerModule],
  templateUrl: './animal-overview.html',
  styleUrl: './animal-overview.css'
})
export class AnimalOverview {
  private readonly animalService = inject(AnimalService);

  /** Tierkategorie (wird vom Eltern-Component gesetzt) */
  category = input.required<AnimalCategory>();

  /** Optionaler Basispfad für die Detail-Links (z. B. '/unsere-highlander/stammkuehe') */
  basePath = input<string>();

  /** Filterzustand für Mutterkühe */
  statusFilter = signal<'active' | 'all'>('active');

  /** Tiere dieser Kategorie */
  allAnimals = computed(() => this.animalService.getAnimalsByCategory(this.category()));

  /** Kategorie-Bezeichnung */
  categoryLabel = computed(() => this.animalService.getCategoryLabel(this.category()));

  /** Kategorie-Beschreibungstext */
  categoryDescription = computed(() => this.animalService.getCategoryDescription(this.category()));

  /** Berechneter Basispfad */
  resolvedBasePath = computed(() =>
    this.basePath() || this.animalService.getCategoryRoute(this.category())
  );

  /** Mutterkühe-Filter sichtbar? */
  showStatusFilter = computed(() => this.category() === 'mutterkuehe');

  /** Gefilterte Tiere (nur aktiv bei Mutterkühen) */
  filteredAnimals = computed(() => {
    const animals = this.allAnimals();
    if (!this.showStatusFilter() || this.statusFilter() === 'all') {
      return animals;
    }
    return animals.filter(animal => this.isActiveMutterkuh(animal.status));
  });

  /** Nur aktive Mutterkühe (für getrennte Anzeige bei "Alle") */
  activeMutterkuehe = computed(() =>
    this.allAnimals().filter(animal => this.isActiveMutterkuh(animal.status))
  );

  /** Nur inaktive Mutterkühe (für getrennte Anzeige bei "Alle") */
  inactiveMutterkuehe = computed(() =>
    this.allAnimals().filter(animal => this.isInactiveMutterkuh(animal.status))
  );

  /** Gibt es überhaupt Tiere in der Kategorie? */
  hasAnyAnimals = computed(() => this.allAnimals().length > 0);

  /** Aktiv-Filter gewählt? */
  isActiveFilter = computed(() => this.statusFilter() === 'active');

  setStatusFilter(value: 'active' | 'all' | null) {
    this.statusFilter.set(value ?? 'active');
  }

  private isActiveMutterkuh(status?: string): boolean {
    return !!status && status.startsWith('Aktive');
  }

  private isInactiveMutterkuh(status?: string): boolean {
    return !!status && status.startsWith('Inaktive');
  }

  /** Geburtsjahr aus dem Datum extrahieren */
  getBirthYear(birthDate?: string): string {
    if (!birthDate) return '';
    const parts = birthDate.split('.');
    return parts.length === 3 ? `geb. ${parts[2]}` : birthDate;
  }

  /** Primäres Bild eines Tieres (Platzhalter-Text) */
  getPrimaryImage(images: { placeholder: string; isPrimary: boolean }[]): string {
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.placeholder : images[0]?.placeholder || '[BILD: Tierfoto]';
  }

  /** Echten Bildpfad des primären Bildes zurückgeben (oder null wenn keins vorhanden) */
  getPrimaryImageSrc(images: { src?: string; isPrimary: boolean }[]): string | null {
    const primary = images.find(img => img.isPrimary);
    return primary?.src || images[0]?.src || null;
  }
}
