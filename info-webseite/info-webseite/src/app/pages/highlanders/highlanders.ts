import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { AnimalService } from '../../services/animal.service';

@Component({
  selector: 'app-highlanders',
  imports: [RouterLink, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  templateUrl: './highlanders.html',
  styleUrl: './highlanders.css'
})
export class Highlanders {
  private readonly animalService = inject(AnimalService);
  readonly categories = this.animalService.categories;
}

