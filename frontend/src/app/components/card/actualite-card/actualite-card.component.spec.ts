import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActualiteCardComponent } from './actualite-card.component';
import { provideRouter } from '@angular/router';
import { StatutActualite } from '../../../enums/StatutActualite/statut-actualite';

describe('ActualiteCardComponent', () => {
  let component: ActualiteCardComponent;
  let fixture: ComponentFixture<ActualiteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualiteCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ActualiteCardComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('devrait avoir l\'input id_actualite', () => {
      component.id_actualite = 123;
      expect(component.id_actualite).toBe(123);
    });

    it('devrait avoir l\'input titre avec une chaîne vide par défaut', () => {
      expect(component.titre).toBe('');
      component.titre = 'Test Actualité';
      expect(component.titre).toBe('Test Actualité');
    });

    it('devrait avoir l\'input contenu', () => {
      const testContenu = 'Ceci est le contenu de l\'actualité';
      component.contenu = testContenu;
      expect(component.contenu).toBe(testContenu);
    });

    it('devrait avoir l\'input image_url', () => {
      const testUrl = 'https://example.com/image.jpg';
      component.image_url = testUrl;
      expect(component.image_url).toBe(testUrl);
    });

    it('devrait avoir l\'input datePublication', () => {
      const testDate = new Date('2026-01-15');
      component.datePublication = testDate;
      expect(component.datePublication).toEqual(testDate);
    });

    it('devrait avoir l\'input statut', () => {
      component.statut = StatutActualite.publie;
      expect(component.statut).toBe(StatutActualite.publie);
    });
  });

  describe('Component rendering', () => {
    beforeEach(() => {
      component.id_actualite = 1;
      component.titre = 'Actualité Test';
      component.contenu = 'Contenu de test pour l\'actualité';
      component.image_url = 'test-image.jpg';
      component.datePublication = new Date('2026-01-15');
      component.statut = StatutActualite.publie;
      fixture.detectChanges();
    });

    it('devrait s\'afficher avec tous les inputs fournis', () => {
      expect(component.id_actualite).toBe(1);
      expect(component.titre).toBe('Actualité Test');
      expect(component.contenu).toBe('Contenu de test pour l\'actualité');
      expect(component.image_url).toBe('test-image.jpg');
      expect(component.datePublication).toEqual(new Date('2026-01-15'));
      expect(component.statut).toBe(StatutActualite.publie);
    });
  });

  describe('Statut handling', () => {
    it('devrait accepter StatutActualite.brouillon', () => {
      component.statut = StatutActualite.brouillon;
      expect(component.statut).toBe(StatutActualite.brouillon);
    });

    it('devrait accepter StatutActualite.publie', () => {
      component.statut = StatutActualite.publie;
      expect(component.statut).toBe(StatutActualite.publie);
    });

    it('devrait accepter StatutActualite.archivee', () => {
      component.statut = StatutActualite.archive;
      expect(component.statut).toBe(StatutActualite.archive);
    });
  });
});
