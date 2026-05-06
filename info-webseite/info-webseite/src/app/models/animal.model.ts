/**
 * Datenmodell für Tierdaten – Highlander vom Weetfeld
 * Alle Tiere der Zucht werden über dieses Interface abgebildet.
 */

/** Bild-Platzhalter für ein Tier */
export interface AnimalImage {
  /** Name der Kuh */
  name?: string,
  /** Beschreibender Text, was das Bild zeigt */
  placeholder: string;
  /** Alt-Text für Barrierefreiheit */
  alt: string;
  /** Ist dieses Bild das Hauptbild? */
  isPrimary: boolean;
  /** Pfad zum echten Bild (relativ zu /images/) */
  src?: string;
  /** Bildgröße: 'small' (~200px), 'medium' (~1600px), 'large' (~2600px) */
  size?: 'small' | 'medium' | 'large';
}

/** Tierkategorien als Union-Type */
export type AnimalCategory =
  | 'stammkuehe'
  | 'mutterkuehe'
  | 'zuchtbullen'
  | 'kaelber'
  | 'faersen'
  | 'jungbullen';

/** Tier-Interface für alle Kategorien */
export interface Animal {
  /** URL-freundlicher Slug, z. B. 'anthea-fox-of-blocken' */
  id: string;
  /** Vollständiger Name des Tieres */
  name: string;
  /** Kategorie des Tieres */
  category: AnimalCategory;
  /** Geburtsdatum (Anzeigeformat, z. B. '04.09.1997') */
  birthDate?: string;
  /** Herkunft / Züchter */
  origin?: string;
  /** Status, z. B. 'Aktive Stammkuh', 'Zuchtbulle' */
  status?: string;
  /** Ausführlicher Beschreibungstext */
  description: string;
  /** Informationen über Nachkommen (Text) */
  offspring?: string;
  /** Bilder des Tieres */
  images: AnimalImage[];
  /** Pfad zur Abstammungstabelle (Bild) */
  lineageImageSrc?: string;
  /** Bilder vom Nachwuchs dieses Tieres */
  offspringImages?: AnimalImage[];
}

/**
 * Rohdatenformat aus JSON-Dateien (Bilder werden nur als Ordner referenziert).
 * Diese Struktur wird im Service in das UI-Modell Animal hydratisiert.
 */
export interface AnimalRaw extends Omit<Animal, 'images' | 'offspringImages' | 'lineageImageSrc'> {
  /** Bildordner relativ zu /images, z. B. /images/mutterkühe/antigone-vom-weetfeld */
  images?: string;
  /** Bildordner für Nachwuchs relativ zu /images, z. B. /images/.../nachwuchs */
  offspringImages?: string;
}

/** Metadaten für eine Tierkategorie (für die Übersichtsseite /unsere-highlander) */
export interface AnimalCategoryInfo {
  /** URL-Slug der Kategorie */
  slug: string;
  /** Anzeigename */
  label: string;
  /** Kurzbeschreibung */
  description: string;
  /** Material Icon */
  icon: string;
  /** Router-Pfad */
  routerLink: string;
  /** Platzhalter-Bildbeschreibung */
  imagePlaceholder: string;
  /** Pfad zum echten Kategorie-Bild (optional) */
  imageSrc?: string;
}
