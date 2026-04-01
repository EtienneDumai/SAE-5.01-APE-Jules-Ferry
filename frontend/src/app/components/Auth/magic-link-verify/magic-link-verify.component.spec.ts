/**
 * Fichier : frontend/src/app/components/Auth/magic-link-verify/magic-link-verify.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant magic link verify.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MagicLinkVerifyComponent } from './magic-link-verify.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../../services/Auth/auth.service'; // Vérifie bien ce chemin !

describe('MagicLinkVerifyComponent', () => {
  let component: MagicLinkVerifyComponent;
  let fixture: ComponentFixture<MagicLinkVerifyComponent>;

  beforeEach(async () => {
    // On crée un faux service d'authentification pour simuler le test
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['verifyMagicLink']);

    await TestBed.configureTestingModule({
      imports: [MagicLinkVerifyComponent],
      providers: [
        provideRouter([]), // On simule le routeur
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MagicLinkVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });
});