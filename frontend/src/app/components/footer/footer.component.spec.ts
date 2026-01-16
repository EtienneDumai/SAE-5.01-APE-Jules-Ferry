import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
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
        { provide: UtilisateurService, useValue: utilisateurServiceSpy }
      ],
    }).compileComponents();

    utilisateurService = TestBed.inject(UtilisateurService) as jasmine.SpyObj<UtilisateurService>;
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize utilisateurCourant from service', () => {
      fixture.detectChanges();
      expect(component.utilisateurCourant).toBeDefined();
      expect(component.utilisateurCourant).toBe(utilisateurService.utilisateurCourant);
    });

    it('should receive null user initially', (done) => {
      fixture.detectChanges();
      component.utilisateurCourant.subscribe(user => {
        expect(user).toBeNull();
        done();
      });
    });

    it('should receive user updates from service', (done) => {
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

    it('should call utilisateurService.setUtilisateurCourant with user', () => {
      component.setUtilisateur(mockUser);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(mockUser);
    });

    it('should call utilisateurService.setUtilisateurCourant with null', () => {
      component.setUtilisateur(null);
      expect(utilisateurService.setUtilisateurCourant).toHaveBeenCalledWith(null);
    });
  });

  describe('roleUtilisateur', () => {
    it('should have roleUtilisateur property set to RoleUtilisateur enum', () => {
      expect(component.roleUtilisateur).toBe(RoleUtilisateur);
    });
  });
});
