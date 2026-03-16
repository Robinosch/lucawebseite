import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import * as d3 from 'd3';
import { PedigreeService } from '../../services/pedigree.service';
import { PedigreeEntry, PedigreeNode } from '../../models/pedigree.model';
import { Subscription } from 'rxjs';
import { AnimalCategory, AnimalImage } from '../../models/animal.model';
import { AnimalService } from '../../services/animal.service';

interface AnimalLookupMeta {
  imageSrc?: string;
  routePath: string;
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
  private readonly subscriptions = new Subscription();
  private readonly animalMetaByKey = this.createAnimalMetaLookup();

  @ViewChild('treeContainer') treeContainer?: ElementRef<HTMLDivElement>;

  readonly entries = signal<PedigreeEntry[]>([]);
  readonly highlightedAnimals = signal<PedigreeEntry[]>([]);
  readonly selectedId = signal<string>('');
  readonly maxDepth = signal<number>(4);

  readonly loading = signal<boolean>(true);
  readonly error = signal<string>('');

  private svg?: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private zoomLayer?: d3.Selection<SVGGElement, unknown, null, undefined>;
  private zoomBehavior?: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private themeObserver?: MutationObserver;

  ngAfterViewInit(): void {
    this.loadData();
    this.observeThemeChanges();

    // Falls Daten schon geladen sind, rendern wir nach dem ersten Paint erneut.
    requestAnimationFrame(() => this.renderTree());
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.themeObserver?.disconnect();
  }

  onAnimalChange(id: string): void {
    this.selectedId.set(id);
    this.renderTree();
  }

  onDepthChange(depth: number): void {
    const clampedDepth = Math.max(2, Math.min(8, depth));
    this.maxDepth.set(clampedDepth);
    this.renderTree();
  }

  zoomIn(): void {
    if (!this.svg || !this.zoomBehavior) {
      return;
    }

    this.svg.transition().duration(220).call(this.zoomBehavior.scaleBy, 1.2);
  }

  zoomOut(): void {
    if (!this.svg || !this.zoomBehavior) {
      return;
    }

    this.svg.transition().duration(220).call(this.zoomBehavior.scaleBy, 0.82);
  }

  resetView(): void {
    if (!this.svg || !this.zoomBehavior) {
      return;
    }

    const container = this.treeContainer?.nativeElement;
    const width = container?.clientWidth ?? 900;

    this.svg.transition().duration(220).call(
      this.zoomBehavior.transform,
      d3.zoomIdentity.translate(width / 2, 80).scale(0.82)
    );
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

        this.highlightedAnimals.set(highlighted);

        if (highlighted.length > 0) {
          this.selectedId.set(highlighted[0].id);
        } else if (entries.length > 0) {
          this.selectedId.set(entries[0].id);
        }

        this.loading.set(false);

        // Wichtig: Erst nach DOM-Update rendern, da treeContainer bei @if/@else sonst noch fehlen kann.
        requestAnimationFrame(() => this.renderTree());
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Die Stammbaum-Daten konnten nicht geladen werden.');
      }
    });

    this.subscriptions.add(sub);
  }

  private renderTree(): void {
    const container = this.treeContainer?.nativeElement;
    if (!container) {
      return;
    }

    container.innerHTML = '';

    const entries = this.entries();
    const selected = this.selectedId();

    if (!entries.length || !selected) {
      return;
    }

    const dataById = new Map(entries.map(entry => [entry.id, entry]));
    const isDark = this.isDarkTheme();
    const palette = {
      link: isDark ? '#6f767a' : '#7f8c8d',
      nodeHighlightFill: isDark ? '#173024' : '#e7f4ea',
      nodeHighlightStroke: isDark ? '#7fd48d' : '#2e7d32',
      nodeFill: isDark ? '#212121' : '#f5f5f5',
      nodeStroke: isDark ? '#616161' : '#b0b0b0'
    };

    const rootNode = this.buildNode(selected, 'Ausgewaehltes Tier', dataById, this.maxDepth(), new Set<string>(), 0);

    if (!rootNode) {
      return;
    }

    const width = Math.max(container.clientWidth, 900);
    const height = 820;

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('class', 'pedigree-svg');

    this.zoomLayer = this.svg.append('g');
    this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 2.4])
      .on('zoom', event => {
        if (this.zoomLayer) {
          this.zoomLayer.attr('transform', event.transform.toString());
        }
      });

    this.svg.call(this.zoomBehavior);

    const nodeWidth = 220;
    const nodeHeight = 74;
    const nodePaddingX = 8;
    const root = d3.hierarchy(rootNode);
    const layout = d3.tree<PedigreeNode>().nodeSize([230, 250]);
    const treeData = layout(root);

    const links = this.zoomLayer.selectAll<SVGPathElement, d3.HierarchyLink<PedigreeNode>>('.tree-link')
      .data(treeData.links())
      .join('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke', palette.link)
      .attr('stroke-width', 1.8)
      .attr('d', link => {
        const sx = link.source.x;
        const sy = link.source.y;
        const tx = link.target.x;
        const ty = link.target.y;
        const middleY = (sy + ty) / 2;

        return `M${sx},${sy} C${sx},${middleY} ${tx},${middleY} ${tx},${ty}`;
      });

    links.lower();

    const nodes = this.zoomLayer.selectAll<SVGGElement, d3.HierarchyNode<PedigreeNode>>('.tree-node')
      .data(treeData.descendants())
      .join('g')
      .attr('class', 'tree-node')
      .attr('transform', node => `translate(${node.x},${node.y})`)
      .style('cursor', node => {
        if (node.data.highlight && !!node.data.routePath) {
          return 'pointer';
        }

        return dataById.has(node.data.id) ? 'pointer' : 'default';
      })
      .on('click', (_event, node) => {
        if (node.data.highlight && node.data.routePath) {
          this.router.navigateByUrl(node.data.routePath);
          return;
        }

        if (!dataById.has(node.data.id)) {
          return;
        }

        this.selectedId.set(node.data.id);
        this.renderTree();
      });

    // Native SVG-Tooltip mit vollständigem Namen/Infos.
    nodes.append('title')
      .text(node => {
        const info = node.data.info ? `\nInfo: ${node.data.info}` : '';
        return `${node.data.id}\nBezug: ${node.data.relationLabel}${info}`;
      });

    nodes.append('rect')
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('rx', 12)
      .attr('ry', 12)
      .attr('fill', node => (node.data.highlight ? palette.nodeHighlightFill : palette.nodeFill))
      .attr('stroke', node => (node.data.highlight ? palette.nodeHighlightStroke : palette.nodeStroke))
      .attr('stroke-width', node => (node.data.highlight ? 2.1 : 1.4));

    const nodesWithImage = nodes.filter(node => Boolean(node.data.imageSrc));

    nodesWithImage.append('rect')
      .attr('x', -nodeWidth / 2 + nodePaddingX)
      .attr('y', -24)
      .attr('width', 44)
      .attr('height', 44)
      .attr('rx', 8)
      .attr('ry', 8)
      .attr('fill', isDark ? '#121212' : '#ffffff')
      .attr('stroke', node => (node.data.highlight ? palette.nodeHighlightStroke : palette.nodeStroke))
      .attr('stroke-width', 1.2);

    nodesWithImage.append('image')
      .attr('x', -nodeWidth / 2 + nodePaddingX + 2)
      .attr('y', -22)
      .attr('width', 40)
      .attr('height', 40)
      .attr('href', node => node.data.imageSrc ?? '')
      .attr('preserveAspectRatio', 'xMidYMid slice');

    const getTextX = (node: d3.HierarchyNode<PedigreeNode>): number => (
      node.data.imageSrc ? -54 : -nodeWidth / 2 + 12
    );

    nodes.append('text')
      .attr('text-anchor', 'start')
      .attr('x', node => getTextX(node))
      .attr('y', -12)
      .attr('class', 'node-title')
      .text(node => node.data.id.length > 24 ? `${node.data.id.slice(0, 24)}...` : node.data.id);

    nodes.append('text')
      .attr('text-anchor', 'start')
      .attr('x', node => getTextX(node))
      .attr('y', 8)
      .attr('class', 'node-relation')
      .text(node => node.data.relationLabel);

    nodes.append('text')
      .attr('text-anchor', 'start')
      .attr('x', node => getTextX(node))
      .attr('y', 25)
      .attr('class', 'node-info')
      .text(node => {
        const info = node.data.info;
        if (!info) {
          return '';
        }

        return info.length > 28 ? `${info.slice(0, 28)}...` : info;
      });

    this.resetView();
  }

  private buildNode(
    id: string,
    relationLabel: string,
    dataById: Map<string, PedigreeEntry>,
    maxDepth: number,
    branchVisited: Set<string>,
    depth: number
  ): PedigreeNode | null {
    if (depth > maxDepth) {
      return null;
    }

    const entry = dataById.get(id);
    const existsInData = Boolean(entry);

    const node: PedigreeNode = {
      key: `${id}-${relationLabel}-${depth}-${branchVisited.size}`,
      id,
      relationLabel,
      info: entry?.info,
      imageSrc: this.getAnimalImageForName(id),
      routePath: entry?.path ?? this.getAnimalRouteForName(id),
      highlight: existsInData ? entry!.highlight : false,
      children: []
    };

    if (!entry) {
      node.relationLabel = `${relationLabel} (extern)`;
      node.children = undefined;
      return node;
    }

    if (depth === maxDepth) {
      node.children = undefined;
      return node;
    }

    if (branchVisited.has(id)) {
      node.relationLabel = `${relationLabel} (zyklisch)`;
      node.children = undefined;
      return node;
    }

    const nextVisited = new Set(branchVisited);
    nextVisited.add(id);

    const sireNode = entry.sire
      ? this.buildNode(entry.sire, 'Vater', dataById, maxDepth, nextVisited, depth + 1)
      : null;
    const damNode = entry.dam
      ? this.buildNode(entry.dam, 'Mutter', dataById, maxDepth, nextVisited, depth + 1)
      : null;

    node.children = [sireNode, damNode].filter((child): child is PedigreeNode => child !== null);

    if (node.children.length === 0) {
      node.children = undefined;
    }

    return node;
  }

  private observeThemeChanges(): void {
    const root = document.documentElement;

    this.themeObserver = new MutationObserver(() => this.renderTree());
    this.themeObserver.observe(root, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  private isDarkTheme(): boolean {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  private createAnimalMetaLookup(): Map<string, AnimalLookupMeta> {
    const categories: AnimalCategory[] = ['stammkuehe', 'mutterkuehe', 'zuchtbullen', 'kaelber', 'faersen', 'jungbullen'];
    const lookup = new Map<string, AnimalLookupMeta>();

    for (const category of categories) {
      for (const animal of this.animalService.getAnimalsByCategory(category)) {
        const image = this.pickBestImage(animal.images);
        const baseRoute = this.animalService.getCategoryRoute(category);
        const meta: AnimalLookupMeta = {
          imageSrc: image?.src,
          routePath: category === 'kaelber' ? baseRoute : `${baseRoute}/${animal.id}`
        };

        lookup.set(this.normalizeNameKey(animal.name), meta);
        lookup.set(this.normalizeNameKey(animal.id), meta);
      }
    }

    return lookup;
  }

  private pickBestImage(images: AnimalImage[]): AnimalImage | undefined {
    return images.find(image => image.isPrimary && !!image.src) ?? images.find(image => !!image.src);
  }

  private getAnimalImageForName(name: string): string | undefined {
    return this.animalMetaByKey.get(this.normalizeNameKey(name))?.imageSrc;
  }

  private getAnimalRouteForName(name: string): string | undefined {
    return this.animalMetaByKey.get(this.normalizeNameKey(name))?.routePath;
  }

  private normalizeNameKey(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ß/g, 'ss')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
}

