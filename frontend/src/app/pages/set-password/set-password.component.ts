/**
 * Fichier : frontend/src/app/pages/set-password/set-password.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier gere la logique de la page set password.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-set-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './set-password.component.html',
})
export class SetPasswordComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  form!: FormGroup;
  token = '';
  idUtilisateur = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  passwordStrength = 0;
  passwordStrengthText = '';
  passwordStrengthColor = 'bg-gray-200';

  checkPasswordStrength(password: string): void {
    if (!password) {
      this.passwordStrength = 0;
      this.passwordStrengthText = '';
      this.passwordStrengthColor = 'bg-gray-200';
      return;
    }

    let force = 0;
    
    if (password.length > 5) force += 10;
    if (password.length > 7) force += 15;
    if (password.length >= 10) force += 15;

    if (/[A-Z]/.test(password)) force += 15;
    if (/[a-z]/.test(password)) force += 15;
    if (/[0-9]/.test(password)) force += 15;
    if (/[^A-Za-z0-9]/.test(password)) force += 15;

    this.passwordStrength = Math.min(force, 100);

    if (this.passwordStrength < 40) {
      this.passwordStrengthText = 'Faible';
      this.passwordStrengthColor = 'bg-red-500';
    } else if (this.passwordStrength < 70) {
      this.passwordStrengthText = 'Moyen';
      this.passwordStrengthColor = 'bg-orange-400';
    } else {
      this.passwordStrengthText = 'Fort';
      this.passwordStrengthColor = 'bg-green-500';
    }
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    this.idUtilisateur = this.route.snapshot.queryParams['id'] ?? '';
    if (!this.token || !this.idUtilisateur) {
      this.router.navigate(['/']);
      return;
    }

    this.form = this.fb.group({
      mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
      mot_de_passe_confirmation: ['', Validators.required],
    }, { validators: this.passwordsMatch });

    this.form.get('mot_de_passe')?.valueChanges.subscribe(val => {
      this.checkPasswordStrength(val);
    });
  }

  passwordsMatch(group: FormGroup) {
    return group.get('mot_de_passe')?.value === group.get('mot_de_passe_confirmation')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.setPassword(
      this.idUtilisateur,
      this.token,
      this.form.value.mot_de_passe,
      this.form.value.mot_de_passe_confirmation
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Mot de passe créé ! Vous pouvez maintenant vous connecter.';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Lien invalide ou expiré. Contactez un administrateur.';
      }
    });
  }

  get mdp() { 
    return this.form.get('mot_de_passe'); 
  }

  get mdpConfirm() {
    return this.form.get('mot_de_passe_confirmation');
  }
}