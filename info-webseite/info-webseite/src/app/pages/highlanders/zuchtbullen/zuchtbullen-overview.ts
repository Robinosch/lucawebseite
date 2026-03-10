import { Component } from '@angular/core';
import { AnimalOverview } from '../../../shared/animal-overview/animal-overview';

/** Zuchtbullen-Übersichtsseite */
@Component({
  selector: 'app-zuchtbullen-overview',
  imports: [AnimalOverview],
  template: `<app-animal-overview category="zuchtbullen" />`
})
export class ZuchtbullenOverview {}

