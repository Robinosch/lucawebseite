import { Component } from '@angular/core';
import { AnimalOverview } from '../../../shared/animal-overview/animal-overview';

/** Stammkühe-Übersichtsseite */
@Component({
  selector: 'app-stammkuehe-overview',
  imports: [AnimalOverview],
  template: `<app-animal-overview category="stammkuehe" />`
})
export class StammkueheOverview {}

