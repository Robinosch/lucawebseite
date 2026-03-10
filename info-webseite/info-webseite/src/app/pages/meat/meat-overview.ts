import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Fleisch – Übersichtsseite (Landing-Page mit 3 Kacheln).
 * Route: /fleisch
 */
@Component({
  selector: 'app-meat-overview',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './meat-overview.html',
  styleUrl: './meat-overview.css'
})
export class MeatOverview {}

