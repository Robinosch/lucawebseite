import { Component, signal, AfterViewInit, ElementRef, ViewChild, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

/**
 * Globale Referenz auf die grecaptcha-API (wird über das Script in index.html geladen).
 */
declare const grecaptcha: any;

/**
 * Kontakt-Komponente mit Formspree-Integration und reCAPTCHA v2 Spam-Schutz.
 *
 * Das reCAPTCHA-Widget wird manuell (explicit) gerendert, damit es sich
 * nahtlos in das Angular-Lifecycle einfügt.
 */
@Component({
  selector: 'app-contact',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})
export class Contact implements AfterViewInit {
  private readonly FORMSPREE_URL = 'https://formspree.io/f/meeravka';

  /**
   * WICHTIG: Hier deinen reCAPTCHA v2 Site-Key eintragen.
   * Den Key findest du unter: https://www.google.com/recaptcha/admin
   * (Typ: reCAPTCHA v2 – „Ich bin kein Roboter"-Checkbox)
   */
  private readonly RECAPTCHA_SITE_KEY = '6LcvSYYsAAAAAA1v5JC6CO_eGX-Na5UI_2VmFt-z';

  readonly contactForm: FormGroup;
  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly captchaError = signal(false);

  /** Referenz auf das DIV, in dem das reCAPTCHA-Widget gerendert wird */
  @ViewChild('recaptchaContainer', { static: false }) recaptchaContainer!: ElementRef;

  /** ID des gerenderten reCAPTCHA-Widgets (für reset) */
  private recaptchaWidgetId: number | null = null;

  /** Das vom Nutzer gelöste reCAPTCHA-Token */
  private recaptchaToken: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      _replyto: ['', [Validators.required, Validators.email]],
      _subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngAfterViewInit(): void {
    this.renderRecaptcha();
  }

  /**
   * Rendert das reCAPTCHA-Widget manuell im Container-DIV.
   * Falls die grecaptcha-API noch nicht geladen ist, wird ein Retry-Intervall gestartet.
   */
  private renderRecaptcha(): void {
    if (typeof grecaptcha === 'undefined' || !grecaptcha.render) {
      // API noch nicht geladen – erneut versuchen
      setTimeout(() => this.renderRecaptcha(), 200);
      return;
    }

    if (!this.recaptchaContainer?.nativeElement) {
      return;
    }

    this.recaptchaWidgetId = grecaptcha.render(this.recaptchaContainer.nativeElement, {
      sitekey: this.RECAPTCHA_SITE_KEY,
      callback: (token: string) => {
        // Callback läuft außerhalb der Angular-Zone
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
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    // Prüfen, ob das reCAPTCHA gelöst wurde
    if (!this.recaptchaToken) {
      this.captchaError.set(true);
      this.snackBar.open('Bitte bestätigen Sie, dass Sie kein Roboter sind.', 'OK', {
        duration: 5000,
        panelClass: 'snackbar-error'
      });
      return;
    }

    this.isSubmitting.set(true);

    // Formspree erwartet das Token im Feld "g-recaptcha-response"
    const payload = {
      ...this.contactForm.value,
      'g-recaptcha-response': this.recaptchaToken
    };

    this.http.post(this.FORMSPREE_URL, payload, {
      headers: { 'Accept': 'application/json' }
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.contactForm.reset();
        this.recaptchaToken = null;
        this.snackBar.open('Nachricht erfolgreich gesendet! Wir melden uns bei Ihnen.', 'OK', {
          duration: 5000,
          panelClass: 'snackbar-success'
        });
      },
      error: () => {
        this.isSubmitting.set(false);
        // reCAPTCHA zurücksetzen, damit der Nutzer es erneut lösen kann
        if (this.recaptchaWidgetId !== null) {
          grecaptcha.reset(this.recaptchaWidgetId);
        }
        this.recaptchaToken = null;
        this.snackBar.open('Fehler beim Senden. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.', 'OK', {
          duration: 7000,
          panelClass: 'snackbar-error'
        });
      }
    });
  }
}

