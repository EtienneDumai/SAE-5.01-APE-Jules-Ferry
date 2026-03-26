import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/Auth/auth.service';
import { RegisterData } from '../../models/Auth/register-data';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  registerForm: FormGroup;
  errorMessage!: string;
  isLoading = false;
  successMessage!: string;

  constructor() {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data: RegisterData = this.registerForm.value;

    this.authService.register(data).subscribe({
      next: () => {
        // Si l'inscription est OK alors on envoie le magic link directement
        this.authService.requestMagicLink(this.email?.value).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = "Inscription réussie ! Un lien de connexion vous a été envoyé par email.";
          },
          error: () => {
            this.isLoading = false;
            this.successMessage = "Inscription réussie ! Connectez-vous via la page de connexion.";
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          this.errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        } else {
          this.errorMessage = error.error?.message || 'Une erreur est survenue lors de l\'inscription';
        }
      }
    });
  }

  get nom() {
    return this.registerForm.get('nom');
  }

  get prenom() {
    return this.registerForm.get('prenom');
  }

  get email() {
    return this.registerForm.get('email');
  }
}