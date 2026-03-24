import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  resetPasswordForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isLoading = false;

  token: string = '';
  emailFromUrl: string = '';

  showPassword1 = false;
  showPassword2 = false;

  togglePassword1(): void {
    this.showPassword1 = !this.showPassword1;
  }

  togglePassword2(): void {
    this.showPassword2 = !this.showPassword2;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.emailFromUrl = params['email'] || '';
    });

    this.resetPasswordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
      password_confirmation: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('password_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const data = {
      email: this.emailFromUrl,
      token: this.token,
      password: this.resetPasswordForm.value.password,
      password_confirmation: this.resetPasswordForm.value.password_confirmation
    };

    this.authService.resetPassword(data).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message || 'Votre mot de passe a été réinitialisé avec succès.';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Une erreur est survenue, le lien est peut-être expiré.';
      }
    });
  }

  get password() {
    return this.resetPasswordForm.get('password');
  }

  get password_confirmation() {
    return this.resetPasswordForm.get('password_confirmation');
  }
}
