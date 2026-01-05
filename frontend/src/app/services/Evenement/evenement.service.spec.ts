import { TestBed } from '@angular/core/testing';

import { EvenementService } from './evenement.service';

describe('EvenementService', () => {
  let service: EvenementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvenementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
