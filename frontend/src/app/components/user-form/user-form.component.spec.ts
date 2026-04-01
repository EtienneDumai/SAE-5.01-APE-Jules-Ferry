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

  it('should_create_component_and_initialize_form_without_password_in_edit_mode', () => {
    // GIVEN
    component.user = {
      id_utilisateur: 3,
      nom: 'Dupont',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.parent,
      statut_compte: StatutCompte.actif
    };
    component.isCreation = false;

    // WHEN
    fixture.detectChanges();

    // THEN
    expect(component.userForm.get('nom')?.value).toBe('Dupont');
    expect(component.userForm.contains('mot_de_passe')).toBeFalse();
    expect(component.labelsStatuts[StatutCompte.desactive]).toBe('Inactif');
  });

  it('should_add_password_control_in_creation_mode', () => {
    // GIVEN
    component.isCreation = true;

    // WHEN
    fixture.detectChanges();

    // THEN
    expect(component.userForm.contains('mot_de_passe')).toBeTrue();
  });

  it('should_emit_save_with_merged_values_when_form_is_valid', () => {
    // GIVEN
    spyOn(component.save, 'emit');
    component.user = {
      id_utilisateur: 3,
      nom: 'Dupont',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.parent,
      statut_compte: StatutCompte.actif
    };

    // WHEN
    fixture.detectChanges();

    component.userForm.patchValue({
      nom: 'Martin',
      prenom: 'Alice',
      email: 'alice@example.com',
      role: RoleUtilisateur.administrateur,
      statut_compte: StatutCompte.desactive
    });

    component.onSubmit();

    // THEN
    expect(component.save.emit).toHaveBeenCalledWith(jasmine.objectContaining({
      id_utilisateur: 3,
      nom: 'Martin',
      role: RoleUtilisateur.administrateur,
      statut_compte: StatutCompte.desactive
    }));
  });

  it('should_mark_all_fields_as_touched_when_form_is_invalid', () => {
    // GIVEN
    fixture.detectChanges();
    spyOn(component.userForm, 'markAllAsTouched');

    component.userForm.patchValue({
      nom: '',
      prenom: '',
      email: 'bad-mail'
    });

    // WHEN
    component.onSubmit();

    // THEN
    expect(component.userForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('should_expose_form_controls_through_f_getter', () => {
    // GIVEN

    // WHEN
    fixture.detectChanges();

    // THEN
    expect(component.f['email']).toBeDefined();
    expect(component.f['nom']).toBeDefined();
  });
});
