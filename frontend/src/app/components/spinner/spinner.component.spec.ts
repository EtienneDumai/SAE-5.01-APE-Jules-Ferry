/**
 * Fichier : frontend/src/app/components/spinner/spinner.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant spinner.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from './spinner.component';
import { By } from '@angular/platform-browser';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  it('should_display_spinner_chargement', () => {
  // GIVEN

  // WHEN
    const spinnerElement = fixture.debugElement.query(By.css('.animate-spin'));

  // THEN
    expect(spinnerElement).toBeTruthy();
  });

  it('should_display_text_chargement', () => {
  // GIVEN

  // WHEN
    const textElement = fixture.debugElement.query(By.css('span'));

  // THEN
    expect(textElement.nativeElement.textContent).toContain('Chargement');
  });
});