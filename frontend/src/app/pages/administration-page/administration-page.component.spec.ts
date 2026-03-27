/**
 * Fichier : frontend/src/app/pages/administration-page/administration-page.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page administration page.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AdministrationPageComponent } from './administration-page.component';

describe('AdministrationPageComponent', () => {
  let component: AdministrationPageComponent;
  let fixture: ComponentFixture<AdministrationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministrationPageComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdministrationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
