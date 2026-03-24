import { Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-modifier-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-modifier-password.component.html',
  styleUrl: './form-modifier-password.component.css'
})
export class FormModifierPasswordComponent implements OnInit, OnChanges {

  @Input() resetKey = 0;
  @Output() submitted = new EventEmitter<{ motDePasse: string }>();
  @Output() cancelled = new EventEmitter<void>();

  modificationMdpForm!: FormGroup;

  showPassword1 = false;
  showPassword2 = false;
  showPassword3 = false;

  togglePassword1(): void { this.showPassword1 = !this.showPassword1; }
  togglePassword2(): void { this.showPassword2 = !this.showPassword2; }
  togglePassword3(): void { this.showPassword3 = !this.showPassword3; }

  private readonly fb = inject(FormBuilder);

  ngOnInit(): void {
    this.modificationMdpForm = this.fb.group({
      mot_de_passe_actuel: ['', [Validators.required]],
      nouveau_mot_de_passe: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
      confirmation_nouveau_mot_de_passe: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.modificationMdpForm.reset();
    }
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

  public submit(): void {
    if (this.modificationMdpForm.invalid) {
      this.modificationMdpForm.markAllAsTouched();
      return;
    }

    this.submitted.emit({
      motDePasse: this.modificationMdpForm.value.nouveau_mot_de_passe
    });
  }

  public cancel(): void {
    this.cancelled.emit();
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
