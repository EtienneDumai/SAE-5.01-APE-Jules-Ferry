import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router'; 
import { UtilisateurService } from '../../services/Utilisateur/utilisateur.service';
import { BehaviorSubject } from 'rxjs';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { RoleUtilisateur } from '../../enums/RoleUtilisateur/role-utilisateur';

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;
  let utilisateurService: jasmine.SpyObj<UtilisateurService>;
  let utilisateurCourantSubject: BehaviorSubject<Utilisateur | null>;

  const mockUser: Utilisateur = {
    id: 1,
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'marie.dupont@example.com',
    role: RoleUtilisateur.administrateur,
  } as unknown as Utilisateur;

  beforeEach(async () => {
    utilisateurCourantSubject = new BehaviorSubject<Utilisateur | null>(null);

    const utilisateurServiceSpy = jasmine.createSpyObj(
      'UtilisateurService',
      ['setUtilisateurCourant'],
      {
        utilisateurCourant: utilisateurCourantSubject.asObservable()
      }
    );

    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]), // NOUVEAU : On fournit un faux routeur au test !
        { provide: UtilisateurService, useValue: utilisateurServiceSpy }
      ],
    }).compileComponents();

    utilisateurService = TestBed.inject(UtilisateurService) as jasmine.SpyObj<UtilisateurService>;
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('devrait initialiser utilisateurCourant depuis le service', () => {
      fixture.detectChanges();
      expect(component.utilisateurCourant).toBeDefined();
      expect(component.utilisateurCourant).toBe(utilisateurService.utilisateurCourant);
    });

    it('devrait recevoir un utilisateur null initialement', (done) => {
      fixture.detectChanges();
      component.utilisateurCourant.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('devrait recevoir les mises à jour d\'utilisateur depuis le service', (done) => {
      fixture.detectChanges();
      utilisateurCourantSubject.next(mockUser);
      
      component.utilisateurCourant.subscribe(user => {
        expect(user).toEqual(mockUser);
        done();
      });
    });
  });

  describe('setUtilisateur', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('devrait appeler utilisateurService.setUtilisateurCourant avec l\'utilisateur', () => {
      component.setUtilisateur(mockUser);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(mockUser);
    });

    it('devrait appeler utilisateurService.setUtilisateurCourant avec null', () => {
      component.setUtilisateur(null);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(null);
    });
  });

  describe('roleUtilisateur', () => {
    it('devrait avoir la propriété roleUtilisateur définie sur l\'enum RoleUtilisateur', () => {
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });
});