export type PedigreeViewMode = 'ancestors' | 'descendants' | 'both';
export type PedigreeRole = 'root' | 'sire' | 'dam' | 'offspring';

export interface PedigreeRawEntry {
  id: string;
  sire?: string | null;
  dam?: string | null;
  dom?: string | null;
  info?: string | null;
  path?: string | null;
  highlight?: boolean;
}

export interface PedigreeEntry {
  id: string;
  sire?: string;
  dam?: string;
  info?: string;
  path?: string;
  highlight: boolean;
}

export interface PedigreeNode {
  key: string;
  id: string;
  relationLabel: string;
  role: PedigreeRole;
  direction: 'up' | 'down' | 'root';
  info?: string;
  coatColor?: string;
  grading?: string;
  birthDate?: string;
  categoryLabel?: string;
  imageSrc?: string;
  routePath?: string;
  highlight: boolean;
  offspringCount: number;
  hasHiddenChildren?: boolean;
  children?: PedigreeNode[];
}
