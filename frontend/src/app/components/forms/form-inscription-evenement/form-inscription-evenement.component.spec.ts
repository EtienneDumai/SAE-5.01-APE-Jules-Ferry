import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormInscriptionEvenementComponent } from './form-inscription-evenement.component';

describe('FormInscriptionEvenementComponent', () => {
  let component: FormInscriptionEvenementComponent;
  let fixture: ComponentFixture<FormInscriptionEvenementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormInscriptionEvenementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormInscriptionEvenementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
