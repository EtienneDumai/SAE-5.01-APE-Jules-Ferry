/**
 * Fichier : frontend/src/app/components/toast/toast.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant toast.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService } from '../../services/Toast/toast.service';
import { BehaviorSubject } from 'rxjs';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastService: jasmine.SpyObj<ToastService>;
  const mockToastSubject = new BehaviorSubject<{ type: string; message: string } | null>(null);

  beforeEach(async () => {
    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['clear'], {
      toast: mockToastSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    mockToastSubject.next(null);
  });

  describe('Initialisation du composant', () => {
    it('should_create', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component).toBeTruthy();
    });

    it('should_ne_rien_display_initialement_when_toast_null', () => {
    // GIVEN

    // WHEN
      const toastElement = fixture.nativeElement.querySelector('.fixed');

    // THEN
      expect(toastElement).toBeNull();
    });
  });

  describe('Affichage du toast', () => {
    it('should_display_toast_erreur', () => {
    // GIVEN

    // WHEN
      mockToastSubject.next({ type: 'error', message: 'Erreur survenue' });

      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.fixed');
      const textContent = fixture.nativeElement.textContent;

    // THEN
      expect(toastElement).toBeTruthy();
      expect(toastElement.innerHTML).toContain('border-red-500'); 
      expect(textContent).toContain('Erreur survenue');
    });

    it('should_display_toast_success', () => {
    // GIVEN

    // WHEN
      mockToastSubject.next({ type: 'success', message: 'Opération réussie' });

      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.fixed');
      const textContent = fixture.nativeElement.textContent;

    // THEN
      expect(toastElement).toBeTruthy();
      expect(toastElement.innerHTML).toContain('var(--primary-green)');
      expect(textContent).toContain('Opération réussie');
    });
  });

  describe('Interaction utilisateur', () => {
    it('should_call_clear_service_when_clicking_bouton_close', () => {
    // GIVEN

    // WHEN
      mockToastSubject.next({ type: 'success', message: 'Message de test' });
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('button');

      closeButton.click();

    // THEN
      expect(toastService.clear).toHaveBeenCalled();
    });
  });
});