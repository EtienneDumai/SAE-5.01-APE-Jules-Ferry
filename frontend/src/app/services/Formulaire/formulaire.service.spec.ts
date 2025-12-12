import { TestBed } from '@angular/core/testing';

import { FormulaireService } from './formulaire.service';

describe('FormulaireService', () => {
  let service: FormulaireService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormulaireService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
