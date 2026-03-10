import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

/**
 * Interesse / Anfrage – Detailseite.
 * Route: /fleisch/interesse
 * CTA → routet zu /kontakt
 */
@Component({
  selector: 'app-interesse',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './interesse.html',
  styleUrl: './interesse.css'
})
export class Interesse {}

