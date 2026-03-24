import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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

  showPassword1 = false;
  showPassword2 = false;

  togglePassword1(): void {
    this.showPassword1 = !this.showPassword1;
  }

  togglePassword2(): void {
    this.showPassword2 = !this.showPassword2;
  }

  constructor() {
    this.registerForm = this.fb.group({
      nom: ['', [Validators.required, Validators.maxLength(50)]],
      prenom: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      mot_de_passe: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
      mot_de_passe_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('mot_de_passe');
    const confirmPassword = control.get('mot_de_passe_confirmation');
    if (!password || !confirmPassword) {
      return null;
    }
    // Nettoyage de l'erreur si tout est OK
    if (password.value === confirmPassword.value) {
      if (confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
    // Pose l'erreur UNIQUEMENT sur le champ confirmation
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const data: RegisterData = this.registerForm.value;

    this.authService.register(data).subscribe({
      next: (response) => {
        console.log('Inscription réussie', response);
        this.router.navigate(['/']);
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

        console.error('Erreur d\'inscription', error);
      },
      complete: () => {
        this.isLoading = false;
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

  get mot_de_passe() {
    return this.registerForm.get('mot_de_passe');
  }

  get mot_de_passe_confirmation() {
    return this.registerForm.get('mot_de_passe_confirmation');
  }

  get passwordMismatch() {
    return this.registerForm.errors?.['passwordMismatch'] &&
      this.mot_de_passe_confirmation?.touched;
  }
}