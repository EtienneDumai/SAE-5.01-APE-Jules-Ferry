import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/Auth/auth.service';
import { LoginCredentials } from '../../models/Auth/login-credentials';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  loginForm!: FormGroup;
  errorMessage!: string;
  successMessage!: string;
  isLoading = false;

  // Indique si on doit afficher le champ mot de passe (true = admin et false = saisie email)
  loginMdp = false;
  showPassword = false; // l'oeil

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      mot_de_passe: ['']
    });
  }

  // Fonction appelée quand on clique sur "Continuer" (Étape 1)
  verifierEmail(): void {
    if (this.email?.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const emailSaisi = this.email?.value;

    this.authService.checkEmailType(emailSaisi).subscribe({
      next: (response) => {
        if (response.action === 'require_password') {
          // C'est un admin on affiche le champ mdp et on ajoute les validateurs
          this.loginMdp = true;
          this.mot_de_passe?.setValidators([Validators.required, Validators.minLength(8)]);
          this.mot_de_passe?.updateValueAndValidity();
          this.isLoading = false;
        } else if (response.action === 'not_found') {
          this.isLoading = false;
          this.errorMessage = "Aucun compte associé à cet email. Veuillez vous inscrire.";
        } else if (response.action === 'deactivated') {
          this.isLoading = false;
          this.errorMessage = "Votre compte a été désactivé. Veuillez contacter l'APE."; 
        }else {
          // C'est un parent alors on demande le lien magique
          this.demanderLienMagique(emailSaisi);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Une erreur est survenue lors de la vérification de l'email.";
      }
    });
  }

  // Fonction interne pour gérer l'envoi du lien magique
  private demanderLienMagique(email: string): void {
    this.authService.requestMagicLink(email).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "C'est parti ! Vérifiez votre boîte mail pour cliquer sur votre lien de connexion.";
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible d'envoyer le lien magique. Veuillez réessayer.";
      }
    });
  }

  // Fonction appelée quand on clique sur "Se connecter" (Étape 2 - Admins seulement)
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const credentials: LoginCredentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Email ou mot de passe incorrect';
      }
    });
  }
 
  motDePasseOublie(): void {
    if (!this.email?.value) {
      this.errorMessage = "Veuillez saisir votre email d'abord.";
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.authService.forgotPassword(this.email?.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = "Un lien pour réinitialiser votre mot de passe vous a été envoyé par email.";
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Impossible d'envoyer le lien. Veuillez réessayer.";
      }
    });
  }
 
  retourEtape1(): void {
    this.loginMdp = false;
    this.showPassword = false;
    this.mot_de_passe?.clearValidators();
    this.mot_de_passe?.updateValueAndValidity();
    this.mot_de_passe?.setValue('');
    this.errorMessage = '';
  }

  get email() {
    return this.loginForm.get('email');
  }

  get mot_de_passe() {
    return this.loginForm.get('mot_de_passe');
  }
}