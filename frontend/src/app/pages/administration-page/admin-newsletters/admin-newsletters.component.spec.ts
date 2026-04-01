/**
 * Fichier : frontend/src/app/pages/administration-page/admin-newsletters/admin-newsletters.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page admin newsletters.
 */

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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  it('should_open_form_ajout', () => {
  // GIVEN

  // WHEN
    component.ouvrirAjout();

  // THEN
    expect(component.showAddForm).toBeTrue();
  });

  it('should_deny_email_invalid_ouverture_popup_password_password', () => {
  // GIVEN
    component.showAddForm = true;
    component.emailAAjouter = 'invalide';

  // WHEN
    component.demanderAjout();

  // THEN
    expect(component.showPasswordModal).toBeFalse();
    expect(toastService.showWithTimeout).toHaveBeenCalledWith(
      'Veuillez saisir un email valide.',
      TypeErreurToast.ERROR
    );
  });

  it('should_open_popup_password_password_ajout_valid', () => {
  // GIVEN
    component.showAddForm = true;
    component.emailAAjouter = 'test@example.com';

  // WHEN
    component.demanderAjout();

  // THEN
    expect(component.pendingAction).toBe('CREATE');
    expect(component.showPasswordModal).toBeTrue();
  });

  it('should_add_abonne_confirmation_password_password', () => {
  // GIVEN
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

  // WHEN
    component.onPasswordConfirmed('password123');

  // THEN
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

  it('should_display_error_password_password_admin_incorrect_when_ajout', () => {
  // GIVEN
    newsletterService.addSubscriber.and.returnValue(throwError(() => ({ status: 403 })));
    component.showAddForm = true;
    component.emailAAjouter = 'test@example.com';
    component.pendingAction = 'CREATE';

  // WHEN
    component.onPasswordConfirmed('bad-password');

  // THEN
    expect(toastService.showWithTimeout).toHaveBeenCalledWith(
      'Mot de passe administrateur incorrect',
      TypeErreurToast.ERROR
    );
    expect(component.showPasswordModal).toBeFalse();
  });
});
