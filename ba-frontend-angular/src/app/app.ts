import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root-Komponente der Angular-Anwendung.
 * Dient als konstante Frontend-Komponente für den Vergleich
 * zwischen SAP CAP/IAS und Spring Boot/AWS Cognito.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class App {
}
