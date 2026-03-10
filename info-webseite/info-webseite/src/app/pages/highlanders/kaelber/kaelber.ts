import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

/**
 * Kälber-Übersichtsseite.
 * Da Kälber keine individuellen Einträge haben, wird hier eine allgemeine
 * Informationsseite mit Bild-Platzhaltern angezeigt.
 */
@Component({
  selector: 'app-kaelber',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './kaelber.html',
  styleUrl: './kaelber.css'
})
export class Kaelber {}

