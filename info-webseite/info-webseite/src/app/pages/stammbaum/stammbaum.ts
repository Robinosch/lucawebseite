import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import * as d3 from 'd3';
import { Subscription } from 'rxjs';
import { PedigreeService } from '../../services/pedigree.service';
import {
  PedigreeEntry,
  PedigreeNode,
  PedigreeRole,
  PedigreeViewMode
} from '../../models/pedigree.model';
import { AnimalImage } from '../../models/animal.model';
import { AnimalService } from '../../services/animal.service';

interface AnimalLookupMeta {
  imageSrc?: string;
  routePath: string;
  birthDate?: string;
  status?: string;
  description?: string;
  categoryLabel?: string;
}

@Component({
  selector: 'app-stammbaum',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './stammbaum.html',
  styleUrl: './stammbaum.css'
})
export class Stammbaum implements AfterViewInit, OnDestroy {
  private readonly pedigreeService = inject(PedigreeService);
  private readonly animalService = inject(AnimalService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly subscriptions = new Subscription();

  @ViewChild('treeContainer') treeContainer?: ElementRef<HTMLDivElement>;

  readonly entries = signal<PedigreeEntry[]>([]);
  readonly highlightedAnimals = signal<PedigreeEntry[]>([]);
  readonly externalAnimals = signal<PedigreeEntry[]>([]);
  readonly selectedId = signal<string>('');
  readonly viewMode = signal<PedigreeViewMode>('both');
  readonly isHorizontal = signal<boolean>(false);
  readonly maxDepth = signal<number>(4);
  readonly searchTerm = signal<string>('');
  readonly detailId = signal<string>('');
  readonly visibleNodeCount = signal<number>(0);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  readonly keyFounders = [
    { id: 'Max vom Holschenhof', label: 'Max v. Holschenhof (♂)', icon: 'shield' },
    { id: 'Anthea Fox of Blocken', label: 'Anthea (Stammkuh)', icon: 'star' },
    { id: 'Niseag Fox of Blocken', label: 'Niseag (Stammkuh)', icon: 'star' },
    { id: 'Gilka von der Rehhecke', label: 'Gilka (Stammkuh)', icon: 'star' },
    { id: 'Lux vom schönen Felde', label: 'Lux v. schönen Felde (♂)', icon: 'shield' }
  ];

  private readonly animalMetaByKey = computed(() => this.createAnimalMetaLookup());

  readonly searchMatches = computed(() => {
    const term = this.normalizeNameKey(this.searchTerm());
    if (!term) return [];
    return this.entries()
      .filter(entry => this.normalizeNameKey(entry.id).includes(term))
      .slice(0, 8);
  });

  readonly detailEntry = computed(() => {
    const id = this.detailId();
    return this.entries().find(entry => entry.id === id);
  });

  readonly detailAnimalMeta = computed(() => {
    const detail = this.detailEntry();
    if (!detail) return undefined;
    return this.animalMetaByKey().get(this.normalizeNameKey(detail.id));
  });

  readonly detailOffspring = computed(() => {
    const detail = this.detailEntry();
    if (!detail) return [];
    return this.getOffspringFor(detail.id);
  });

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoomLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private zoomBehavior?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private themeObserver?: MutationObserver;
  private pendingQueryAnimal: string | null = null;

  constructor() {
    // Re-Rendern sobald AnimalService alle Bilder und Tierprofile geladen hat
    effect(() => {
      const metaMap = this.animalMetaByKey();
      if (metaMap.size > 0 && this.entries().length > 0 && !this.loading()) {
        requestAnimationFrame(() => this.renderTree(false));
      }
    });
  }

  ngAfterViewInit(): void {
    const querySub = this.route.queryParamMap.subscribe(params => {
      const requested = params.get('animal');
      if (requested) {
        this.pendingQueryAnimal = requested;
        this.applyRequestedAnimalIfReady();
      }
    });
    this.subscriptions.add(querySub);

    this.loadData();
    this.observeThemeChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.themeObserver?.disconnect();
  }

  onAnimalChange(id: string): void {
    this.selectedId.set(id);
    this.detailId.set(id);
    this.renderTree(true);
  }

  onViewModeChange(mode: PedigreeViewMode): void {
    this.viewMode.set(mode);
    this.renderTree(true);
  }

  toggleOrientation(): void {
    this.isHorizontal.update(v => !v);
    this.renderTree(true);
  }

  onDepthChange(depth: number): void {
    const clampedDepth = Math.max(2, Math.min(6, depth));
    this.maxDepth.set(clampedDepth);
    this.renderTree(true);
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
  }

  selectSearchResult(id: string): void {
    this.searchTerm.set('');
    this.showAsRoot(id);
  }

  selectFounder(id: string): void {
    this.selectedId.set(id);
    this.detailId.set(id);
    // Bei Zuchtbullen/Stammkühen ist "both" (Vorfahren + Nachkommen) ideal
    if (this.viewMode() === 'ancestors' && this.getOffspringFor(id).length > 0) {
      this.viewMode.set('both');
    }
    this.renderTree(true);
  }

  openDetails(id: string): void {
    if (this.entries().some(entry => entry.id === id)) {
      this.detailId.set(id);
    }
  }

  showAsRoot(id: string): void {
    if (!this.entries().some(e => e.id === id)) {
      return;
    }
    this.selectedId.set(id);
    this.detailId.set(id);
    this.renderTree(true);
  }

  navigateToAnimal(): void {
    const entry = this.detailEntry();
    const path = entry?.path ?? (entry ? this.getAnimalRouteForName(entry.id) : undefined);
    if (path) {
      this.router.navigateByUrl(path);
    }
  }

  closeDetails(): void {
    this.detailId.set('');
  }

  zoomIn(): void {
    if (!this.svg || !this.zoomBehavior) return;
    this.svg.transition().duration(240).call(this.zoomBehavior.scaleBy, 1.25);
  }

  zoomOut(): void {
    if (!this.svg || !this.zoomBehavior) return;
    this.svg.transition().duration(240).call(this.zoomBehavior.scaleBy, 0.8);
  }

  zoomToFit(animate = true): void {
    if (!this.svg || !this.zoomBehavior || !this.zoomLayer) return;
    const container = this.treeContainer?.nativeElement;
    const svgNode = this.zoomLayer.node();
    if (!container || !svgNode) return;

    const bounds = svgNode.getBBox();
    if (bounds.width === 0 || bounds.height === 0) return;

    const fullWidth = container.clientWidth || 920;
    const fullHeight = container.clientHeight || 760;
    const padding = 68;

    const scaleX = (fullWidth - padding * 2) / bounds.width;
    const scaleY = (fullHeight - padding * 2) / bounds.height;
    const scale = Math.max(0.42, Math.min(1.08, Math.min(scaleX, scaleY)));

    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const translateX = fullWidth / 2 - scale * centerX;
    const translateY = fullHeight / 2 - scale * centerY;

    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
    if (animate) {
      this.svg.transition().duration(420).ease(d3.easeCubicOut).call(this.zoomBehavior.transform, transform);
    } else {
      this.svg.call(this.zoomBehavior.transform, transform);
    }
  }

  getOffspringFor(parentId: string): PedigreeEntry[] {
    const normParent = this.normalizeNameKey(parentId);
    return this.entries().filter(
      e =>
        (e.sire && this.normalizeNameKey(e.sire) === normParent) ||
        (e.dam && this.normalizeNameKey(e.dam) === normParent)
    );
  }

  getInitials(value: string): string {
    const words = value.trim().split(/\s+/).filter(Boolean);
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('') || '?';
  }

  getAnimalImageForName(name: string): string | undefined {
    return this.animalMetaByKey().get(this.normalizeNameKey(name))?.imageSrc;
  }

  getAnimalRouteForName(name: string): string | undefined {
    return this.animalMetaByKey().get(this.normalizeNameKey(name))?.routePath;
  }

  private loadData(): void {
    this.loading.set(true);
    this.error.set('');

    const sub = this.pedigreeService.getEntries().subscribe({
      next: entries => {
        const enrichedEntries = entries.map(entry => ({
          ...entry,
          path: entry.path ?? this.getAnimalRouteForName(entry.id)
        }));

        this.entries.set(enrichedEntries);

        const highlighted = enrichedEntries
          .filter(entry => entry.highlight)
          .sort((a, b) => a.id.localeCompare(b.id, 'de'));

        const external = enrichedEntries
          .filter(entry => !entry.highlight)
          .sort((a, b) => a.id.localeCompare(b.id, 'de'));

        this.highlightedAnimals.set(highlighted);
        this.externalAnimals.set(external);

        if (!this.applyRequestedAnimalIfReady()) {
          // Standardmäßig mit einer Stammkuh oder dem ersten Bestandstier starten
          const defaultAnimal =
            highlighted.find(a => a.id === 'Narnia vom Weetfeld') ??
            highlighted[0] ??
            enrichedEntries[0];

          if (defaultAnimal) {
            this.selectedId.set(defaultAnimal.id);
            this.detailId.set(defaultAnimal.id);
          }
        }

        this.loading.set(false);
        requestAnimationFrame(() => this.renderTree(true));
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Die Stammbaum-Daten konnten nicht geladen werden.');
      }
    });

    this.subscriptions.add(sub);
  }

  private applyRequestedAnimalIfReady(): boolean {
    if (!this.pendingQueryAnimal || this.entries().length === 0) {
      return false;
    }
    const targetKey = this.normalizeNameKey(this.pendingQueryAnimal);
    const match = this.entries().find(e => this.normalizeNameKey(e.id) === targetKey)
      ?? this.entries().find(e => this.normalizeNameKey(e.id).includes(targetKey));

    if (match) {
      this.pendingQueryAnimal = null;
      this.selectedId.set(match.id);
      this.detailId.set(match.id);
      requestAnimationFrame(() => this.renderTree(true));
      return true;
    }
    return false;
  }

  private renderTree(animateFit = true): void {
    const container = this.treeContainer?.nativeElement;
    if (!container) return;

    container.innerHTML = '';

    const entries = this.entries();
    const selected = this.selectedId();
    if (!entries.length || !selected) return;

    const dataById = new Map(entries.map(entry => [entry.id, entry]));
    const isDark = this.isDarkTheme();
    const horizontal = this.isHorizontal();
    const mode = this.viewMode();
    const depthLimit = this.maxDepth();

    const palette = {
      sireStroke: isDark ? '#64b5f6' : '#2b6cb0',
      sireFill: isDark ? '#152636' : '#ebf5ff',
      damStroke: isDark ? '#f48fb1' : '#b83280',
      damFill: isDark ? '#331b26' : '#fff0f6',
      offspringStroke: isDark ? '#ffb74d' : '#c05621',
      offspringFill: isDark ? '#332414' : '#fffaf0',
      rootStroke: isDark ? '#81c784' : '#214b2b',
      rootFill: isDark ? '#1e3a27' : '#dcebdc',
      externalStroke: isDark ? '#556058' : '#b8c4bb',
      externalFill: isDark ? '#1e2420' : '#f7f9f7',
      herdFill: isDark ? '#182e20' : '#eef7f0',
      herdStroke: isDark ? '#6fbf7a' : '#356b3d'
    };

    const width = Math.max(container.clientWidth, 880);
    const height = 780;

    this.svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'pedigree-svg');

    const defs = this.svg.append('defs');

    // runde Clip-Maske für Tier-Thumbnails
    const nodeWidth = 236;
    const nodeHeight = 84;
    const avatarCenterX = -nodeWidth / 2 + 34;

    defs
      .append('clipPath')
      .attr('id', 'avatar-clip')
      .append('circle')
      .attr('cx', avatarCenterX)
      .attr('cy', 0)
      .attr('r', 23);

    this.zoomLayer = this.svg.append('g').attr('class', 'zoom-layer');
    this.zoomBehavior = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.32, 2.5])
      .on('zoom', event => {
        if (this.zoomLayer) {
          this.zoomLayer.attr('transform', event.transform.toString());
        }
      });

    this.svg.call(this.zoomBehavior).on('dblclick.zoom', null);

    // Baum-Daten je nach Modus aufbauen
    const allNodes: d3.HierarchyPointNode<PedigreeNode>[] = [];
    const allLinks: { source: d3.HierarchyPointNode<PedigreeNode>; target: d3.HierarchyPointNode<PedigreeNode> }[] = [];

    const dx = horizontal ? 115 : 262;
    const dy = horizontal ? 295 : 148;
    const treeLayout = d3.tree<PedigreeNode>().nodeSize([dx, dy]);

    if (mode === 'ancestors' || mode === 'both') {
      const ancestorRoot = this.buildAncestorNode(
        selected,
        'Fokus-Tier',
        'root',
        dataById,
        depthLimit,
        new Set<string>(),
        0
      );
      if (ancestorRoot) {
        const hRoot = d3.hierarchy(ancestorRoot);
        const pointRoot = treeLayout(hRoot);

        pointRoot.each(node => {
          if (mode === 'both') {
            // In der Komplettansicht wachsen Vorfahren nach oben (bzw. links)
            node.y = -Math.abs(node.y);
          }
          if (horizontal) {
            const tmp = node.x;
            node.x = node.y;
            node.y = tmp;
          }
          allNodes.push(node);
        });

        for (const link of pointRoot.links()) {
          allLinks.push(link);
        }
      }
    }

    if (mode === 'descendants' || mode === 'both') {
      const descRoot = this.buildDescendantNode(
        selected,
        'Fokus-Tier',
        dataById,
        depthLimit,
        new Set<string>(),
        0
      );
      if (descRoot) {
        const hDesc = d3.hierarchy(descRoot);
        const pointDesc = treeLayout(hDesc);

        pointDesc.each(node => {
          if (horizontal) {
            const tmp = node.x;
            node.x = node.y;
            node.y = tmp;
          }
          // Im "both"-Modus existiert der Root-Knoten bereits aus dem Vorfahren-Baum
          if (mode === 'both' && node.depth === 0) {
            return;
          }
          allNodes.push(node);
        });

        for (const link of pointDesc.links()) {
          allLinks.push(link);
        }
      }
    }

    this.visibleNodeCount.set(allNodes.length);

    // Verbindungslinien zeichnen
    const linksGroup = this.zoomLayer.append('g').attr('class', 'links-layer');
    const nodesGroup = this.zoomLayer.append('g').attr('class', 'nodes-layer');

    const linkSelection = linksGroup
      .selectAll<SVGPathElement, { source: d3.HierarchyPointNode<PedigreeNode>; target: d3.HierarchyPointNode<PedigreeNode> }>('.tree-link')
      .data(allLinks)
      .join('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke', link => {
        const role = link.target.data.role;
        if (role === 'sire') return palette.sireStroke;
        if (role === 'dam') return palette.damStroke;
        if (role === 'offspring') return palette.offspringStroke;
        return palette.externalStroke;
      })
      .attr('stroke-width', 2.2)
      .attr('stroke-dasharray', link => (link.target.data.highlight ? 'none' : '5,4'))
      .attr('opacity', 0.72)
      .attr('d', link => {
        const sx = link.source.x;
        const sy = link.source.y;
        const tx = link.target.x;
        const ty = link.target.y;

        if (horizontal) {
          const midX = (sx + tx) / 2;
          return `M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`;
        }
        const midY = (sy + ty) / 2;
        return `M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`;
      });

    // Knoten zeichnen
    const nodeSelection = nodesGroup
      .selectAll<SVGGElement, d3.HierarchyPointNode<PedigreeNode>>('.tree-node')
      .data(allNodes, d => d.data.key)
      .join('g')
      .attr('class', d => `tree-node role-${d.data.role} ${d.data.highlight ? 'is-herd' : 'is-external'}`)
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event: MouseEvent, node) => {
        event.stopPropagation();
        this.openDetails(node.data.id);
      })
      .on('dblclick', (event: MouseEvent, node) => {
        event.stopPropagation();
        this.showAsRoot(node.data.id);
      })
      .on('mouseenter', (_event: MouseEvent, hoveredNode) => {
        this.highlightBloodline(hoveredNode, nodeSelection, linkSelection);
      })
      .on('mouseleave', () => {
        this.clearBloodlineHighlight(nodeSelection, linkSelection);
      });

    // Karten-Hintergrund
    nodeSelection
      .append('rect')
      .attr('class', 'node-card-bg')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 16)
      .attr('ry', 16)
      .attr('fill', d => {
        if (d.data.role === 'root') return palette.rootFill;
        if (d.data.highlight) return palette.herdFill;
        if (d.data.role === 'sire') return palette.sireFill;
        if (d.data.role === 'dam') return palette.damFill;
        if (d.data.role === 'offspring') return palette.offspringFill;
        return palette.externalFill;
      })
      .attr('stroke', d => {
        if (d.data.role === 'root') return palette.rootStroke;
        if (d.data.role === 'sire') return palette.sireStroke;
        if (d.data.role === 'dam') return palette.damStroke;
        if (d.data.role === 'offspring') return palette.offspringStroke;
        return d.data.highlight ? palette.herdStroke : palette.externalStroke;
      })
      .attr('stroke-width', d => (d.data.role === 'root' ? 3 : d.data.highlight ? 2.2 : 1.5));

    // Farbiger Akzent-Streifen links auf der Karte
    nodeSelection
      .append('rect')
      .attr('x', -nodeWidth / 2 + 5)
      .attr('y', -nodeHeight / 2 + 12)
      .attr('width', 4)
      .attr('height', nodeHeight - 24)
      .attr('rx', 2)
      .attr('fill', d => {
        if (d.data.role === 'root') return palette.rootStroke;
        if (d.data.role === 'sire') return palette.sireStroke;
        if (d.data.role === 'dam') return palette.damStroke;
        if (d.data.role === 'offspring') return palette.offspringStroke;
        return palette.externalStroke;
      });

    // Avatar-Hintergrundkreis
    nodeSelection
      .append('circle')
      .attr('cx', avatarCenterX)
      .attr('cy', 0)
      .attr('r', 24)
      .attr('fill', d => (d.data.highlight ? '#d4ead8' : isDark ? '#2a322d' : '#e6ece8'))
      .attr('stroke', d => {
        if (d.data.role === 'sire') return palette.sireStroke;
        if (d.data.role === 'dam') return palette.damStroke;
        if (d.data.role === 'offspring') return palette.offspringStroke;
        return d.data.highlight ? palette.herdStroke : palette.externalStroke;
      })
      .attr('stroke-width', 1.8);

    // Initialen für Knoten ohne Bild
    nodeSelection
      .filter(d => !d.data.imageSrc)
      .append('text')
      .attr('class', 'node-placeholder-text')
      .attr('text-anchor', 'middle')
      .attr('x', avatarCenterX)
      .attr('y', 5)
      .text(d => this.getInitials(d.data.id));

    // Rundes Tier-Foto (geclippt)
    nodeSelection
      .filter(d => Boolean(d.data.imageSrc))
      .append('image')
      .attr('x', avatarCenterX - 23)
      .attr('y', -23)
      .attr('width', 46)
      .attr('height', 46)
      .attr('clip-path', 'url(#avatar-clip)')
      .attr('href', d => d.data.imageSrc ?? '')
      .attr('preserveAspectRatio', 'xMidYMid slice');

    const textStartX = -nodeWidth / 2 + 68;

    // Rollen-Badge (z. B. "♂ Vater", "♀ Mutter", "★ Fokus-Tier")
    nodeSelection
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', textStartX)
      .attr('y', -18)
      .attr('class', 'node-relation')
      .text(d => d.data.relationLabel);

    // Tiername
    nodeSelection
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', textStartX)
      .attr('y', 1)
      .attr('class', 'node-title')
      .text(d => (d.data.id.length > 21 ? `${d.data.id.slice(0, 20)}…` : d.data.id));

    // Zusatz-Info (Bewertung / Farbschlag / Geburtsdatum)
    nodeSelection
      .append('text')
      .attr('text-anchor', 'start')
      .attr('x', textStartX)
      .attr('y', 20)
      .attr('class', 'node-info')
      .text(d => {
        if (d.data.info && d.data.info !== '-') {
          return d.data.info.length > 24 ? `${d.data.info.slice(0, 23)}…` : d.data.info;
        }
        if (d.data.birthDate && d.data.birthDate !== '-') {
          return `geb. ${d.data.birthDate}`;
        }
        return d.data.highlight ? 'Bestand vom Weetfeld' : 'Ahnenregister';
      });

    // Kleines Nachkommen-Badge oben rechts, falls das Tier Kinder hat
    const nodesWithOffspring = nodeSelection.filter(d => d.data.offspringCount > 0 && d.data.role !== 'root');
    nodesWithOffspring
      .append('circle')
      .attr('cx', nodeWidth / 2 - 16)
      .attr('cy', -nodeHeight / 2 + 16)
      .attr('r', 10)
      .attr('fill', palette.herdStroke);

    nodesWithOffspring
      .append('text')
      .attr('x', nodeWidth / 2 - 16)
      .attr('y', -nodeHeight / 2 + 20)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .text(d => `${d.data.offspringCount}`);

    this.zoomToFit(animateFit);
  }

  /**
   * Hebt beim Hover über einen Knoten den gesamten Blutlinien-Pfad zum Fokus-Tier hervor.
   */
  private highlightBloodline(
    hovered: d3.HierarchyPointNode<PedigreeNode>,
    nodeSelection: d3.Selection<SVGGElement, d3.HierarchyPointNode<PedigreeNode>, SVGGElement, unknown>,
    linkSelection: d3.Selection<SVGPathElement, { source: d3.HierarchyPointNode<PedigreeNode>; target: d3.HierarchyPointNode<PedigreeNode> }, SVGGElement, unknown>
  ): void {
    const activeKeys = new Set<string>();

    // Alle Vorfahren bis zum Root-Knoten im aktuellen Teilbaum sammeln
    let current: d3.HierarchyPointNode<PedigreeNode> | null = hovered;
    while (current) {
      activeKeys.add(current.data.key);
      current = current.parent;
    }

    // Alle direkten Unterknoten des gehoverten Tiers ebenfalls einschließen
    hovered.each(desc => activeKeys.add(desc.data.key));

    nodeSelection
      .transition()
      .duration(160)
      .attr('opacity', d => (activeKeys.has(d.data.key) || d.data.role === 'root' ? 1 : 0.25));

    linkSelection
      .transition()
      .duration(160)
      .attr('opacity', link =>
        activeKeys.has(link.source.data.key) && activeKeys.has(link.target.data.key) ? 1 : 0.14
      )
      .attr('stroke-width', link =>
        activeKeys.has(link.source.data.key) && activeKeys.has(link.target.data.key) ? 3.4 : 1.6
      );
  }

  private clearBloodlineHighlight(
    nodeSelection: d3.Selection<SVGGElement, d3.HierarchyPointNode<PedigreeNode>, SVGGElement, unknown>,
    linkSelection: d3.Selection<SVGPathElement, { source: d3.HierarchyPointNode<PedigreeNode>; target: d3.HierarchyPointNode<PedigreeNode> }, SVGGElement, unknown>
  ): void {
    nodeSelection.transition().duration(180).attr('opacity', 1);
    linkSelection.transition().duration(180).attr('opacity', 0.72).attr('stroke-width', 2.2);
  }

  private buildAncestorNode(
    id: string,
    relationLabel: string,
    role: PedigreeRole,
    dataById: Map<string, PedigreeEntry>,
    maxDepth: number,
    branchVisited: Set<string>,
    depth: number
  ): PedigreeNode | null {
    if (depth > maxDepth) return null;

    const entry = dataById.get(id);
    const meta = this.animalMetaByKey().get(this.normalizeNameKey(id));
    const offspringCount = this.getOffspringFor(id).length;

    const node: PedigreeNode = {
      key: `anc-${id}-${role}-${depth}-${branchVisited.size}`,
      id,
      relationLabel: depth === 0 ? '★ Fokus-Tier' : relationLabel,
      role,
      direction: depth === 0 ? 'root' : 'up',
      info: entry?.info,
      birthDate: meta?.birthDate,
      categoryLabel: meta?.categoryLabel,
      imageSrc: meta?.imageSrc,
      routePath: entry?.path ?? meta?.routePath,
      highlight: entry ? entry.highlight : false,
      offspringCount,
      children: []
    };

    if (!entry || depth === maxDepth || branchVisited.has(id)) {
      node.children = undefined;
      return node;
    }

    const nextVisited = new Set(branchVisited);
    nextVisited.add(id);

    const sireNode = entry.sire
      ? this.buildAncestorNode(entry.sire, '♂ Vater', 'sire', dataById, maxDepth, nextVisited, depth + 1)
      : null;
    const damNode = entry.dam
      ? this.buildAncestorNode(entry.dam, '♀ Mutter', 'dam', dataById, maxDepth, nextVisited, depth + 1)
      : null;

    node.children = [sireNode, damNode].filter((child): child is PedigreeNode => child !== null);
    if (node.children.length === 0) {
      node.children = undefined;
    }

    return node;
  }

  private buildDescendantNode(
    id: string,
    relationLabel: string,
    dataById: Map<string, PedigreeEntry>,
    maxDepth: number,
    branchVisited: Set<string>,
    depth: number
  ): PedigreeNode | null {
    if (depth > maxDepth) return null;

    const entry = dataById.get(id);
    const meta = this.animalMetaByKey().get(this.normalizeNameKey(id));
    const directChildren = this.getOffspringFor(id);

    const node: PedigreeNode = {
      key: `desc-${id}-${depth}-${branchVisited.size}`,
      id,
      relationLabel: depth === 0 ? '★ Fokus-Tier' : relationLabel,
      role: depth === 0 ? 'root' : 'offspring',
      direction: depth === 0 ? 'root' : 'down',
      info: entry?.info,
      birthDate: meta?.birthDate,
      categoryLabel: meta?.categoryLabel,
      imageSrc: meta?.imageSrc,
      routePath: entry?.path ?? meta?.routePath,
      highlight: entry ? entry.highlight : true,
      offspringCount: directChildren.length,
      children: []
    };

    if (depth === maxDepth || branchVisited.has(id) || directChildren.length === 0) {
      node.children = undefined;
      return node;
    }

    const nextVisited = new Set(branchVisited);
    nextVisited.add(id);

    const childLabel = depth === 0 ? 'Nachkomme (1. Gen.)' : `Nachkomme (${depth + 1}. Gen.)`;
    node.children = directChildren
      .map(child => this.buildDescendantNode(child.id, childLabel, dataById, maxDepth, nextVisited, depth + 1))
      .filter((c): c is PedigreeNode => c !== null);

    if (node.children.length === 0) {
      node.children = undefined;
    }

    return node;
  }

  private observeThemeChanges(): void {
    const root = document.documentElement;
    this.themeObserver = new MutationObserver(() => this.renderTree(false));
    this.themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private isDarkTheme(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  private createAnimalMetaLookup(): Map<string, AnimalLookupMeta> {
    const lookup = new Map<string, AnimalLookupMeta>();
    for (const animal of this.animalService.allAnimals()) {
      const image = this.pickBestImage(animal.images);
      const baseRoute = this.animalService.getCategoryRoute(animal.category);
      const meta: AnimalLookupMeta = {
        imageSrc: image?.src,
        routePath: animal.category === 'kaelber' ? baseRoute : `${baseRoute}/${animal.id}`,
        birthDate: animal.birthDate,
        status: animal.status,
        description: animal.description,
        categoryLabel: this.animalService.getCategoryLabel(animal.category)
      };

      lookup.set(this.normalizeNameKey(animal.name), meta);
      lookup.set(this.normalizeNameKey(animal.id), meta);
    }
    return lookup;
  }

  private pickBestImage(images: AnimalImage[]): AnimalImage | undefined {
    // Für die kleinen SVG-Avatare bevorzugen wir schnelle 200px-Thumbnails, sonst Primary
    return (
      images.find(img => img.size === 'small' && !!img.src) ??
      images.find(img => img.isPrimary && !!img.src) ??
      images.find(img => !!img.src)
    );
  }

  private normalizeNameKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .toLowerCase()
      .replace(/\bv\.\s*/g, 'vom ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}
