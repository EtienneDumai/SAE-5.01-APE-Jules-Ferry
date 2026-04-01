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

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  it('should_initialize_onglet_comptes_par_default', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component.activeTab).toBe('comptes');
  });

  it('should_change_onglet_actif_when_switchtab_appele', () => {
  // GIVEN

  // WHEN
    component.switchTab('evenements');

  // THEN
    expect(component.activeTab).toBe('evenements');

    component.switchTab('newsletters');
    expect(component.activeTab).toBe('newsletters');
  });
});
