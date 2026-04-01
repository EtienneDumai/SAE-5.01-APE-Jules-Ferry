/**
 * Fichier : frontend/src/app/components/instagram-view/instagram-view.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant instagram view.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramViewComponent } from './instagram-view.component';

describe('InstagramViewComponent', () => {
  let component: InstagramViewComponent;
  let fixture: ComponentFixture<InstagramViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstagramViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstagramViewComponent);
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
