import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
import { ImageZoomDialogComponent } from './shared/image-zoom/image-zoom-dialog.component';

interface NavLink {
  path: string;
  label: string;
  icon: string;
  children?: NavLink[];
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Highlander vom Weetfeld');
  protected readonly isMobile = signal(false);
  readonly currentYear = new Date().getFullYear();

  /** Theme-Service für Dark-/Light-Mode */
  protected readonly themeService = inject(ThemeService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /** Steuert das Aufklappen der Sidenav-Untermenüs */
  expandedMenus = signal<Record<string, boolean>>({});

  @ViewChild('sidenav') sidenav!: MatSidenav;
  @ViewChild('contentHost', { read: ElementRef }) contentHost?: ElementRef<HTMLElement>;

  readonly navLinks: NavLink[] = [
    { path: '/', label: 'Startseite', icon: 'home' },
    { path: '/stammbaum', label: 'Stammbaum', icon: 'account_tree' },
    {
      path: '/unsere-highlander',
      label: 'Unsere Highlander',
      icon: 'pets',
      children: [
        { path: '/unsere-highlander/stammkuehe', label: 'Stammkühe', icon: 'star' },
        { path: '/unsere-highlander/mutterkuehe', label: 'Mutterkühe', icon: 'favorite' },
        { path: '/unsere-highlander/zuchtbullen', label: 'Zuchtbullen', icon: 'shield' },
        { path: '/unsere-highlander/kaelber', label: 'Kälber', icon: 'child_care' },
        { path: '/unsere-highlander/jungtiere', label: 'Jungtiere', icon: 'trending_up' }
      ]
    },
    {
      path: '/fleisch',
      label: 'Fleisch & Verkauf',
      icon: 'storefront',
      children: [
        { path: '/fleisch/fleischqualitaet', label: 'Fleischqualität', icon: 'restaurant' },
        { path: '/fleisch/verarbeitung', label: 'Verarbeitung', icon: 'inventory_2' },
        { path: '/fleisch/interesse', label: 'Interesse / Anfrage', icon: 'shopping_cart' }
      ]
    },
    { path: '/bio-betrieb', label: 'Bio-Betrieb', icon: 'eco' },
    { path: '/besuch', label: 'Besuch & Beratung', icon: 'place' },
    { path: '/kontakt', label: 'Kontakt', icon: 'mail' }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isMobile.set(result.matches);
    });

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.scrollToTop());
  }

  closeSidenav(): void {
    if (this.isMobile()) {
      this.sidenav.close();
    }
  }

  /** Sidenav-Untermenü ein-/ausklappen */
  toggleSubmenu(label: string): void {
    this.expandedMenus.update(menus => ({
      ...menus,
      [label]: !menus[label]
    }));
  }

  /** Prüft, ob ein Sidenav-Untermenü aufgeklappt ist */
  isExpanded(label: string): boolean {
    return !!this.expandedMenus()[label];
  }

  openImageZoomFromMain(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const image = target?.closest('img') as HTMLImageElement | null;
    const isForced = image?.dataset['forceZoom'] === 'true';
    const isExcludedByClass = image?.classList.contains('no-zoom') || image?.dataset['noZoom'] === 'true';
    const isExcludedByContainer = !!image?.closest('.mat-mdc-card, .no-zoom-container, [data-no-zoom-container="true"]');

    if (!image) {
      return;
    }

    if (!isForced && (isExcludedByClass || isExcludedByContainer)) {
      return;
    }

    const src = image.getAttribute('src')?.trim();
    if (!src) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.dialog.open(ImageZoomDialogComponent, {
      data: {
        src,
        alt: image.getAttribute('alt') || 'Bildansicht'
      },
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'image-zoom-dialog-panel',
      backdropClass: 'image-zoom-backdrop',
      maxWidth: '98vw'
    });
  }

  private scrollToTop(): void {
    // Falls der Browser scrollt
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    // Falls der Scroll im Sidenav-Content stattfindet
    const contentElement = this.contentHost?.nativeElement;
    if (contentElement && typeof contentElement.scrollTo === 'function') {
      contentElement.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }
}
