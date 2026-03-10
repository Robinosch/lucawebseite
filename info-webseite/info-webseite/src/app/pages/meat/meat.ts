import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-meat',
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './meat.html',
  styleUrl: './meat.css'
})
export class Meat {}

