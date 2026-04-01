/**
 * Fichier : frontend/src/app/services/Newsletter/newsletter.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Newsletter.
 */

import { TestBed } from '@angular/core/testing';

import { NewsletterService } from './newsletter.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';

describe('NewsletterService', () => {
  let service: NewsletterService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(NewsletterService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('abonne une adresse email', () => {
    service.subscribe({ email: 'test@example.com' }).subscribe(response => {
      expect(response.message).toBe('ok');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/newsletter/subscribe`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'test@example.com' });
    req.flush({ message: 'ok' });
  });

  it('récupère tous les abonnés', () => {
    service.getAllSubscribers().subscribe(subscribers => {
      expect(subscribers.length).toBe(1);
      expect(subscribers[0].email).toBe('a@example.com');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/newsletters`);
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 1, email: 'a@example.com' }]);
  });

  it('ajoute un abonné depuis l admin', () => {
    service.addSubscriber({ email: 'admin@example.com', admin_password: 'secret' }).subscribe(response => {
      expect(response.message).toBe('created');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/newsletters`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'admin@example.com', admin_password: 'secret' });
    req.flush({ message: 'created' });
  });

  it('supprime un abonné sans mot de passe admin', () => {
    service.deleteSubscriber(3).subscribe(response => {
      expect(response.message).toBe('deleted');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/newsletters/3`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toBeNull();
    req.flush({ message: 'deleted' });
  });

  it('supprime un abonné avec mot de passe admin', () => {
    service.deleteSubscriber(3, 'secret').subscribe(response => {
      expect(response.message).toBe('deleted');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/newsletters/3`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ admin_password: 'secret' });
    req.flush({ message: 'deleted' });
  });
});
