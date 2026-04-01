import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFormComponent } from './user-form.component';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';

describe('UserFormComponent', () => {
  let component: UserFormComponent;
  let fixture: ComponentFixture<UserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFormComponent);
    component = fixture.componentInstance;
  });

  it('crée le composant et initialise le formulaire sans mot de passe en édition', () => {
    component.user = {
      id_utilisateur: 3,
      nom: 'Dupont',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.parent,
      statut_compte: StatutCompte.actif
    };
    component.isCreation = false;

    fixture.detectChanges();

    expect(component.userForm.get('nom')?.value).toBe('Dupont');
    expect(component.userForm.contains('mot_de_passe')).toBeFalse();
    expect(component.labelsStatuts[StatutCompte.desactive]).toBe('Inactif');
  });

  it('ajoute le mot de passe en mode création', () => {
    component.isCreation = true;

    fixture.detectChanges();

    expect(component.userForm.contains('mot_de_passe')).toBeTrue();
  });

  it('émet save avec les valeurs fusionnées quand le formulaire est valide', () => {
    spyOn(component.save, 'emit');
    component.user = {
      id_utilisateur: 3,
      nom: 'Dupont',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.parent,
      statut_compte: StatutCompte.actif
    };

    fixture.detectChanges();

    component.userForm.patchValue({
      nom: 'Martin',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.administrateur,
      statut_compte: StatutCompte.desactive
    });

    component.onSubmit();

    expect(component.save.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      id_utilisateur: 3,
      nom: 'Martin',
      role: RoleUtilisateur.administrateur,
      statut_compte: StatutCompte.desactive
    }));
  });

  it('marque tous les champs comme touchés quand le formulaire est invalide', () => {
    fixture.detectChanges();
    spyOn(component.userForm, 'markAllAsTouched');

    component.userForm.patchValue({
      nom: '',
      prenom: '',
      email: 'bad-mail'
    });

    component.onSubmit();

    expect(component.userForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('expose les contrôles via le getter f', () => {
    fixture.detectChanges();

    expect(component.f['email']).toBeDefined();
    expect(component.f['nom']).toBeDefined();
  });
});
