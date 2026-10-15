import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ScrollRevealDirective } from '../../shared/scroll-reveal.directive';

export interface VisitStep {
  number: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  imageSrc: string;
  highlights: string[];
}

@Component({
  selector: 'app-visit',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, ScrollRevealDirective],
  templateUrl: './visit.html',
  styleUrl: './visit.css'
})
export class Visit {
  readonly steps: VisitStep[] = [
    {
      number: 1,
      title: 'Ankunft & Kennenlernen am Hof',
      subtitle: 'Provinzialstraße 29 in Hamm-Weetfeld',
      description: 'Nach vorheriger Terminabsprache begrüßen wir Sie persönlich auf unserem Hof in Hamm-Weetfeld und geben Ihnen eine erste Einführung in unsere Bio-Zuchtstätte.',
      icon: 'handshake',
      imageSrc: 'images/startseite/bild-von-uns-mit-kühen.jpg',
      highlights: ['Persönlicher Empfang', 'Überblick über den Bio-Betrieb']
    },
    {
      number: 2,
      title: 'Gemeinsamer Gang zu den Weiden',
      subtitle: 'Highland Cattle hautnah erleben',
      description: 'Gemeinsam besuchen wir unsere Stammkühe, Mutterkühe und Kälber direkt auf den Weiden. Da unsere Tiere täglich liebevollen Kontakt gewohnt sind, lassen sie sich aus nächster Nähe ruhig beobachten.',
      icon: 'pets',
      imageSrc: 'images/stammkühe/stammkühe-auf-weide.jpg',
      highlights: ['Ruhige, handzahme Herde', 'Natürlicher Herdenverband']
    },
    {
      number: 3,
      title: 'Einblick in Zuchtlinien & Haltung',
      subtitle: 'Abstammung, Charakter & Bio-Fütterung',
      description: 'Wir zeigen Ihnen unsere verschiedenen Altersklassen – von den Kälbern und Färsen bis zu den Zuchtbullen – und erläutern Ihnen unsere Zuchtziele sowie die Herdbuchführung.',
      icon: 'account_tree',
      imageSrc: 'images/mutterkühe/narnia-vom-weetfeld/picture-2600.jpg',
      highlights: ['Dokumentierte Abstammung', '100 % Bio-Grünlandfütterung']
    },
    {
      number: 4,
      title: 'Individuelle Beratung & Austausch',
      subtitle: 'Fragen zu Zuchttieren, Haltung oder Fleisch',
      description: 'Ob Sie selbst in die Highland-Haltung einsteigen möchten, ein Zuchttier suchen oder sich für unser Bio-Fleisch interessieren – wir nehmen uns ausführlich Zeit für Ihre Fragen.',
      icon: 'forum',
      imageSrc: 'images/startseite/beispiel-kuh.jpg',
      highlights: ['Erfahrung seit 1998', 'Ehrliche Praxis-Tipps']
    }
  ];

  readonly activeStepIndex = signal(0);

  selectStep(index: number): void {
    this.activeStepIndex.set(index);
  }

  get activeStep(): VisitStep {
    return this.steps[this.activeStepIndex()];
  }
}
