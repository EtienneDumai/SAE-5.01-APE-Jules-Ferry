import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';

import { AdminNewslettersComponent } from './admin-newsletters.component';
import { NewsletterService } from '../../../services/Newsletter/newsletter.service';
import { ToastService } from '../../../services/Toast/toast.service';
import { ExportCsvService } from '../../../services/ExportCsv/export-csv.service';
import { TypeErreurToast } from '../../../enums/TypeErreurToast/type-erreur-toast';

describe('AdminNewslettersComponent', () => {
  let component: AdminNewslettersComponent;
  let fixture: ComponentFixture<AdminNewslettersComponent>;
  let newsletterService: jasmine.SpyObj<NewsletterService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const newsletterServiceSpy = jasmine.createSpyObj('NewsletterService', ['getAllSubscribers', 'addSubscriber', 'deleteSubscriber']);
    newsletterServiceSpy.getAllSubscribers.and.returnValue(of([]));

    const toastServiceSpy = jasmine.createSpyObj('ToastService', ['showWithTimeout']);
    const exportCsvServiceSpy = jasmine.createSpyObj('ExportCsvService', ['exportAsCsvFile']);

    await TestBed.configureTestingModule({
      imports: [AdminNewslettersComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NewsletterService, useValue: newsletterServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: ExportCsvService, useValue: exportCsvServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminNewslettersComponent);
    component = fixture.componentInstance;
    newsletterService = TestBed.inject(NewsletterService) as jasmine.SpyObj<NewsletterService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ouvre le formulaire d\'ajout', () => {
    component.ouvrirAjout();

    expect(component.showAddForm).toBeTrue();
  });

  it('refuse un email invalide avant ouverture de la popup mot de passe', () => {
    component.showAddForm = true;
    component.emailAAjouter = 'invalide';

    component.demanderAjout();

    expect(component.showPasswordModal).toBeFalse();
    expect(toastService.showWithTimeout).toHaveBeenCalledWith(
      'Veuillez saisir un email valide.',
      TypeErreurToast.ERROR
    );
  });

  it('ouvre la popup mot de passe pour un ajout valide', () => {
    component.showAddForm = true;
    component.emailAAjouter = 'test@example.com';

    component.demanderAjout();

    expect(component.pendingAction).toBe('CREATE');
    expect(component.showPasswordModal).toBeTrue();
  });

  it('ajoute un abonne apres confirmation du mot de passe', () => {
    newsletterService.addSubscriber.and.returnValue(of({ message: 'Adresse email ajoutée à la newsletter.' }));
    newsletterService.getAllSubscribers.and.returnValues(of([]), of([
      {
        id_abonne: 1,
        email: 'test@example.com',
        statut: 'actif',
        created_at: '2026-03-20T00:00:00.000000Z',
        updated_at: '2026-03-20T00:00:00.000000Z'
      }
    ]));
    component.showAddForm = true;
    component.emailAAjouter = 'test@example.com';
    component.pendingAction = 'CREATE';

    component.onPasswordConfirmed('password123');

    expect(newsletterService.addSubscriber).toHaveBeenCalledWith({
      email: 'test@example.com',
      admin_password: 'password123'
    });
    expect(toastService.showWithTimeout).toHaveBeenCalledWith(
      'Adresse email ajoutée à la newsletter.',
      TypeErreurToast.SUCCESS
    );
    expect(component.showAddForm).toBeFalse();
    expect(component.emailAAjouter).toBe('');
  });

  it('affiche une erreur si le mot de passe admin est incorrect lors de l\'ajout', () => {
    newsletterService.addSubscriber.and.returnValue(throwError(() => ({ status: 403 })));
    component.showAddForm = true;
    component.emailAAjouter = 'test@example.com';
    component.pendingAction = 'CREATE';

    component.onPasswordConfirmed('bad-password');

    expect(toastService.showWithTimeout).toHaveBeenCalledWith(
      'Mot de passe administrateur incorrect',
      TypeErreurToast.ERROR
    );
    expect(component.showPasswordModal).toBeFalse();
  });
});
