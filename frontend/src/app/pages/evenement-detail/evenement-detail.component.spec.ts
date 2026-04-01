/**
 * Fichier : frontend/src/app/pages/evenement-detail/evenement-detail.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page evenement detail.
 */

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { EvenementDetailComponent } from './evenement-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Location, DatePipe } from '@angular/common';
import { of, throwError } from 'rxjs';

import { EvenementService } from '../../services/Evenement/evenement.service';
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { InscriptionService } from '../../services/Inscription/inscription.service';
import { AuthService } from '../../services/Auth/auth.service';

import { Evenement } from '../../models/Evenement/evenement';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';
import { StatutCompte } from '../../enums/StatutCompte/statut-compte';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';
import { InscriptionSubmitPayload } from '../../components/forms/form-inscription-evenement/form-inscription-evenement.component';

function createMockActivatedRoute(queryParams: Record<string, string>): Partial<ActivatedRoute> {
    const mockParamMap: ParamMap = {
        get: (key: string): string | null => key === 'id' ? '1' : null,
        has: (key: string): boolean => key === 'id',
        getAll: (key: string): string[] => key === 'id' ? ['1'] : [],
        keys: ['id']
    };

    return {
        queryParams: of(queryParams),
        // CORRIGÉ : Ajout de paramMap en Observable pour le test
        paramMap: of(mockParamMap),
        snapshot: {
            paramMap: mockParamMap
        } as ActivatedRoute['snapshot']
    };
}

describe('EvenementDetailComponent', () => {
    let component: EvenementDetailComponent;
    let fixture: ComponentFixture<EvenementDetailComponent>;

    let evenementServiceSpy: jasmine.SpyObj<EvenementService>;
    let utilisateurServiceSpy: jasmine.SpyObj<UtilisateurService>;
    let formulaireServiceSpy: jasmine.SpyObj<FormulaireService>;
    let inscriptionServiceSpy: jasmine.SpyObj<InscriptionService>;
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let locationSpy: jasmine.SpyObj<Location>;

    const mockEvenement: Evenement = {
        id_evenement: 1,
        titre: 'Gala',
        description: 'Super gala',
        date_evenement: new Date('2027-12-25'),
        heure_debut: '18:00',
        heure_fin: '23:00',
        lieu: 'Salle des fêtes',
        image_url: 'img.jpg',
        statut: StatutEvenement.publie,
        id_auteur: 1,
        id_formulaire: 10
    };

    const mockAuteur: Utilisateur = {
        id_utilisateur: 1,
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@test.com',
        role: RoleUtilisateur.administrateur,
        statut_compte: StatutCompte.actif,
    };

    const mockFormulaire: Formulaire = {
        id_formulaire: 10,
        nom_formulaire: 'Inscription Gala',
        description: 'Pour le dîner',
        statut: StatutFormulaire.actif,
        id_createur: 1,
        taches: [
            {
                id_tache: 1,
                nom_tache: 'Service',
                description: 'Servir les plats',
                heure_debut_globale: '18:00',
                heure_fin_globale: '20:00',
                id_formulaire: 10,
                creneaux: [
                    {
                        id_creneau: 100,
                        id_tache: 1,
                        heure_debut: '18:00',
                        heure_fin: '20:00',
                        quota: 5,
                        inscriptions_count: 2,
                        inscriptions: [
                            { id_inscription: 55, id_creneau: 100, id_utilisateur: 99, commentaire: null }
                        ]
                    }
                ]
            }
        ]
    };

    const currentUser: Utilisateur = {
        id_utilisateur: 2,
        nom: 'Parent',
        prenom: 'Test',
        email: 'parent@test.com',
        role: RoleUtilisateur.parent,
        statut_compte: StatutCompte.actif
    };

    beforeEach(async () => {
        evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getEvenementById', 'deleteEvenement']);
        utilisateurServiceSpy = jasmine.createSpyObj('UtilisateurService', ['getUtilisateurById']);
        formulaireServiceSpy = jasmine.createSpyObj('FormulaireService', ['getFormulaireById']);
        inscriptionServiceSpy = jasmine.createSpyObj('InscriptionService', ['createInscription', 'deleteInscription']);
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isAuthenticatedStatus'], {
            currentUser$: of(null)
        });
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        locationSpy = jasmine.createSpyObj('Location', ['back']);

        evenementServiceSpy.getEvenementById.and.returnValue(of(mockEvenement));
        utilisateurServiceSpy.getUtilisateurById.and.returnValue(of(mockAuteur));
        formulaireServiceSpy.getFormulaireById.and.returnValue(of(JSON.parse(JSON.stringify(mockFormulaire))));
        authServiceSpy.getCurrentUser.and.returnValue(currentUser);
        authServiceSpy.isAuthenticatedStatus.and.returnValue(true);

        const mockRoute = createMockActivatedRoute({});

        await TestBed.configureTestingModule({
            imports: [EvenementDetailComponent],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                provideRouter([]),
                DatePipe,
                { provide: EvenementService, useValue: evenementServiceSpy },
                { provide: UtilisateurService, useValue: utilisateurServiceSpy },
                { provide: FormulaireService, useValue: formulaireServiceSpy },
                { provide: InscriptionService, useValue: inscriptionServiceSpy },
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: Location, useValue: locationSpy },
                {
                    provide: ActivatedRoute,
                    useValue: mockRoute
                }
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(EvenementDetailComponent);
        component = fixture.componentInstance;
    });

    it('should_create', () => {
    // GIVEN

    // WHEN
        fixture.detectChanges();

    // THEN
        expect(component).toBeTruthy();
    });

    describe('ngOnInit (Chargement des données)', () => {
        it('should_load_evenement_l_auteur_et_le_formulaire_au_demarrage', () => {
        // GIVEN

        // WHEN
            fixture.detectChanges();

        // THEN
            expect(evenementServiceSpy.getEvenementById).toHaveBeenCalledWith(1);
            expect(utilisateurServiceSpy.getUtilisateurById).toHaveBeenCalledWith(1);
            expect(formulaireServiceSpy.getFormulaireById).toHaveBeenCalledWith(10);

            expect(component.evenement).toEqual(mockEvenement);
            expect(component.auteur).toEqual(mockAuteur);
            expect(component.formulaire).toBeDefined();
            expect(component.loadingEvenement).toBeFalse();
        });

        it('should_handle_error_chargement_evenement', () => {
        // GIVEN
            evenementServiceSpy.getEvenementById.and.returnValue(throwError(() => new Error('Err')));
            spyOn(console, 'error');

        // WHEN
            fixture.detectChanges();

        // THEN
            expect(component.errorEvenement).toBeTrue();
            expect(component.loadingEvenement).toBeFalse();
        });
    });

    describe('Logique métier', () => {
        beforeEach(() => fixture.detectChanges());

        it('should_isevenementtermine_devrait_return_false_event_futur', () => {
        // GIVEN

        // WHEN

        // THEN
            expect(component.isEvenementTermine()).toBeFalse();
        });

        it('should_isinscriptionouverte_devrait_return_true_event_futur', () => {
        // GIVEN

        // WHEN

        // THEN
            expect(component.isInscriptionOuverte()).toBeTrue();
        });

        it('should_calculerinscriptionsexistantes_devrait_mark_creneaux_user_inscrit', () => {
        // GIVEN
            const formWithInscription = JSON.parse(JSON.stringify(mockFormulaire));
            formWithInscription.taches[0].creneaux[0].inscriptions.push({
                id_inscription: 88, id_creneau: 100, id_utilisateur: currentUser.id_utilisateur, commentaire: null
            });

            component.formulaire = formWithInscription;

        // WHEN
            component.calculerInscriptionsExistantes();

        // THEN
            expect(component.mesCreneauxActuels.length).toBe(1);
            expect(component.mesCreneauxActuels[0].id_creneau).toBe(100);
            expect(component.formulaire?.taches![0].creneaux![0].est_inscrit).toBeTrue();
        });
    });

    describe('Interactions Utilisateur', () => {
        beforeEach(() => fixture.detectChanges());

        it('should_goback_devrait_call_location_back', () => {
        // GIVEN

        // WHEN
            component.goBack();

        // THEN
            expect(locationSpy.back).toHaveBeenCalled();
        });

        it('should_toggleinscriptionform_devrait_redirect_vers_login_non_authenticated', () => {
        // GIVEN
            authServiceSpy.isAuthenticatedStatus.and.returnValue(false);

        // WHEN
            component.toggleInscriptionForm();

        // THEN
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
            expect(component.showInscriptionForm).toBeFalse();
        });

        it('should_toggleinscriptionform_devrait_display_form_authenticated', () => {
        // GIVEN
            authServiceSpy.isAuthenticatedStatus.and.returnValue(true);
            component.showInscriptionForm = false;

        // WHEN
            component.toggleInscriptionForm();

        // THEN
            expect(component.showInscriptionForm).toBeTrue();
        });
    });

    describe('Redirection avec paramètre openForm', () => {
        it('should_open_form_automatiquement_openform_true_conditions_remplies', fakeAsync(() => {
        // GIVEN
            const mockActivatedRoute = createMockActivatedRoute({ openForm: 'true' });

            authServiceSpy.isAuthenticatedStatus.and.returnValue(true);
            evenementServiceSpy.getEvenementById.and.returnValue(of(mockEvenement));
            utilisateurServiceSpy.getUtilisateurById.and.returnValue(of(mockAuteur));
            formulaireServiceSpy.getFormulaireById.and.returnValue(of(JSON.parse(JSON.stringify(mockFormulaire))));

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [EvenementDetailComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideRouter([]),
                    DatePipe,
                    { provide: EvenementService, useValue: evenementServiceSpy },
                    { provide: UtilisateurService, useValue: utilisateurServiceSpy },
                    { provide: FormulaireService, useValue: formulaireServiceSpy },
                    { provide: InscriptionService, useValue: inscriptionServiceSpy },
                    { provide: AuthService, useValue: authServiceSpy },
                    { provide: Router, useValue: routerSpy },
                    { provide: Location, useValue: locationSpy },
                    { provide: ActivatedRoute, useValue: mockActivatedRoute }
                ]
            });

        // WHEN
            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();

            tick(500);

        // THEN
            expect(newComponent.showInscriptionForm).toBeTrue();
        }));

        it('should_not_open_form_user_non_authentifie', fakeAsync(() => {
        // GIVEN
            const mockActivatedRoute = createMockActivatedRoute({ openForm: 'true' });

            authServiceSpy.isAuthenticatedStatus.and.returnValue(false);
            evenementServiceSpy.getEvenementById.and.returnValue(of(mockEvenement));

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [EvenementDetailComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideRouter([]),
                    DatePipe,
                    { provide: EvenementService, useValue: evenementServiceSpy },
                    { provide: UtilisateurService, useValue: utilisateurServiceSpy },
                    { provide: FormulaireService, useValue: formulaireServiceSpy },
                    { provide: InscriptionService, useValue: inscriptionServiceSpy },
                    { provide: AuthService, useValue: authServiceSpy },
                    { provide: Router, useValue: routerSpy },
                    { provide: Location, useValue: locationSpy },
                    { provide: ActivatedRoute, useValue: mockActivatedRoute }
                ]
            });

        // WHEN
            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();

            tick(500);

        // THEN
            expect(newComponent.showInscriptionForm).toBeFalse();
        }));

        it('should_not_open_form_event_termine', fakeAsync(() => {
        // GIVEN
            const mockActivatedRoute = createMockActivatedRoute({ openForm: 'true' });

            const evenementTermine = { ...mockEvenement, statut: StatutEvenement.termine };
            authServiceSpy.isAuthenticatedStatus.and.returnValue(true);
            evenementServiceSpy.getEvenementById.and.returnValue(of(evenementTermine));
            utilisateurServiceSpy.getUtilisateurById.and.returnValue(of(mockAuteur));
            formulaireServiceSpy.getFormulaireById.and.returnValue(of(JSON.parse(JSON.stringify(mockFormulaire))));

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [EvenementDetailComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideRouter([]),
                    DatePipe,
                    { provide: EvenementService, useValue: evenementServiceSpy },
                    { provide: UtilisateurService, useValue: utilisateurServiceSpy },
                    { provide: FormulaireService, useValue: formulaireServiceSpy },
                    { provide: InscriptionService, useValue: inscriptionServiceSpy },
                    { provide: AuthService, useValue: authServiceSpy },
                    { provide: Router, useValue: routerSpy },
                    { provide: Location, useValue: locationSpy },
                    { provide: ActivatedRoute, useValue: mockActivatedRoute }
                ]
            });

        // WHEN
            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();

            tick(500);

        // THEN
            expect(newComponent.showInscriptionForm).toBeFalse();
        }));

        it('should_not_open_form_pas_form_inscription', fakeAsync(() => {
        // GIVEN
            const mockActivatedRoute = createMockActivatedRoute({ openForm: 'true' });

            const evenementSansFormulaire = { ...mockEvenement, id_formulaire: null };
            authServiceSpy.isAuthenticatedStatus.and.returnValue(true);
            evenementServiceSpy.getEvenementById.and.returnValue(of(evenementSansFormulaire));
            utilisateurServiceSpy.getUtilisateurById.and.returnValue(of(mockAuteur));

            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [EvenementDetailComponent],
                providers: [
                    provideHttpClient(),
                    provideHttpClientTesting(),
                    provideRouter([]),
                    DatePipe,
                    { provide: EvenementService, useValue: evenementServiceSpy },
                    { provide: UtilisateurService, useValue: utilisateurServiceSpy },
                    { provide: FormulaireService, useValue: formulaireServiceSpy },
                    { provide: InscriptionService, useValue: inscriptionServiceSpy },
                    { provide: AuthService, useValue: authServiceSpy },
                    { provide: Router, useValue: routerSpy },
                    { provide: Location, useValue: locationSpy },
                    { provide: ActivatedRoute, useValue: mockActivatedRoute }
                ]
            });

        // WHEN
            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();

            tick(500);

        // THEN
            expect(newComponent.showInscriptionForm).toBeFalse();
        }));
    });

    describe('Gestion des Inscriptions (handleSubmit)', () => {
        beforeEach(() => fixture.detectChanges());

        it('should_call_createinscription_nouvelle_selection', fakeAsync(() => {
        // GIVEN
            const payload: InscriptionSubmitPayload = {
                creneauxSelectionnes: [100],
                commentaire: 'Dispo'
            };

            const inscriptionResponse = {
                id_inscription: 123,
                id_utilisateur: 2,
                id_creneau: 100,
                commentaire: 'Dispo'
            };
            inscriptionServiceSpy.createInscription.and.returnValue(of(inscriptionResponse));

        // WHEN
            component.handleSubmit(payload);

            tick();

        // THEN
            expect(inscriptionServiceSpy.createInscription).toHaveBeenCalled();
            expect(component.inscriptionSuccess).toBeTrue();
            expect(component.showInscriptionForm).toBeFalse();
            
            tick(2000); 
        }));

        it('should_call_deleteinscription_desinscription', fakeAsync(() => {
        // GIVEN
            const formWithInscription = JSON.parse(JSON.stringify(mockFormulaire));
            const creneau = formWithInscription.taches[0].creneaux[0];
            creneau.inscriptions.push({ id_inscription: 88, id_creneau: 100, id_utilisateur: currentUser.id_utilisateur, commentaire: null });
            creneau.est_inscrit = true;

            component.formulaire = formWithInscription;

            const payload: InscriptionSubmitPayload = {
                creneauxSelectionnes: [],
                commentaire: ''
            };

            inscriptionServiceSpy.deleteInscription.and.returnValue(of(void 0));

        // WHEN
            component.validerModification(payload);

            tick();

        // THEN
            expect(inscriptionServiceSpy.deleteInscription).toHaveBeenCalledWith(100);
            expect(component.inscriptionSuccess).toBeTrue();
            
            tick(2000); 
        }));
    });
});