import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './user-form.component.html'
})
export class UserFormComponent implements OnInit {
    @Input() user?: Utilisateur;
    @Input() isCreation = false;
    @Output() save = new EventEmitter<Utilisateur>();
    @Output() cancelForm = new EventEmitter<void>();

    private fb = inject(FormBuilder);
    userForm!: FormGroup;

    // Enums
    roleUtilisateur = RoleUtilisateur;
    statutCompte = StatutCompte;
    listeRoles = Object.values(RoleUtilisateur);
    listeStatuts = Object.values(StatutCompte);

    ngOnInit() {
        this.initForm();
    }

    private initForm() {
        this.userForm = this.fb.group({
            nom: [this.user?.nom || '', [Validators.required, Validators.maxLength(50)]],
            prenom: [this.user?.prenom || '', [Validators.required, Validators.maxLength(50)]],
            email: [this.user?.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
            // Le mdp est optionnel en édition mais obligatoire en création
            mot_de_passe: [
                this.user?.mot_de_passe || '',
                this.isCreation ? [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)] : []
            ],
            role: [this.user?.role || RoleUtilisateur.parent, [Validators.required]],
            statut_compte: [this.user?.statut_compte || StatutCompte.actif, [Validators.required]]
        });
    }

    onSubmit() {
        if (this.userForm.valid) {
            const formValue = this.userForm.value;

            const updatedUser: Utilisateur = {
                ...this.user,
                ...formValue
            };

            this.save.emit(updatedUser);
        } else {
            this.userForm.markAllAsTouched();
        }
    }

    get f() { return this.userForm.controls; }
}
