/**
 * Fichier : frontend/src/app/pages/set-password/set-password.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page set password.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SetPasswordComponent } from './set-password.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetPasswordComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParams: { token: 'un-faux-token-de-test', id: '99' }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
    expect(component.form).toBeDefined(); 
  });
});