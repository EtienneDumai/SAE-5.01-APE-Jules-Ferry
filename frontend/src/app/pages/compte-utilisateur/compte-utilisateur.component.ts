import { Component, inject } from '@angular/core';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { AuthService } from '../../services/Auth/auth.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-compte-utilisateur',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './compte-utilisateur.component.html',
  styleUrl: './compte-utilisateur.component.css'
})
export class CompteUtilisateurComponent {
  currentUser: Utilisateur | null = null;
  isAuthenticated: boolean = false;
  loadingUser: boolean = true;
  utilisateurMdp!: Utilisateur;
  erreurLoadingUser: boolean = false;
  modifierMdp: boolean = false;
  modificationMdpForm!: FormGroup;
  private readonly fb = inject(FormBuilder);
  private readonly utilisateurService = inject(UtilisateurService);
  private readonly authService = inject(AuthService);
  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        this.isAuthenticated = user !== null;
        this.loadingUser = false;
      },
      error: (error) => {
        this.erreurLoadingUser = true;
        this.loadingUser = false;
        console.error('Erreur lors de la récupération de l\'utilisateur courant', error);
      }
    });
    this.modificationMdpForm = this.fb.group({
      mot_de_passe_actuel: ['', [Validators.required]],
      nouveau_mot_de_passe: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
      confirmation_nouveau_mot_de_passe: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const oldPassword = control.get('mot_de_passe_actuel');
    const password = control.get('nouveau_mot_de_passe');
    const confirmPassword = control.get('confirmation_nouveau_mot_de_passe');
    if (!password || !confirmPassword || !oldPassword) {
      return null;
    }
    // Nettoyage de l'erreur si tout est OK
    if (password.value === confirmPassword.value) {
      if (confirmPassword.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
      return null;
    }
    if (oldPassword.value === password.value) {
      // Pose l'erreur sur le formulaire global
      password.setErrors({ passwordMismatchOldNew: true });
      return { passwordMismatchOldNew: true };
    }
    // Pose l'erreur UNIQUEMENT sur le champ confirmation
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  }
  public logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Déconnexion réussie');
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion', error);
      }
    });
  }
  public modifierMotDePasse(): void {
    this.modifierMdp = true;
  }
  public onSubmit(): void {
    console.log('Formulaire soumis');
    this.modifierMdp = false;
    this.modificationMdpForm.reset();
  }
  public annulerModification(): void {
    this.modifierMdp = false;
    this.modificationMdpForm.reset();
  }
  // Getters pour accéder aux contrôles du formulaire dans le template
  get mot_de_passe_actuel() {
    return this.modificationMdpForm.get('mot_de_passe_actuel');
  }
  get nouveau_mot_de_passe() {
    return this.modificationMdpForm.get('nouveau_mot_de_passe');
  }
  get confirmation_nouveau_mot_de_passe() {
    return this.modificationMdpForm.get('confirmation_nouveau_mot_de_passe');
  }
  get motDePasseActuelInvalid(): boolean {
    return this.modificationMdpForm.hasError('passwordMismatchOldNew');
  }
  get passwordMismatch(): boolean {
    return this.modificationMdpForm.hasError('passwordMismatch');
  }
}
