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
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('devrait ne rien afficher initialement (quand le toast est null)', () => {
      const toastElement = fixture.nativeElement.querySelector('.fixed');
      expect(toastElement).toBeNull();
    });
  });

  describe('Affichage du toast', () => {
    it('devrait afficher un toast d\'erreur', () => {
      mockToastSubject.next({ type: 'error', message: 'Erreur survenue' });
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.fixed');
      const messageElement = fixture.nativeElement.querySelector('p.break-all');

      expect(toastElement).toBeTruthy();
      expect(toastElement.classList).toContain('error');
      expect(messageElement.textContent).toContain('Erreur survenue');
    });

    it('devrait afficher un toast de succès', () => {
      mockToastSubject.next({ type: 'success', message: 'Opération réussie' });
      fixture.detectChanges();

      const toastElement = fixture.nativeElement.querySelector('.fixed');
      const messageElement = fixture.nativeElement.querySelector('p.break-all');

      expect(toastElement).toBeTruthy();
      expect(toastElement.classList).toContain('success');
      expect(messageElement.textContent).toContain('Opération réussie');
    });
  });

  describe('Interaction utilisateur', () => {
    it('devrait appeler clear() du service au clic sur le bouton fermer', () => {
      mockToastSubject.next({ type: 'success', message: 'Message de test' });
      fixture.detectChanges();

      const closeButton = fixture.nativeElement.querySelector('button.close');
      closeButton.click();

      expect(toastService.clear).toHaveBeenCalled();
    });
  });
});
