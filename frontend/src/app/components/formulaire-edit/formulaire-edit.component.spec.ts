import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { FormulaireEditComponent } from './formulaire-edit.component';

describe('FormulaireEditComponent', () => {
  let component: FormulaireEditComponent;
  let fixture: ComponentFixture<FormulaireEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormulaireEditComponent],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '1' }),
            snapshot: { paramMap: { get: () => '1' } }
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormulaireEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
