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

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });

  it('devrait afficher le spinner de chargement', () => {
    const spinnerElement = fixture.debugElement.query(By.css('.animate-spin'));
    expect(spinnerElement).toBeTruthy();
  });

  it('devrait affichier le texte de chargement "Chargement des données..."', () => {
    const textElement = fixture.debugElement.query(By.css('span'));
    expect(textElement.nativeElement.textContent).toContain('Chargement des données...');
  });
});
