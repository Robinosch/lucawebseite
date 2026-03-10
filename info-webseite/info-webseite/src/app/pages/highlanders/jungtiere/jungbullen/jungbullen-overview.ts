import { Component } from '@angular/core';
import { AnimalOverview } from '../../../../shared/animal-overview/animal-overview';

/** Jungbullen-Übersichtsseite */
@Component({
  selector: 'app-jungbullen-overview',
  imports: [AnimalOverview],
  template: `<app-animal-overview category="jungbullen" basePath="/unsere-highlander/jungtiere/jungbullen" />`
})
export class JungbullenOverview {}

