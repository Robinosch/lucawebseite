import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

interface PedigreePreviewPreset {
  id: string;
  name: string;
  year: string;
  sire: string;
  dam: string;
  badge: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, ScrollRevealDirective],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit, OnDestroy {
  // Animierte Zähler für die Trust-Bar
  readonly countYear = signal(1950);
  readonly countBio = signal(0);
  readonly countDays = signal(0);
  readonly countLineage = signal(0);

  // Interaktiver Bild-Vergleichsslider (0 bis 100 %)
  readonly sliderPosition = signal(52);
  readonly isDraggingSlider = signal(false);

  // Interaktive Stammbaum-Vorschau auf der Startseite
  readonly previewPresets: PedigreePreviewPreset[] = [
    {
      id: 'narnia',
      name: 'Narnia vom Weetfeld',
      year: 'geb. 2011 · rot',
      sire: 'Max vom Holschenhof',
      dam: 'Niseag Fox of Blocken',
      badge: 'N-Linie'
    },
    {
      id: 'antigone',
      name: 'Antigone vom Weetfeld',
      year: 'geb. 2011 · gelb/rot',
      sire: 'Max vom Holschenhof',
      dam: 'Anthea Fox of Blocken',
      badge: 'A-Linie'
    },
    {
      id: 'giovanna',
      name: 'Giovanna vom Weetfeld',
      year: 'Eigene Nachzucht',
      sire: 'Lux vom schönen Felde',
      dam: 'Gilka von der Rehhecke',
      badge: 'G-Linie'
    }
  ];

  readonly activePresetIndex = signal(0);
  readonly isAnimatingPreset = signal(false);

  private counterFrameId: number | null = null;

  ngOnInit(): void {
    this.animateCounters();
  }

  ngOnDestroy(): void {
    if (this.counterFrameId !== null) {
      cancelAnimationFrame(this.counterFrameId);
    }
  }

  get activePreset(): PedigreePreviewPreset {
    return this.previewPresets[this.activePresetIndex()];
  }

  selectPreset(index: number): void {
    if (index === this.activePresetIndex()) return;
    this.isAnimatingPreset.set(true);
    this.activePresetIndex.set(index);
    setTimeout(() => this.isAnimatingPreset.set(false), 380);
  }

  scrollToIntro(): void {
    const el = document.getElementById('hof-intro');
    el?.scrollIntoView({ behavior: 'smooth' });
  }

  // 3D-Tilt & Spotlight-Effekt auf Karten
  onCardMouseMove(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5.5;
    const rotateY = ((x - centerX) / centerX) * 5.5;

    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
  }

  onCardMouseLeave(event: MouseEvent): void {
    const card = event.currentTarget as HTMLElement;
    if (!card) return;
    card.style.transform = '';
  }

  // Vorher/Nachher-Slider Steuerung
  onSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.sliderPosition.set(Number(input.value));
  }

  private animateCounters(): void {
    const duration = 1600;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      // Cubic Ease-Out
      const eased = 1 - Math.pow(1 - progress, 3);

      this.countYear.set(Math.round(1950 + (1998 - 1950) * eased));
      this.countBio.set(Math.round(100 * eased));
      this.countDays.set(Math.round(365 * eased));
      this.countLineage.set(Math.round(53 * eased));

      if (progress < 1) {
        this.counterFrameId = requestAnimationFrame(step);
      }
    };

    this.counterFrameId = requestAnimationFrame(step);
  }
}
