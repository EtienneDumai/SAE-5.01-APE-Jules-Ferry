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
        authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'isAuthenticatedStatus']);
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

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit (Chargement des données)', () => {
        it('devrait charger l\'événement, l\'auteur et le formulaire au démarrage', () => {
            fixture.detectChanges();

            expect(evenementServiceSpy.getEvenementById).toHaveBeenCalledWith(1);
            expect(utilisateurServiceSpy.getUtilisateurById).toHaveBeenCalledWith(1);
            expect(formulaireServiceSpy.getFormulaireById).toHaveBeenCalledWith(10);

            expect(component.evenement).toEqual(mockEvenement);
            expect(component.auteur).toEqual(mockAuteur);
            expect(component.formulaire).toBeDefined();
            expect(component.loadingEvenement).toBeFalse();
        });

        it('devrait gérer une erreur de chargement de l\'événement', () => {
            evenementServiceSpy.getEvenementById.and.returnValue(throwError(() => new Error('Err')));
            fixture.detectChanges();
            expect(component.errorEvenement).toBeTrue();
            expect(component.loadingEvenement).toBeFalse();
        });
    });

    describe('Logique métier', () => {
        beforeEach(() => fixture.detectChanges());

        it('isEvenementTermine devrait retourner false pour un événement futur', () => {
            expect(component.isEvenementTermine()).toBeFalse();
        });

        it('isInscriptionOuverte devrait retourner true pour un événement futur', () => {
            expect(component.isInscriptionOuverte()).toBeTrue();
        });

        it('calculerInscriptionsExistantes devrait marquer les créneaux où le user est inscrit', () => {
            const formWithInscription = JSON.parse(JSON.stringify(mockFormulaire));
            formWithInscription.taches[0].creneaux[0].inscriptions.push({
                id_inscription: 88, id_creneau: 100, id_utilisateur: currentUser.id_utilisateur, commentaire: null
            });

            component.formulaire = formWithInscription;
            component.calculerInscriptionsExistantes();

            expect(component.mesCreneauxActuels.length).toBe(1);
            expect(component.mesCreneauxActuels[0].id_creneau).toBe(100);
            expect(component.formulaire?.taches![0].creneaux![0].est_inscrit).toBeTrue();
        });
    });

    describe('Interactions Utilisateur', () => {
        beforeEach(() => fixture.detectChanges());

        it('goBack devrait appeler location.back()', () => {
            component.goBack();
            expect(locationSpy.back).toHaveBeenCalled();
        });

        it('toggleInscriptionForm devrait rediriger vers login si non connecté', () => {
            authServiceSpy.isAuthenticatedStatus.and.returnValue(false);
            component.toggleInscriptionForm();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/login'], jasmine.any(Object));
            expect(component.showInscriptionForm).toBeFalse();
        });

        it('toggleInscriptionForm devrait afficher le formulaire si connecté', () => {
            authServiceSpy.isAuthenticatedStatus.and.returnValue(true);
            component.showInscriptionForm = false;
            component.toggleInscriptionForm();
            expect(component.showInscriptionForm).toBeTrue();
        });
    });

    describe('Redirection avec paramètre openForm', () => {
        it('devrait ouvrir le formulaire automatiquement si openForm=true et conditions remplies', fakeAsync(() => {
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

            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();
            tick(500);

            expect(newComponent.showInscriptionForm).toBeTrue();
        }));

        it('ne devrait pas ouvrir le formulaire si utilisateur non authentifié', fakeAsync(() => {
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

            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();
            tick(500);

            expect(newComponent.showInscriptionForm).toBeFalse();
        }));

        it('ne devrait pas ouvrir le formulaire si événement terminé', fakeAsync(() => {
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

            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();
            tick(500);

            expect(newComponent.showInscriptionForm).toBeFalse();
        }));

        it('ne devrait pas ouvrir le formulaire si pas de formulaire d\'inscription', fakeAsync(() => {
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

            const newFixture = TestBed.createComponent(EvenementDetailComponent);
            const newComponent = newFixture.componentInstance;
            newComponent.ngOnInit();
            tick();
            newFixture.detectChanges();
            tick(500);

            expect(newComponent.showInscriptionForm).toBeFalse();
        }));
    });

    describe('Gestion des Inscriptions (handleSubmit)', () => {
        beforeEach(() => fixture.detectChanges());

        it('devrait appeler createInscription pour une nouvelle sélection', fakeAsync(() => {
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

            component.handleSubmit(payload);
            tick();
            
            expect(inscriptionServiceSpy.createInscription).toHaveBeenCalled();
            expect(component.inscriptionSuccess).toBeTrue();
            expect(component.showInscriptionForm).toBeFalse();
            
            tick(2000); 
        }));

        it('devrait appeler deleteInscription pour une désinscription', fakeAsync(() => {
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

            component.validerModification(payload);
            tick();

            expect(inscriptionServiceSpy.deleteInscription).toHaveBeenCalledWith(100);
            expect(component.inscriptionSuccess).toBeTrue();
            
            tick(2000); 
        }));
    });
});