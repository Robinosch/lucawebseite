import {Injectable} from '@angular/core';
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

  readonly categories: AnimalCategoryInfo[] = [
    {
      slug: 'stammkuehe',
      label: 'Stammkühe',
      description: 'Die Gründungstiere unserer Zucht – sie prägen die genetische Grundlage aller Nachkommen.',
      icon: 'star',
      routerLink: '/unsere-highlander/stammkuehe',
      imagePlaceholder: 'Stammkühe auf der Weide',
      imageSrc: 'images/stammkühe/stammkühe-auf-weide.jpg'
    },
    {
      slug: 'mutterkuehe',
      label: 'Mutterkühe',
      description: 'Unsere aktive Zuchtbasis – überwiegend aus eigener Nachzucht mit hervorragenden Muttereigenschaften.',
      icon: 'favorite',
      routerLink: '/unsere-highlander/mutterkuehe',
      imagePlaceholder: 'Mutterkühe auf der Weide',
      imageSrc: 'images/mutterkühe/narnia-vom-weetfeld/picture-2600.jpg'
    },
    {
      slug: 'zuchtbullen',
      label: 'Zuchtbullen',
      description: 'Sorgfältig ausgewählte Bullen mit nachgewiesener Abstammung und ausgeglichenem Wesen.',
      icon: 'shield',
      routerLink: '/unsere-highlander/zuchtbullen',
      imagePlaceholder: 'Zuchtbulle – imposante Erscheinung',
      imageSrc: 'images/zuchtbullen/max-vom-holschenhof/picture-2600.jpg'
    },
    {
      slug: 'kaelber',
      label: 'Kälber',
      description: 'Unsere jüngsten Herdemitglieder – robust, neugierig und naturnah bei der Mutter aufgezogen.',
      icon: 'child_care',
      routerLink: '/unsere-highlander/kaelber',
      imagePlaceholder: 'Highland-Cattle-Kälber auf der Weide',
      imageSrc: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600.jpg'
    },
    {
      slug: 'jungtiere',
      label: 'Jungtiere',
      description: 'Färsen und Jungbullen aus eigener Nachzucht – die Zukunft unserer Herde.',
      icon: 'trending_up',
      routerLink: '/unsere-highlander/jungtiere',
      imagePlaceholder: 'Jungtiere auf der Weide',
      imageSrc: 'images/jungtiere/färsen/arianne-vom-weetfeld/picture-1600.jpg'
    }
  ];

  // ===== STAMMKÜHE =====
  private readonly stammkuehe: Animal[] = [
    {
      id: 'anthea-fox-of-blocken', name: 'Anthea Fox of Blocken', category: 'stammkuehe',
      birthDate: '04.09.1997', origin: 'Fox of Blocken (schottische Abstammung)',
      status: 'Stammkuh – Gründungstier der Zucht vom Weetfeld',
      description: 'Anthea Fox of Blocken ist eine der ursprünglichen Stammkühe der Zucht. Sie steht für die typische schottische Hochlandkuh-Linie mit ausgeprägtem Typ und gutem Fundament.',
      offspring: 'Mehrere Nachkommen, die als Mutterkühe oder Zuchttiere im Bestand verblieben sind.',
      lineageImageSrc: 'images/stammkühe/anthea-fox-of-blocken/anthea-fox-of-blocken-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/picture-2600.jpg',
          alt: 'Anthea Fox of Blocken – Hauptbild',
          placeholder: 'Anthea Fox of Blocken',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/picture-2600 (1).jpg',
          alt: 'Anthea Fox of Blocken – weitere Ansicht',
          placeholder: 'Anthea Fox of Blocken',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/picture-200 (1).jpeg',
          alt: 'Anthea Fox of Blocken – Thumbnail 1',
          placeholder: 'Anthea Fox of Blocken',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/picture-200 (2).jpeg',
          alt: 'Anthea Fox of Blocken – Thumbnail 2',
          placeholder: 'Anthea Fox of Blocken',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/picture-200 (3).jpeg',
          alt: 'Anthea Fox of Blocken – Thumbnail 3',
          placeholder: 'Anthea Fox of Blocken',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Anthea – Bild 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Anthea – Bild 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (2).jpg',
          alt: 'Nachwuchs Anthea – Bild 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (3).jpg',
          alt: 'Nachwuchs Anthea – Bild 4',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (4).jpg',
          alt: 'Nachwuchs Anthea – Bild 5',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (5).jpg',
          alt: 'Nachwuchs Anthea – Bild 6',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (6).jpg',
          alt: 'Nachwuchs Anthea – Bild 7',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (7).jpg',
          alt: 'Nachwuchs Anthea – Bild 8',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (8).jpg',
          alt: 'Nachwuchs Anthea – Bild 9',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/anthea-fox-of-blocken/nachwuchs/picture-1600 (9).jpg',
          alt: 'Nachwuchs Anthea – Bild 10',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'gilka-von-der-rehhecke', name: 'Gilka von der Rehhecke', category: 'stammkuehe',
      birthDate: '02.04.1999', origin: 'von der Rehhecke', status: 'Stammkuh',
      description: 'Gilka von der Rehhecke ist eine weitere Stammkuh der Zucht „vom Weetfeld". Sie zeichnet sich durch einen harmonischen Körperbau, ein ruhiges Wesen und gute Muttereigenschaften aus. Ihre Nachkommen sind regelmäßig im Bestand vertreten.',
      offspring: 'Mehrere Nachkommen im Bestand bekannt.',
      lineageImageSrc: 'images/stammkühe/gilka-von-der-rehhecke/gilka-von-der-rehhecke-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/picture-2600.jpg',
          alt: 'Gilka von der Rehhecke – Hauptbild',
          placeholder: 'Gilka von der Rehhecke',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/picture-2600 (1).jpg',
          alt: 'Gilka von der Rehhecke – weitere Ansicht',
          placeholder: 'Gilka von der Rehhecke',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/picture-200 (1).jpeg',
          alt: 'Gilka – Thumbnail 1',
          placeholder: 'Gilka',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/picture-200 (3).jpeg',
          alt: 'Gilka – Thumbnail 2',
          placeholder: 'Gilka',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/picture-200 (4).jpeg',
          alt: 'Gilka – Thumbnail 3',
          placeholder: 'Gilka',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Gilka – Bild 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Gilka – Bild 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600 (2).jpg',
          alt: 'Nachwuchs Gilka – Bild 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600 (3).jpg',
          alt: 'Nachwuchs Gilka – Bild 4',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600 (4).jpg',
          alt: 'Nachwuchs Gilka – Bild 5',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/gilka-von-der-rehhecke/nachwuchs/picture-1600 (5).jpg',
          alt: 'Nachwuchs Gilka – Bild 6',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'niseag-fox-of-blocken', name: 'Niseag Fox of Blocken', category: 'stammkuehe',
      birthDate: '04.09.1997', origin: 'Fox of Blocken (schottische Abstammung)',
      status: 'Stammkuh – Gründungstier der Zucht vom Weetfeld',
      description: 'Niseag Fox of Blocken ist, wie Anthea, eine der Gründungstiere der Zucht „vom Weetfeld" und stammt ebenfalls aus der schottischen Linie Fox of Blocken. Sie ist bekannt für ihre typische Erscheinung und ihr ausgeglichenes Temperament.',
      offspring: 'Mehrere Nachkommen im Bestand.',
      lineageImageSrc: 'images/stammkühe/niseag-fox-of-blocken/niseag-fox-of-blocken-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/picture-2600.jpg',
          alt: 'Niseag Fox of Blocken – Hauptbild',
          placeholder: 'Niseag Fox of Blocken',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/picture-2600 (1).jpg',
          alt: 'Niseag Fox of Blocken – weitere Ansicht',
          placeholder: 'Niseag Fox of Blocken',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/picture-200 (2).jpeg',
          alt: 'Niseag – Thumbnail 1',
          placeholder: 'Niseag',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/picture-200 (3).jpeg',
          alt: 'Niseag – Thumbnail 2',
          placeholder: 'Niseag',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/picture-200 (4).jpeg',
          alt: 'Niseag – Thumbnail 3',
          placeholder: 'Niseag',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Niseag – Bild 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Niseag – Bild 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (2).jpg',
          alt: 'Nachwuchs Niseag – Bild 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (3).jpg',
          alt: 'Nachwuchs Niseag – Bild 4',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (4).jpg',
          alt: 'Nachwuchs Niseag – Bild 5',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (5).jpg',
          alt: 'Nachwuchs Niseag – Bild 6',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (6).jpg',
          alt: 'Nachwuchs Niseag – Bild 7',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (7).jpg',
          alt: 'Nachwuchs Niseag – Bild 8',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/stammkühe/niseag-fox-of-blocken/nachwuchs/picture-1600 (8).jpg',
          alt: 'Nachwuchs Niseag – Bild 9',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    }
  ];

  // ===== MUTTERKÜHE =====
  private readonly mutterkuehe: Animal[] = [
    {
      id: 'antigone-vom-weetfeld', name: 'Antigone vom Weetfeld', category: 'mutterkuehe',
      birthDate: '23.03.2011', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Antigone ist eine der ersten eigenen Nachzuchten „vom Weetfeld". Sie zeigt die für den Betrieb typischen Eigenschaften: freundliches Wesen, ausgeglichener Charakter und eine gute Körperkonstitution. Sie hat bereits mehrere Kälber erfolgreich aufgezogen.',
      offspring: 'Mehrere Kälber, darunter weibliche Tiere, die im Bestand verblieben sind.',
      lineageImageSrc: 'images/mutterkühe/antigone-vom-weetfeld/antigone-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/picture-2600.jpg',
          alt: 'Antigone vom Weetfeld – Hauptbild',
          placeholder: 'Antigone vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Antigone – Ansicht 1',
          placeholder: 'Antigone',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Antigone – Ansicht 2',
          placeholder: 'Antigone',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Antigone – Ansicht 3',
          placeholder: 'Antigone',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/nachwuchs/picture-1600.jpeg',
          alt: 'Nachwuchs Antigone 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Antigone 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/antigone-vom-weetfeld/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Antigone 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'gwenda-vom-weetfeld', name: 'Gwenda vom Weetfeld', category: 'mutterkuehe',
      birthDate: '23.03.2008', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Gwenda ist eine der älteren Mutterkühe im Bestand und hat über viele Jahre bewiesen, dass sie hervorragende Muttereigenschaften besitzt. Sie ist ruhig im Umgang und zuverlässig in der Aufzucht ihrer Kälber.',
      offspring: 'Mehrere Kälber aus verschiedenen Jahren.',
      lineageImageSrc: 'images/mutterkühe/gwenda-vom-weetfeld/gwenda-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/picture-2600.jpg',
          alt: 'Gwenda vom Weetfeld – Hauptbild',
          placeholder: 'Gwenda vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/picture-2600 (1).jpg',
          alt: 'Gwenda – Ansicht 2',
          placeholder: 'Gwenda',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/picture-2600 (2).jpg',
          alt: 'Gwenda – Ansicht 3',
          placeholder: 'Gwenda',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Gwenda – Thumbnail 1',
          placeholder: 'Gwenda',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Gwenda – Thumbnail 2',
          placeholder: 'Gwenda',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/nachwuchs/picture-1600.jpeg',
          alt: 'Nachwuchs Gwenda 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Gwenda 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Gwenda 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/gwenda-vom-weetfeld/nachwuchs/picture-1600 (2).jpg',
          alt: 'Nachwuchs Gwenda 4',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'narnia-vom-weetfeld', name: 'Narnia vom Weetfeld', category: 'mutterkuehe',
      birthDate: '02.05.2011', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Narnia vom Weetfeld ist eine typische Vertreterin der eigenen Zuchtlinie. Sie kombiniert gutes Äußeres mit einem ausgeglichenen Wesen und zuverlässiger Mutterleistung.',
      offspring: 'Kälber aus mehreren Abkalbejahren.',
      lineageImageSrc: 'images/mutterkühe/narnia-vom-weetfeld/narnia-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/picture-2600.jpg',
          alt: 'Narnia vom Weetfeld – Hauptbild',
          placeholder: 'Narnia vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Narnia – Ansicht 1',
          placeholder: 'Narnia',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Narnia – Ansicht 2',
          placeholder: 'Narnia',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Narnia – Ansicht 3',
          placeholder: 'Narnia',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Narnia – Ansicht 4',
          placeholder: 'Narnia',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/nachwuchs/picture-1600.jpeg',
          alt: 'Nachwuchs Narnia 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/narnia-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Narnia 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'nikaja-vom-weetfeld', name: 'Nikaja vom Weetfeld', category: 'mutterkuehe',
      birthDate: '09.05.2013', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Nikaja ist eine jüngere Mutterkuh des Bestands, die durch ihre ausdrucksstarke Erscheinung und ihr freundliches Wesen auffällt. Sie entspricht in Typ und Charakter den Zuchtzielen des Betriebs.',
      offspring: 'Kälber aus mehreren Jahren.',
      lineageImageSrc: 'images/mutterkühe/nikaja-vom-weetfeld/nikaja-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-2600.jpg',
          alt: 'Nikaja vom Weetfeld – Hauptbild',
          placeholder: 'Nikaja vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Nikaja – Ansicht 1',
          placeholder: 'Nikaja',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Nikaja – Ansicht 2',
          placeholder: 'Nikaja',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Nikaja – Ansicht 3',
          placeholder: 'Nikaja',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Nikaja – Ansicht 4',
          placeholder: 'Nikaja',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Nikaja – Ansicht 5',
          placeholder: 'Nikaja',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Nikaja 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/nikaja-vom-weetfeld/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Nikaja 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'natascha-vom-weetfeld', name: 'Natascha vom Weetfeld', category: 'mutterkuehe',
      birthDate: '29.03.2015', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Natascha ist eine der jüngeren Mutterkühe. Sie steht für die konsequente Weiterzucht der bewährten Linie „vom Weetfeld" und zeigt gute Anlagen als Mutterkuh.',
      offspring: 'Erste Kälber vorhanden.',
      lineageImageSrc: 'images/mutterkühe/natascha-vom-weetfeld/natascha-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-2600.jpg',
          alt: 'Natascha vom Weetfeld – Hauptbild',
          placeholder: 'Natascha vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Natascha – Ansicht 1',
          placeholder: 'Natascha',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Natascha – Ansicht 2',
          placeholder: 'Natascha',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Natascha – Ansicht 3',
          placeholder: 'Natascha',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Natascha – Ansicht 4',
          placeholder: 'Natascha',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Natascha – Ansicht 5',
          placeholder: 'Natascha',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/natascha-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Natascha',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
      ]
    },
    {
      id: 'nadjeschda-vom-weetfeld', name: 'Nadjeschda v. Weetfeld', category: 'mutterkuehe',
      birthDate: '02.05.2011', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Nadjeschda ist eine weitere Tochter aus eigener Nachzucht. Sie teilt das Geburtsdatum mit Narnia und ist ebenfalls für ihr ruhiges Temperament bekannt.',
      offspring: 'Mehrere Kälber.',
      lineageImageSrc: 'images/mutterkühe/nadjeschda-vom-weetfeld/nadjeschda-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-2600.jpg',
          alt: 'Nadjeschda v. Weetfeld – Hauptbild',
          placeholder: 'Nadjeschda v. Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-2600 (1).jpg',
          alt: 'Nadjeschda – Ansicht 2',
          placeholder: 'Nadjeschda',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Nadjeschda – Thumbnail 1',
          placeholder: 'Nadjeschda',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Nadjeschda – Thumbnail 2',
          placeholder: 'Nadjeschda',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Nadjeschda – Thumbnail 3',
          placeholder: 'Nadjeschda',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Nadjeschda – Thumbnail 4',
          placeholder: 'Nadjeschda',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/nachwuchs/picture-1600.jpeg',
          alt: 'Nachwuchs Nadjeschda 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Nadjeschda 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/nadjeschda-vom-weetfeld/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Nadjeschda 3',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'amidala-vom-weetfeld', name: 'Amidala vom Weetfeld', category: 'mutterkuehe',
      birthDate: '02.05.2011', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Amidala trägt einen ungewöhnlichen Namen, der auf die Leidenschaft der Züchter für ihre Tiere hinweist. Sie ist Teil der starken Jahrgangsklasse 2011 der eigenen Nachzucht.',
      offspring: 'Kälber vorhanden.',
      lineageImageSrc: 'images/mutterkühe/amidala-vom-weetfeld/amidala-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/picture-2600.jpg',
          alt: 'Amidala vom Weetfeld – Hauptbild',
          placeholder: 'Amidala vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/picture-2600.jpeg',
          alt: 'Amidala – Ansicht 2',
          placeholder: 'Amidala',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/picture-2600 (1).jpg',
          alt: 'Amidala – Ansicht 3',
          placeholder: 'Amidala',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Amidala – Thumbnail 1',
          placeholder: 'Amidala',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Amidala – Thumbnail 2',
          placeholder: 'Amidala',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Amidala 1',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/amidala-vom-weetfeld/nachwuchs/picture-1600 (1).jpg',
          alt: 'Nachwuchs Amidala 2',
          placeholder: 'Nachwuchs',
          isPrimary: false,
          size: 'medium'
        },
      ]
    },
    {
      id: 'adriana-vom-weetfeld', name: 'Adriana vom Weetfeld', category: 'mutterkuehe',
      birthDate: '17.04.2016', origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Adriana ist eine der jüngsten Mutterkühe im Bestand. Als 2016er Nachzucht repräsentiert sie die aktuelle Zuchtrichtung des Betriebs und zeigt bereits gute Muttereigenschaften.',
      offspring: 'Erste Kälber vorhanden.',
      lineageImageSrc: 'images/mutterkühe/adriana-vom-weetfeld/adriana-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-2600.jpg',
          alt: 'Adriana vom Weetfeld – Hauptbild',
          placeholder: 'Adriana vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-1600 (1).jpeg',
          alt: 'Adriana – Ansicht 2',
          placeholder: 'Adriana',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-1600 (2).jpeg',
          alt: 'Adriana – Ansicht 3',
          placeholder: 'Adriana',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Adriana – Thumbnail 1',
          placeholder: 'Adriana',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Adriana – Thumbnail 2',
          placeholder: 'Adriana',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/mutterkühe/adriana-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Adriana – Thumbnail 3',
          placeholder: 'Adriana',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          name: "Aywa",
          src: 'images/mutterkühe/adriana-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Adriana',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
      ]
    },
    {
      id: 'namika-vom-weetfeld', name: 'Namika vom Weetfeld', category: 'mutterkuehe',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Namika ist eine weitere Mutterkuh aus eigener Nachzucht „vom Weetfeld".',
      lineageImageSrc: 'images/mutterkühe/namika-vom-weetfeld/namika-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/picture-2600.jpg',
          alt: 'Namika vom Weetfeld – Hauptbild',
          placeholder: 'Namika vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/picture-2600.jpeg',
          alt: 'Namika – Ansicht 2',
          placeholder: 'Namika',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/picture-2600 (1).jpg',
          alt: 'Namika – Ansicht 3',
          placeholder: 'Namika',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/picture-1600.jpeg',
          alt: 'Namika – mittlere Ansicht',
          placeholder: 'Namika',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Namika – Thumbnail',
          placeholder: 'Namika',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/namika-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Namika',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
      ]
    },
    {
      id: 'giovanna-vom-weetfeld', name: 'Giovanna vom Weetfeld', category: 'mutterkuehe',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Aktive Mutterkuh',
      description: 'Giovanna vom Weetfeld ist eine Mutterkuh aus eigener Nachzucht des Betriebs.',
      lineageImageSrc: 'images/mutterkühe/giovanna-vom-weetfeld/giovanna-vom-weetfeld-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/picture-2600.jpg',
          alt: 'Giovanna vom Weetfeld – Hauptbild',
          placeholder: 'Giovanna vom Weetfeld',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/picture-2600.jpeg',
          alt: 'Giovanna – Ansicht 2',
          placeholder: 'Giovanna',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/picture-2600 (1).jpg',
          alt: 'Giovanna – Ansicht 3',
          placeholder: 'Giovanna',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/picture-1600.jpeg',
          alt: 'Giovanna – mittlere Ansicht',
          placeholder: 'Giovanna',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Giovanna – Thumbnail',
          placeholder: 'Giovanna',
          isPrimary: false,
          size: 'small'
        },
      ],
      offspringImages: [
        {
          src: 'images/mutterkühe/giovanna-vom-weetfeld/nachwuchs/picture-1600.jpg',
          alt: 'Nachwuchs Giovanna',
          placeholder: 'Nachwuchs',
          isPrimary: true,
          size: 'medium'
        },
      ]
    }
  ];

  // ===== ZUCHTBULLEN =====
  private readonly zuchtbullen: Animal[] = [
    {
      id: 'jason-of-woodneuk', name: 'Jason of Woodneuk', category: 'zuchtbullen',
      origin: 'of Woodneuk (schottische Abstammungslinie)', status: 'Zuchtbulle',
      description: 'Jason of Woodneuk ist ein Bulle schottischer Herkunft. Die Linie „of Woodneuk" ist bekannt für hochwertige Tiere mit gutem Typ und solidem Fundament. Jason wurde gezielt zur Verbesserung von Typ und Ausdruck im Bestand eingesetzt.',
      offspring: 'Mehrere Nachkommen im Bestand „vom Weetfeld".',
      images: [{placeholder: 'Jason of Woodneuk – Foto folgt', alt: 'Jason of Woodneuk – Zuchtbulle', isPrimary: true}]
    },
    {
      id: 'max-vom-holschenhof', name: 'Max vom Holschenhof', category: 'zuchtbullen',
      birthDate: '05.08.1997', origin: 'vom Holschenhof',
      status: 'Zuchtbulle (historisch, einer der ersten Bullen)',
      description: 'Max vom Holschenhof war einer der frühen Zuchtbullen des Betriebs und hat die genetische Grundlage der heutigen Herde maßgeblich mitgeprägt. Er zeichnete sich durch eine korrekte Körperkonstitution, ein ansprechendes Erscheinungsbild und ein ruhiges Wesen aus.',
      offspring: 'Zahlreiche Nachkommen, die das Fundament der heutigen Mutterkuhherde bilden.',
      lineageImageSrc: 'images/zuchtbullen/max-vom-holschenhof/max-vom-holschenhof-abstammungstabelle.jpg',
      images: [
        {
          src: 'images/zuchtbullen/max-vom-holschenhof/picture-2600.jpg',
          alt: 'Max vom Holschenhof – Hauptbild',
          placeholder: 'Max vom Holschenhof',
          isPrimary: true,
          size: 'large'
        },
        {
          src: 'images/zuchtbullen/max-vom-holschenhof/picture-2600 (1).jpg',
          alt: 'Max vom Holschenhof – Ansicht 2',
          placeholder: 'Max vom Holschenhof',
          isPrimary: false,
          size: 'large'
        },
        {
          src: 'images/zuchtbullen/max-vom-holschenhof/200px-images/picture-200.jpeg',
          alt: 'Max – Thumbnail 1',
          placeholder: 'Max',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/zuchtbullen/max-vom-holschenhof/200px-images/picture-200 (1).jpeg',
          alt: 'Max – Thumbnail 2',
          placeholder: 'Max',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/zuchtbullen/max-vom-holschenhof/200px-images/picture-200 (2).jpeg',
          alt: 'Max – Thumbnail 3',
          placeholder: 'Max',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'lux-vom-schoenen-felde', name: 'Lux vom schönen Felde', category: 'zuchtbullen',
      origin: 'vom schönen Felde', status: 'Zuchtbulle (aktiv)',
      description: 'Lux vom schönen Felde ist ein weiterer Zuchtbulle, der im Betrieb eingesetzt wurde bzw. wird. Er steht für die konsequente Fortführung der Zuchtrichtung „vom Weetfeld" und ergänzt das Zuchtprogramm um frisches Blut aus externer, hochwertiger Zucht.',
      offspring: 'Nachkommen im Bestand vorhanden.',
      images: [{
        placeholder: 'Lux vom schönen Felde – Foto folgt',
        alt: 'Lux vom schönen Felde – Zuchtbulle',
        isPrimary: true
      }]
    }
  ];

  // ===== KÄLBER (keine Einzeltiere) =====
  private readonly kaelber: Animal[] = [];

  // ===== FÄRSEN =====
  private readonly faersen: Animal[] = [
    {
      id: 'amalia-vom-weetfeld', name: 'Amalia vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Amalia vom Weetfeld ist eine Färse aus eigener Nachzucht. Sie verbindet typvolles Erscheinungsbild mit ruhigem, handzahmem Temperament durch regelmäßigen Menschenkontakt.',
      images: [
        {
          src: 'images/jungtiere/färsen/amalia-vom-weetfeld/picture-200 (11).jpeg',
          alt: 'Amalia vom Weetfeld – Ansicht 1',
          placeholder: 'Amalia',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/amalia-vom-weetfeld/picture-200 (12).jpeg',
          alt: 'Amalia vom Weetfeld – Ansicht 2',
          placeholder: 'Amalia',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'arianne-vom-weetfeld', name: 'Arianne vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Arianne vom Weetfeld ist eine Färse aus eigener Nachzucht mit vollständig dokumentierter Abstammung.',
      images: [
        {
          src: 'images/jungtiere/färsen/arianne-vom-weetfeld/picture-1600.jpg',
          alt: 'Arianne vom Weetfeld – Hauptbild',
          placeholder: 'Arianne',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/jungtiere/färsen/arianne-vom-weetfeld/picture-1600.jpeg',
          alt: 'Arianne – Ansicht 2',
          placeholder: 'Arianne',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/jungtiere/färsen/arianne-vom-weetfeld/picture-1600 (1).jpg',
          alt: 'Arianne – Ansicht 3',
          placeholder: 'Arianne',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/jungtiere/färsen/arianne-vom-weetfeld/picture-200 (1).jpeg',
          alt: 'Arianne – Thumbnail',
          placeholder: 'Arianne',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'aywa-vom-weetfeld', name: 'Aywa vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Aywa vom Weetfeld ist eine weitere Färse des Betriebs mit rassetypischem Erscheinungsbild.',
      images: [
        {
          src: 'images/jungtiere/färsen/aywa-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Aywa vom Weetfeld – Ansicht 1',
          placeholder: 'Aywa',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/aywa-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Aywa – Ansicht 2',
          placeholder: 'Aywa',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/aywa-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Aywa – Ansicht 3',
          placeholder: 'Aywa',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/aywa-vom-weetfeld/picture-200 (6).jpeg',
          alt: 'Aywa – Ansicht 4',
          placeholder: 'Aywa',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'nabilah-vom-weetfeld', name: 'Nabilah vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Nabilah vom Weetfeld ist eine Färse aus eigener Nachzucht mit dokumentierter Abstammung und Gesundheitsstatus.',
      images: [
        {
          src: 'images/jungtiere/färsen/nabilah-vom-weetfeld/picture-200 (9).jpeg',
          alt: 'Nabilah vom Weetfeld – Ansicht 1',
          placeholder: 'Nabilah',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/nabilah-vom-weetfeld/picture-200 (10).jpeg',
          alt: 'Nabilah – Ansicht 2',
          placeholder: 'Nabilah',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'nadja-vom-weetfeld', name: 'Nadja vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Nadja vom Weetfeld ist eine Färse mit ruhigem Temperament und ansprechendem Erscheinungsbild.',
      images: [
        {
          src: 'images/jungtiere/färsen/nadja-vom-weetfeld/picture-200 (13).jpeg',
          alt: 'Nadja vom Weetfeld – Ansicht 1',
          placeholder: 'Nadja',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/nadja-vom-weetfeld/picture-200 (14).jpeg',
          alt: 'Nadja – Ansicht 2',
          placeholder: 'Nadja',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/nadja-vom-weetfeld/picture-200 (15).jpeg',
          alt: 'Nadja – Ansicht 3',
          placeholder: 'Nadja',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'nahla-vom-weetfeld', name: 'Nahla vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Nahla vom Weetfeld ist eine Färse, die die Zuchtziele des Betriebs in Typ und Charakter widerspiegelt.',
      images: [
        {
          src: 'images/jungtiere/färsen/nahla-vom-weetfeld/picture-200 (7).jpeg',
          alt: 'Nahla vom Weetfeld – Ansicht 1',
          placeholder: 'Nahla',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/nahla-vom-weetfeld/picture-200 (8).jpeg',
          alt: 'Nahla – Ansicht 2',
          placeholder: 'Nahla',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'niala-vom-weetfeld', name: 'Niala vom Weetfeld', category: 'faersen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Färse (weibliches Jungtier)',
      description: 'Niala vom Weetfeld ist eine Färse aus dem eigenen Zuchtprogramm.',
      images: [
        {
          src: 'images/jungtiere/färsen/niala-vom-weetfeld/picture-200 (16).jpeg',
          alt: 'Niala vom Weetfeld – Ansicht 1',
          placeholder: 'Niala',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/färsen/niala-vom-weetfeld/picture-200 (17).jpeg',
          alt: 'Niala – Ansicht 2',
          placeholder: 'Niala',
          isPrimary: false,
          size: 'small'
        },
      ]
    }
  ];

  // ===== JUNGBULLEN =====
  private readonly jungbullen: Animal[] = [
    {
      id: 'jackson-3-vom-weetfeld', name: 'Jackson 3 vom Weetfeld', category: 'jungbullen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Jungbulle',
      description: 'Jackson 3 vom Weetfeld ist ein Jungbulle aus eigener Nachzucht mit rassetypischem, ausdrucksstarkem Erscheinungsbild und ruhigem Grundtemperament.',
      images: [
        {
          src: 'images/jungtiere/jungbullen/jackson-3-vom-weetfeld/picture-200 (3).jpeg',
          alt: 'Jackson 3 – Ansicht 1',
          placeholder: 'Jackson 3',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/jackson-3-vom-weetfeld/picture-200 (4).jpeg',
          alt: 'Jackson 3 – Ansicht 2',
          placeholder: 'Jackson 3',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/jackson-3-vom-weetfeld/picture-200 (5).jpeg',
          alt: 'Jackson 3 – Ansicht 3',
          placeholder: 'Jackson 3',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'jaimen-vom-weetfeld', name: 'Jaimen vom Weetfeld', category: 'jungbullen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Jungbulle',
      description: 'Jaimen vom Weetfeld ist ein Jungbulle mit vollständig dokumentierter Abstammung und Gesundheitsstatus.',
      images: [
        {
          src: 'images/jungtiere/jungbullen/jaimen-vom-weetfeld/picture-200 (6).jpeg',
          alt: 'Jaimen – Ansicht 1',
          placeholder: 'Jaimen',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/jaimen-vom-weetfeld/picture-200 (7).jpeg',
          alt: 'Jaimen – Ansicht 2',
          placeholder: 'Jaimen',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/jaimen-vom-weetfeld/picture-200 (8).jpeg',
          alt: 'Jaimen – Ansicht 3',
          placeholder: 'Jaimen',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'janish-vom-weetfeld', name: 'Janish vom Weetfeld', category: 'jungbullen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Jungbulle',
      description: 'Janish vom Weetfeld ist ein Jungbulle aus der eigenen Nachzucht des Betriebs.',
      images: [
        {
          src: 'images/jungtiere/jungbullen/janish-vom-weetfeld/picture-200 (9).jpeg',
          alt: 'Janish – Ansicht 1',
          placeholder: 'Janish',
          isPrimary: true,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/janish-vom-weetfeld/picture-200 (10).jpeg',
          alt: 'Janish – Ansicht 2',
          placeholder: 'Janish',
          isPrimary: false,
          size: 'small'
        },
        {
          src: 'images/jungtiere/jungbullen/janish-vom-weetfeld/picture-200 (11).jpeg',
          alt: 'Janish – Ansicht 3',
          placeholder: 'Janish',
          isPrimary: false,
          size: 'small'
        },
      ]
    },
    {
      id: 'jerome-4-vom-weetfeld', name: 'Jerome 4 vom Weetfeld', category: 'jungbullen',
      origin: 'Eigene Nachzucht – Highlander vom Weetfeld', status: 'Jungbulle',
      description: 'Jerome 4 vom Weetfeld ist ein Jungbulle mit kräftigem Körperbau und zuchttauglichem Potenzial.',
      images: [
        {
          src: 'images/jungtiere/jungbullen/jerome-4-vom-weetfeld/picture-1600.jpg',
          alt: 'Jerome 4 – Hauptbild',
          placeholder: 'Jerome 4',
          isPrimary: true,
          size: 'medium'
        },
        {
          src: 'images/jungtiere/jungbullen/jerome-4-vom-weetfeld/picture-1600.jpeg',
          alt: 'Jerome 4 – Ansicht 2',
          placeholder: 'Jerome 4',
          isPrimary: false,
          size: 'medium'
        },
        {
          src: 'images/jungtiere/jungbullen/jerome-4-vom-weetfeld/picture-200 (2).jpeg',
          alt: 'Jerome 4 – Thumbnail',
          placeholder: 'Jerome 4',
          isPrimary: false,
          size: 'small'
        },
      ]
    }
  ];

  // ===== Öffentliche Methoden =====

  getAnimalsByCategory(category: AnimalCategory): Animal[] {
    switch (category) {
      case 'stammkuehe':
        return this.stammkuehe;
      case 'mutterkuehe':
        return this.mutterkuehe;
      case 'zuchtbullen':
        return this.zuchtbullen;
      case 'kaelber':
        return this.kaelber;
      case 'faersen':
        return this.faersen;
      case 'jungbullen':
        return this.jungbullen;
      default:
        return [];
    }
  }

  getAnimalById(category: AnimalCategory, id: string): Animal | undefined {
    return this.getAnimalsByCategory(category).find(a => a.id === id);
  }

  getCategoryLabel(category: AnimalCategory): string {
    const labels: Record<AnimalCategory, string> = {
      stammkuehe: 'Stammkühe', mutterkuehe: 'Mutterkühe', zuchtbullen: 'Zuchtbullen',
      kaelber: 'Kälber', faersen: 'Färsen', jungbullen: 'Jungbullen'
    };
    return labels[category] || category;
  }

  getCategoryDescription(category: AnimalCategory): string {
    const descriptions: Record<AnimalCategory, string> = {
      stammkuehe: 'Die Stammkühe sind die Basis der Zucht „Highlander vom Weetfeld". Sie sind die Gründungstiere des Bestands und prägen maßgeblich die Zuchtziele und die genetische Grundlage aller Nachkommen.',
      mutterkuehe: 'Die Mutterkühe „vom Weetfeld" sind die aktive Zuchtbasis des Betriebs. Sie sind überwiegend aus eigener Nachzucht entstanden und tragen das „vom Weetfeld"-Namenssuffix.',
      zuchtbullen: 'Die Zuchtbullen spielen eine zentrale Rolle in der Zucht „Highlander vom Weetfeld". Sie werden sorgfältig ausgewählt und müssen dem Zuchtideal in Typ, Charakter und Abstammung entsprechen.',
      kaelber: 'Highland-Cattle-Kälber sind sehr robust und werden von ihren Müttern naturnah aufgezogen – ohne Zufütterung oder künstliche Eingriffe.',
      faersen: 'Die Färsen des Betriebs sind weibliche Jungtiere, die entweder als zukünftige Zuchttiere im Bestand verbleiben oder als hochwertige Zuchttiere an andere Züchter abgegeben werden.',
      jungbullen: 'Die Jungbullen sind männliche Nachzuchten aus dem Betrieb „vom Weetfeld". Sie werden entweder als zukünftige Zuchtbullen gehalten oder zur Direktvermarktung (Fleisch) vorgesehen.'
    };
    return descriptions[category] || '';
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
