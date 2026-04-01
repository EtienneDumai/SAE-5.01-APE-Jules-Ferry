/**
 * Fichier : frontend/src/app/pages/administration-page/admin-comptes/admin-comptes.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page admin comptes.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminComptesComponent } from './admin-comptes.component';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ExportCsvService } from '../../../services/ExportCsv/export-csv.service';
import { of, throwError } from 'rxjs';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../../enums/StatutCompte/statut-compte';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

const createMockUtilisateurs = (): Utilisateur[] => [
  { id_utilisateur: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', role: RoleUtilisateur.parent, statut_compte: StatutCompte.actif },
  { id_utilisateur: 2, nom: 'Martin', prenom: 'Alice', email: 'alice@test.com', role: RoleUtilisateur.administrateur, statut_compte: StatutCompte.actif },
  { id_utilisateur: 3, nom: 'Leblanc', prenom: 'Bob', email: 'bob@test.com', role: RoleUtilisateur.parent, statut_compte: StatutCompte.desactive },
];

describe('AdminComptesComponent', () => {
  let component: AdminComptesComponent;
  let fixture: ComponentFixture<AdminComptesComponent>;
  let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let exportCsvServiceSpy: jasmine.SpyObj<ExportCsvService>;
  let mockUtilisateurs: Utilisateur[];

  beforeEach(async () => {
    mockUtilisateurs = createMockUtilisateurs();
    utilisateurServiceSpy = jasmine.createSpyObj('UtilisateurService', [
      'getAllUtilisateurs', 'createUtilisateur', 'updateUtilisateur', 'deleteUtilisateur'
    ]);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout']);
    exportCsvServiceSpy = jasmine.createSpyObj('ExportCsvService', ['exportAsCsvFile']);

    utilisateurServiceSpy.getAllUtilisateurs.and.returnValue(of(mockUtilisateurs.map(user => ({ ...user }))));

    await TestBed.configureTestingModule({
      imports: [AdminComptesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UtilisateurService, useValue: utilisateurServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ExportCsvService, useValue: exportCsvServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComptesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('chargerUtilisateurs', () => {
    it('should_load_liste_users_startup', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(utilisateurServiceSpy.getAllUtilisateurs).toHaveBeenCalled();
      expect(component.utilisateurs.length).toBe(3);
      expect(component.chargementEnCours).toBeFalse();
    });

    it('should_display_toast_erreur_si_le_chargement_echoue', () => {
    // GIVEN
      utilisateurServiceSpy.getAllUtilisateurs.and.returnValue(throwError(() => new Error('network error')));

    // WHEN
      component.chargerUtilisateurs();

    // THEN
      expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith('Erreur chargement utilisateurs', TypeErreurToast.ERROR);
      expect(component.chargementEnCours).toBeFalse();
    });
  });

  describe('utilisateursFiltres', () => {
    it('should_return_all_users_recherche_empty', () => {
    // GIVEN
      component.texteRecherche = '';

    // WHEN

    // THEN
      expect(component.utilisateursFiltres.length).toBe(3);
    });

    it('should_filtrer_par_nom', () => {
    // GIVEN
      component.texteRecherche = 'dupont';

    // WHEN

    // THEN
      expect(component.utilisateursFiltres.length).toBe(1);
      expect(component.utilisateursFiltres[0].nom).toBe('Dupont');
    });

    it('should_filtrer_par_prenom', () => {
    // GIVEN
      component.texteRecherche = 'alice';

    // WHEN

    // THEN
      expect(component.utilisateursFiltres.length).toBe(1);
      expect(component.utilisateursFiltres[0].prenom).toBe('Alice');
    });

    it('should_filtrer_par_email', () => {
    // GIVEN
      component.texteRecherche = 'bob@test';

    // WHEN

    // THEN
      expect(component.utilisateursFiltres.length).toBe(1);
    });

    it('should_return_tableau_empty_no_correspondance', () => {
    // GIVEN
      component.texteRecherche = 'zzz_introuvable_zzz';

    // WHEN

    // THEN
      expect(component.utilisateursFiltres.length).toBe(0);
    });
  });

  describe('demarrerEdition / annulerEdition', () => {
    it('should_activer_mode_edition_user', () => {
    // GIVEN

    // WHEN
      component.demarrerEdition(mockUtilisateurs[0]);

    // THEN
      expect(component.idEnEdition).toBe(1);
      expect(component.utilisateurOriginal).toEqual(mockUtilisateurs[0]);
    });

    it('should_restaurer_utilisateur_original_lors_de_l_annulation', () => {
    // GIVEN
      component.utilisateurs = [...mockUtilisateurs];

    // WHEN
      component.demarrerEdition(component.utilisateurs[0]);
      component.utilisateurs[0].nom = 'NomModifie';

      component.annulerEdition();

    // THEN
      expect(component.utilisateurs[0].nom).toBe('Dupont');
      expect(component.idEnEdition).toBeNull();
    });
  });

  describe('validerEdition', () => {
    it('should_display_modal_confirmation_password_password', () => {
    // GIVEN

    // WHEN
      component.validerEdition(mockUtilisateurs[0]);

    // THEN
      expect(component.showPasswordModal).toBeTrue();
      expect(component.pendingAction).toBe('UPDATE');
    });
  });

  describe('demanderSuppression', () => {
    it('should_display_modal_password_password_other_user', () => {
    // GIVEN
      component.idConnecte = 99;

    // WHEN
      component.demanderSuppression(1);

    // THEN
      expect(component.showPasswordModal).toBeTrue();
      expect(component.idUtilisateurASupprimer).toBe(1);
    });

    it('should_display_avertissement_essaie_delete_own_account', () => {
    // GIVEN
      component.idConnecte = 1;

    // WHEN
      component.demanderSuppression(1);

    // THEN
      expect(toastServiceSpy.show).toHaveBeenCalled();
      expect(component.showPasswordModal).toBeFalse();
    });
  });

  describe('annulerCreation', () => {
    it('should_desactiver_mode_creation', () => {
    // GIVEN
      component.modeCreation = true;

    // WHEN
      component.annulerCreation();

    // THEN
      expect(component.modeCreation).toBeFalse();
    });
  });

  describe('closePasswordModal', () => {
    it('should_reinitialiser_modal_password_password', () => {
    // GIVEN
      component.showPasswordModal = true;
      component.pendingAction = 'DELETE';

    // WHEN
      component.closePasswordModal();

    // THEN
      expect(component.showPasswordModal).toBeFalse();
      expect(component.pendingAction).toBeNull();
    });
  });

  describe('exportData', () => {
    it('should_call_exportascsvfile_colonnes_selectionnees', () => {
    // GIVEN
      component.utilisateurs = [...mockUtilisateurs];

    // WHEN
      component.exportData(['nom', 'email']);

    // THEN
      expect(exportCsvServiceSpy.exportAsCsvFile).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ 'Nom': 'DUPONT', 'E-mail': 'jean@test.com' })]),
        'Comptes_Utilisateurs'
      );
      expect(component.showExportModal).toBeFalse();
    });

    it('should_exporter_uniquement_colonnes_selectionnees', () => {
    // GIVEN
      component.utilisateurs = [mockUtilisateurs[0]];

    // WHEN
      component.exportData(['nom']);
      const call = exportCsvServiceSpy.exportAsCsvFile.calls.mostRecent();
      const firstRow = (call.args[0] as Record<string, string>[])[0];

    // THEN
      expect(firstRow['Nom']).toBeDefined();
      expect(firstRow['E-mail']).toBeUndefined();
    });
  });
});
