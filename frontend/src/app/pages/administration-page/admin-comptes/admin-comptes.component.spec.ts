import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminComptesComponent } from './admin-comptes.component';
import { UtilisateurService } from '../../../services/Utilisateur/utilisateur.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ExportExcelService } from '../../../services/ExportExcel/export-excel.service';
import { of, throwError } from 'rxjs';
import { Utilisateur } from '../../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../../enums/StatutCompte/statut-compte';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

describe('AdminComptesComponent', () => {
  let component: AdminComptesComponent;
  let fixture: ComponentFixture<AdminComptesComponent>;
  let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let exportExcelServiceSpy: jasmine.SpyObj<ExportExcelService>;

  const mockUtilisateurs: Utilisateur[] = [
    { id_utilisateur: 1, nom: 'Dupont', prenom: 'Jean', email: 'jean@test.com', role: RoleUtilisateur.parent, statut_compte: StatutCompte.actif },
    { id_utilisateur: 2, nom: 'Martin', prenom: 'Alice', email: 'alice@test.com', role: RoleUtilisateur.administrateur, statut_compte: StatutCompte.actif },
    { id_utilisateur: 3, nom: 'Leblanc', prenom: 'Bob', email: 'bob@test.com', role: RoleUtilisateur.parent, statut_compte: StatutCompte.desactive },
  ];

  beforeEach(async () => {
    utilisateurServiceSpy = jasmine.createSpyObj('UtilisateurService', [
      'getAllUtilisateurs', 'createUtilisateur', 'updateUtilisateur', 'deleteUtilisateur'
    ]);
  toastServiceSpy = jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout']);
    exportExcelServiceSpy = jasmine.createSpyObj('ExportExcelService', ['exportAsExcelFile']);

    utilisateurServiceSpy.getAllUtilisateurs.and.returnValue(of(mockUtilisateurs));

    await TestBed.configureTestingModule({
      imports: [AdminComptesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: UtilisateurService, useValue: utilisateurServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ExportExcelService, useValue: exportExcelServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComptesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('chargerUtilisateurs', () => {
    it('devrait charger la liste des utilisateurs au démarrage', () => {
      expect(utilisateurServiceSpy.getAllUtilisateurs).toHaveBeenCalled();
      expect(component.utilisateurs.length).toBe(3);
      expect(component.chargementEnCours).toBeFalse();
    });

    it('devrait afficher un toast d\'erreur si le chargement échoue', () => {
      utilisateurServiceSpy.getAllUtilisateurs.and.returnValue(throwError(() => new Error('network error')));
  component.chargerUtilisateurs();
  expect(toastServiceSpy.showWithTimeout).toHaveBeenCalledWith('Erreur chargement utilisateurs', TypeErreurToast.ERROR);
      expect(component.chargementEnCours).toBeFalse();
    });
  });

  describe('utilisateursFiltres', () => {
    it('devrait retourner tous les utilisateurs si la recherche est vide', () => {
      component.texteRecherche = '';
      expect(component.utilisateursFiltres.length).toBe(3);
    });

    it('devrait filtrer par nom', () => {
      component.texteRecherche = 'dupont';
      expect(component.utilisateursFiltres.length).toBe(1);
      expect(component.utilisateursFiltres[0].nom).toBe('Dupont');
    });

    it('devrait filtrer par prénom', () => {
      component.texteRecherche = 'alice';
      expect(component.utilisateursFiltres.length).toBe(1);
      expect(component.utilisateursFiltres[0].prenom).toBe('Alice');
    });

    it('devrait filtrer par email', () => {
      component.texteRecherche = 'bob@test';
      expect(component.utilisateursFiltres.length).toBe(1);
    });

    it('devrait retourner un tableau vide si aucune correspondance', () => {
      component.texteRecherche = 'zzz_introuvable_zzz';
      expect(component.utilisateursFiltres.length).toBe(0);
    });
  });

  describe('demarrerEdition / annulerEdition', () => {
    it('devrait activer le mode édition pour un utilisateur', () => {
      component.demarrerEdition(mockUtilisateurs[0]);
      expect(component.idEnEdition).toBe(1);
      expect(component.utilisateurOriginal).toEqual(mockUtilisateurs[0]);
    });

    it('devrait restaurer l\'utilisateur original lors de l\'annulation', () => {
      component.utilisateurs = [...mockUtilisateurs];
      component.demarrerEdition(component.utilisateurs[0]);
      component.utilisateurs[0].nom = 'NomModifie';
      component.annulerEdition();
      expect(component.utilisateurs[0].nom).toBe('Dupont');
      expect(component.idEnEdition).toBeNull();
    });
  });

  describe('validerEdition', () => {
    it('devrait afficher la modale de confirmation de mot de passe', () => {
      component.validerEdition(mockUtilisateurs[0]);
      expect(component.showPasswordModal).toBeTrue();
      expect(component.pendingAction).toBe('UPDATE');
    });
  });

  describe('demanderSuppression', () => {
    it('devrait afficher la modale de mot de passe pour un autre utilisateur', () => {
      component.idConnecte = 99;
      component.demanderSuppression(1);
      expect(component.showPasswordModal).toBeTrue();
      expect(component.idUtilisateurASupprimer).toBe(1);
    });

    it('devrait afficher un avertissement si on essaie de supprimer son propre compte', () => {
      component.idConnecte = 1;
      component.demanderSuppression(1);
      expect(toastServiceSpy.show).toHaveBeenCalled();
      expect(component.showPasswordModal).toBeFalse();
    });
  });

  describe('annulerCreation', () => {
    it('devrait désactiver le mode création', () => {
      component.modeCreation = true;
      component.annulerCreation();
      expect(component.modeCreation).toBeFalse();
    });
  });

  describe('closePasswordModal', () => {
    it('devrait réinitialiser la modale de mot de passe', () => {
      component.showPasswordModal = true;
      component.pendingAction = 'DELETE';
      component.closePasswordModal();
      expect(component.showPasswordModal).toBeFalse();
      expect(component.pendingAction).toBeNull();
    });
  });

  describe('exportData', () => {
    it('devrait appeler exportAsExcelFile avec les colonnes sélectionnées', () => {
      component.utilisateurs = [...mockUtilisateurs];
      component.exportData(['nom', 'email']);
      expect(exportExcelServiceSpy.exportAsExcelFile).toHaveBeenCalledWith(
        jasmine.arrayContaining([jasmine.objectContaining({ 'Nom': 'DUPONT', 'E-mail': 'jean@test.com' })]),
        'Comptes_Utilisateurs'
      );
      expect(component.showExportModal).toBeFalse();
    });

    it('devrait exporter uniquement les colonnes sélectionnées', () => {
      component.utilisateurs = [mockUtilisateurs[0]];
      component.exportData(['nom']);
      const call = exportExcelServiceSpy.exportAsExcelFile.calls.mostRecent();
      const firstRow = (call.args[0] as Record<string, string>[])[0];
      expect(firstRow['Nom']).toBeDefined();
      expect(firstRow['E-mail']).toBeUndefined();
    });
  });
});
