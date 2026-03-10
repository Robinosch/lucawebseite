import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * Verarbeitung – Detailseite.
 * Route: /fleisch/verarbeitung
 */
@Component({
  selector: 'app-verarbeitung',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './verarbeitung.html',
  styleUrl: './verarbeitung.css'
})
export class Verarbeitung {}

