import { Component } from '@angular/core';
import { AnimalOverview } from '../../../shared/animal-overview/animal-overview';

/** Mutterkühe-Übersichtsseite */
@Component({
  selector: 'app-mutterkuehe-overview',
  imports: [AnimalOverview],
  template: `<app-animal-overview category="mutterkuehe" />`
})
export class MutterkueheOverview {}

