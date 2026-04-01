/**
 * Fichier : frontend/src/app/components/hello-asso-widget/hello-asso-widget.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant hello asso widget.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelloAssoWidgetComponent } from './hello-asso-widget.component';

describe('HelloAssoWidgetComponent', () => {
  let component: HelloAssoWidgetComponent;
  let fixture: ComponentFixture<HelloAssoWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelloAssoWidgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelloAssoWidgetComponent);
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
