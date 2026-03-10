import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Fleischqualität – Detailseite.
 * Route: /fleisch/fleischqualitaet
 * Daten aus hc-weetfeld-06-fleisch-haltung-kontakt.md
 */
@Component({
  selector: 'app-fleischqualitaet',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './fleischqualitaet.html',
  styleUrl: './fleischqualitaet.css'
})
export class Fleischqualitaet {}

