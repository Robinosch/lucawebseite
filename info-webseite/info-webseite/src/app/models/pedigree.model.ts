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
  info?: string;
  imageSrc?: string;
  routePath?: string;
  highlight: boolean;
  children?: PedigreeNode[];
}

