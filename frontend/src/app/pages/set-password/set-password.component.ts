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

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    this.idUtilisateur = this.route.snapshot.queryParams['id'] ?? '';

    this.form = this.fb.group({
      mot_de_passe: ['', [Validators.required, Validators.minLength(8)]],
      mot_de_passe_confirmation: ['', Validators.required],
    }, { validators: this.passwordsMatch });
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