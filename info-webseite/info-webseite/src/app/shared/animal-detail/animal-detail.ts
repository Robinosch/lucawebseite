import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { AnimalService } from '../../services/animal.service';
import { Animal, AnimalCategory } from '../../models/animal.model';

/**
 * Gemeinsame Detail-Komponente für alle Tierkategorien.
 * Zeigt das vollständige Profil eines einzelnen Tieres an.
 * Wird per Route-Parameter (:name) und der Kategorie gesteuert.
 */
@Component({
  selector: 'app-animal-detail',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './animal-detail.html',
  styleUrl: './animal-detail.css'
})
export class AnimalDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly animalService = inject(AnimalService);

  /** Aktuelles Tier */
  animal = signal<Animal | undefined>(undefined);

  /** Kategorie (aus Route-Data) */
  category = signal<AnimalCategory>('stammkuehe');

  /** Kategorie-Bezeichnung */
  categoryLabel = computed(() => this.animalService.getCategoryLabel(this.category()));

  /** Basispfad für Zurück-Navigation */
  backPath = computed(() => this.animalService.getCategoryRoute(this.category()));

  /** Vorheriges / nächstes Tier für Navigation */
  adjacentAnimals = computed(() => {
    const a = this.animal();
    if (!a) return { prev: undefined, next: undefined };
    return this.animalService.getAdjacentAnimals(this.category(), a.id);
  });

  /** Aktuell angezeigtes Bild (Index) */
  currentImageIndex = signal(0);

  /** Alle Bilder des Tieres */
  images = computed(() => this.animal()?.images || []);

  ngOnInit(): void {
    // Kategorie aus Route-Data lesen
    const data = this.route.snapshot.data;
    if (data['category']) {
      this.category.set(data['category'] as AnimalCategory);
    }

    // Auf Parameteränderungen reagieren (für Vor/Zurück-Navigation)
    this.route.paramMap.subscribe(params => {
      const name = params.get('name');
      if (name) {
        const animal = this.animalService.getAnimalById(this.category(), name);
        this.animal.set(animal);
        this.currentImageIndex.set(0);
      }
    });
  }

  /** Bild wechseln */
  showImage(index: number): void {
    if (index >= 0 && index < this.images().length) {
      this.currentImageIndex.set(index);
    }
  }

  /** Nächstes Bild */
  nextImage(): void {
    const next = (this.currentImageIndex() + 1) % this.images().length;
    this.currentImageIndex.set(next);
  }

  /** Vorheriges Bild */
  prevImage(): void {
    const prev = (this.currentImageIndex() - 1 + this.images().length) % this.images().length;
    this.currentImageIndex.set(prev);
  }
}

