import { Component } from '@angular/core';
import { AnimalOverview } from '../../../../shared/animal-overview/animal-overview';

/** Färsen-Übersichtsseite */
@Component({
  selector: 'app-faersen-overview',
  imports: [AnimalOverview],
  template: `<app-animal-overview category="faersen" basePath="/unsere-highlander/jungtiere/faersen" />`
})
export class FaersenOverview {}

