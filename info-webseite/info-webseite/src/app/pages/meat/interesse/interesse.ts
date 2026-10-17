import { Component, signal, AfterViewInit, ElementRef, ViewChild, NgZone, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrollRevealDirective } from '../../../shared/scroll-reveal.directive';

declare const grecaptcha: any;

export interface MeatPackageOption {
  id: string;
  title: string;
  weight: string;
  badge: string;
  description: string;
  contents: string[];
  icon: string;
}

@Component({
  selector: 'app-interesse',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    ScrollRevealDirective
  ],
  templateUrl: './interesse.html',
  styleUrl: './interesse.css'
})
export class Interesse implements AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ngZone = inject(NgZone);

  // Gleicher reCAPTCHA v2 Site-Key wie in contact.ts
  private readonly RECAPTCHA_SITE_KEY = '6LcvSYYsAAAAAA1v5JC6CO_eGX-Na5UI_2VmFt-z';

  readonly packages: MeatPackageOption[] = [
    {
      id: 'mischpaket-5kg',
      title: 'Kleines Bio-Genusspaket',
      weight: 'ca. 5 kg',
      badge: 'Beliebt zum Kennenlernen',
      description: 'Ausgewogene Mischung aus edlen Kurzbratstücken, saftigem Braten und aromatischem Hackfleisch.',
      contents: ['Steaks / Kurzbratstücke', 'Braten & Gulasch', 'Bio-Rinderhackfleisch', 'Suppenfleisch / Beinscheibe'],
      icon: 'shopping_bag'
    },
    {
      id: 'mischpaket-10kg',
      title: 'Großes Bio-Familienpaket',
      weight: 'ca. 10 kg',
      badge: 'Klassiker ab Hof',
      description: 'Unser klassisches Vorratspaket – küchenfertig zerlegt, vakuumverpackt und einzeln beschriftet.',
      contents: ['Rumpsteak / Entrecôte', 'Rouladen & Schmorbraten', 'Gulasch & Hackfleisch', 'Brühe- & Schmorteile'],
      icon: 'inventory_2'
    },
    {
      id: 'grill-edelpaket',
      title: 'BBQ- & Edelteile-Anfrage',
      weight: 'Nach Verfügbarkeit',
      badge: 'Für Grillliebhaber',
      description: 'Gezielte Vormerkung für besondere Edelstücke, Burger-Patties oder individuelle Zuschnitte.',
      contents: ['Filet / Ribeye / Rumpsteak', 'Saftige Highland-Burger', 'Kurzbrat-Spezialitäten', 'Individueller Wunschzuschnitt'],
      icon: 'outdoor_grill'
    }
  ];

  readonly batchOptions = [
    'Nächstmöglicher Schlachttermin',
    'Herbst / Winter-Termin',
    'Frühjahrs-Termin',
    'Flexibel – bitte informieren Sie mich'
  ];

  readonly selectedPackageId = signal<string>('mischpaket-10kg');
  readonly quantity = signal<number>(1);
  readonly isSubmitting = signal<boolean>(false);
  readonly submitSuccess = signal<boolean>(false);
  readonly reservationId = signal<string>('');
  readonly captchaError = signal<boolean>(false);

  @ViewChild('recaptchaContainer', { static: false }) recaptchaContainer!: ElementRef;
  private recaptchaWidgetId: number | null = null;
  private recaptchaToken: string | null = null;

  readonly reservationForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    preferredBatch: ['Nächstmöglicher Schlachttermin', Validators.required],
    customWishes: ['']
  });

  ngAfterViewInit(): void {
    this.renderRecaptcha();
  }

  get selectedPackage(): MeatPackageOption {
    return this.packages.find(p => p.id === this.selectedPackageId()) ?? this.packages[0];
  }

  selectPackage(id: string): void {
    this.selectedPackageId.set(id);
  }

  adjustQuantity(delta: number): void {
    const next = Math.max(1, Math.min(5, this.quantity() + delta));
    this.quantity.set(next);
  }

  resetReservation(): void {
    this.submitSuccess.set(false);
    this.reservationId.set('');
    this.reservationForm.reset({
      preferredBatch: 'Nächstmöglicher Schlachttermin'
    });
    setTimeout(() => this.renderRecaptcha(), 150);
  }

  private renderRecaptcha(): void {
    if (typeof grecaptcha === 'undefined' || !grecaptcha.render) {
      setTimeout(() => this.renderRecaptcha(), 250);
      return;
    }
    if (!this.recaptchaContainer?.nativeElement) {
      return;
    }

    this.recaptchaContainer.nativeElement.innerHTML = '';
    this.recaptchaWidgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
      sitekey: this.RECAPTCHA_SITE_KEY,
      callback: (token: string) => {
        this.ngZone.run(() => {
          this.recaptchaToken = token;
          this.captchaError.set(false);
        });
      },
      'expired-callback': () => {
        this.ngZone.run(() => {
          this.recaptchaToken = null;
        });
      }
    });
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      return;
    }

    if (!this.recaptchaToken) {
      this.captchaError.set(true);
      this.snackBar.open('Bitte bestätigen Sie kurz das reCAPTCHA.', 'OK', { duration: 4000 });
      return;
    }

    this.isSubmitting.set(true);

    const pkg = this.selectedPackage;
    const payload = {
      ...this.reservationForm.value,
      packageId: pkg.id,
      packageTitle: `${pkg.title} (${pkg.weight})`,
      quantity: this.quantity(),
      recaptchaToken: this.recaptchaToken
    };

    this.http.post<{ success: boolean; reservationId: string }>('/api/reserve', payload).subscribe({
      next: res => {
        this.isSubmitting.set(false);
        this.reservationId.set(res.reservationId || 'WF-NEU');
        this.submitSuccess.set(true);
        this.recaptchaToken = null;
        this.snackBar.open('Ihre Reservierungsanfrage wurde erfolgreich übermittelt!', 'OK', {
          duration: 5000
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        if (this.recaptchaWidgetId !== null && typeof grecaptcha !== 'undefined') {
          grecaptcha.reset(this.recaptchaWidgetId);
        }
        this.recaptchaToken = null;
        this.snackBar.open(
          'Hinweis: Lokaler Test oder Server nicht erreichbar. Bitte prüfen Sie die API-Konfiguration.',
          'OK',
          { duration: 6000 }
        );
      }
    });
  }
}
