import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.Home),
    title: 'Startseite – Highlander vom Weetfeld'
  },

  // ===== Unsere Highlander (mit Unterkategorien) =====
  {
    path: 'unsere-highlander',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/highlanders/highlanders').then(m => m.Highlanders),
        title: 'Unsere Highlander – Highlander vom Weetfeld'
      },
      // Stammkühe
      {
        path: 'stammkuehe',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/highlanders/stammkuehe/stammkuehe-overview').then(m => m.StammkueheOverview),
            title: 'Stammkühe – Highlander vom Weetfeld'
          },
          {
            path: ':name',
            loadComponent: () =>
              import('./shared/animal-detail/animal-detail').then(m => m.AnimalDetail),
            data: { category: 'stammkuehe' },
            title: 'Stammkuh – Highlander vom Weetfeld'
          }
        ]
      },
      // Mutterkühe
      {
        path: 'mutterkuehe',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/highlanders/mutterkuehe/mutterkuehe-overview').then(m => m.MutterkueheOverview),
            title: 'Mutterkühe – Highlander vom Weetfeld'
          },
          {
            path: ':name',
            loadComponent: () =>
              import('./shared/animal-detail/animal-detail').then(m => m.AnimalDetail),
            data: { category: 'mutterkuehe' },
            title: 'Mutterkuh – Highlander vom Weetfeld'
          }
        ]
      },
      // Zuchtbullen
      {
        path: 'zuchtbullen',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/highlanders/zuchtbullen/zuchtbullen-overview').then(m => m.ZuchtbullenOverview),
            title: 'Zuchtbullen – Highlander vom Weetfeld'
          },
          {
            path: ':name',
            loadComponent: () =>
              import('./shared/animal-detail/animal-detail').then(m => m.AnimalDetail),
            data: { category: 'zuchtbullen' },
            title: 'Zuchtbulle – Highlander vom Weetfeld'
          }
        ]
      },
      // Kälber (keine Einzeltier-Detailseiten)
      {
        path: 'kaelber',
        loadComponent: () =>
          import('./pages/highlanders/kaelber/kaelber').then(m => m.Kaelber),
        title: 'Kälber – Highlander vom Weetfeld'
      },
      // Jungtiere (mit Unterseiten Färsen & Jungbullen)
      {
        path: 'jungtiere',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/highlanders/jungtiere/jungtiere-overview').then(m => m.JungtiereOverview),
            title: 'Jungtiere – Highlander vom Weetfeld'
          },
          // Färsen
          {
            path: 'faersen',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/highlanders/jungtiere/faersen/faersen-overview').then(m => m.FaersenOverview),
                title: 'Färsen – Highlander vom Weetfeld'
              },
              {
                path: ':name',
                loadComponent: () =>
                  import('./shared/animal-detail/animal-detail').then(m => m.AnimalDetail),
                data: { category: 'faersen' },
                title: 'Färse – Highlander vom Weetfeld'
              }
            ]
          },
          // Jungbullen
          {
            path: 'jungbullen',
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/highlanders/jungtiere/jungbullen/jungbullen-overview').then(m => m.JungbullenOverview),
                title: 'Jungbullen – Highlander vom Weetfeld'
              },
              {
                path: ':name',
                loadComponent: () =>
                  import('./shared/animal-detail/animal-detail').then(m => m.AnimalDetail),
                data: { category: 'jungbullen' },
                title: 'Jungbulle – Highlander vom Weetfeld'
              }
            ]
          }
        ]
      }
    ]
  },

  // ===== Interaktiver Stammbaum =====
  {
    path: 'stammbaum',
    loadComponent: () => import('./pages/stammbaum/stammbaum').then(m => m.Stammbaum),
    title: 'Stammbaum unserer Highlander – Highlander vom Weetfeld'
  },
  // ===== Fleisch & Direktvermarktung (mit 3 Unterseiten) =====
  {
    path: 'fleisch',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/meat/meat-overview').then(m => m.MeatOverview),
        title: 'Fleisch & Direktvermarktung – Highlander vom Weetfeld'
      },
      {
        path: 'fleischqualitaet',
        loadComponent: () =>
          import('./pages/meat/fleischqualitaet/fleischqualitaet').then(m => m.Fleischqualitaet),
        title: 'Fleischqualität – Highlander vom Weetfeld'
      },
      {
        path: 'verarbeitung',
        loadComponent: () =>
          import('./pages/meat/verarbeitung/verarbeitung').then(m => m.Verarbeitung),
        title: 'Verarbeitung – Highlander vom Weetfeld'
      },
      {
        path: 'interesse',
        loadComponent: () =>
          import('./pages/meat/interesse/interesse').then(m => m.Interesse),
        title: 'Fleisch anfragen – Highlander vom Weetfeld'
      }
    ]
  },

  // ===== Bio-Betrieb =====
  {
    path: 'bio-betrieb',
    loadComponent: () => import('./pages/bio/bio').then(m => m.Bio),
    title: 'Bio-Betrieb & Haltung – Highlander vom Weetfeld'
  },

  // ===== Besuch & Beratung =====
  {
    path: 'besuch',
    loadComponent: () => import('./pages/visit/visit').then(m => m.Visit),
    title: 'Besuch & Beratung – Highlander vom Weetfeld'
  },

  // ===== Kontakt =====
  {
    path: 'kontakt',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact),
    title: 'Kontakt – Highlander vom Weetfeld'
  },

  // ===== Rechtliches =====
  {
    path: 'impressum',
    loadComponent: () => import('./pages/legal/impressum').then(m => m.Impressum),
    title: 'Impressum – Highlander vom Weetfeld'
  },
  {
    path: 'datenschutz',
    loadComponent: () => import('./pages/legal/datenschutz').then(m => m.Datenschutz),
    title: 'Datenschutzerklärung – Highlander vom Weetfeld'
  },

  // ===== Fallback =====
  {
    path: '**',
    redirectTo: ''
  }
];
