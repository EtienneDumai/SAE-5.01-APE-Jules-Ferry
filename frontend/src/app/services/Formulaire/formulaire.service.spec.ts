import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormulaireService } from './formulaire.service';

describe('FormulaireService', () => {
  let service: FormulaireService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(FormulaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
