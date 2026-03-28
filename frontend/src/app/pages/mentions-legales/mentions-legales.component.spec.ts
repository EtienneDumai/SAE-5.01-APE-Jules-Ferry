/**
 * Fichier : frontend/src/app/pages/mentions-legales/mentions-legales.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste la page mentions legales.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MentionsLegalesComponent } from './mentions-legales.component';

describe('MentionsLegalesComponent', () => {
  let component: MentionsLegalesComponent;
  let fixture: ComponentFixture<MentionsLegalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MentionsLegalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MentionsLegalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
