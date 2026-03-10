import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Jungtiere-Übersicht – zeigt Kacheln für Färsen und Jungbullen.
 */
@Component({
  selector: 'app-jungtiere-overview',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './jungtiere-overview.html',
  styleUrl: './jungtiere-overview.css'
})
export class JungtiereOverview {}

