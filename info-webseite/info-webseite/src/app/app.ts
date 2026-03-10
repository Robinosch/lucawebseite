import { Component, inject, signal, ViewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ThemeService } from './services/theme.service';

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
    MatTooltipModule
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

  /** Steuert das Aufklappen der Sidenav-Untermenüs */
  expandedMenus = signal<Record<string, boolean>>({});

  @ViewChild('sidenav') sidenav!: MatSidenav;

  readonly navLinks: NavLink[] = [
    { path: '/', label: 'Startseite', icon: 'home' },
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
}
