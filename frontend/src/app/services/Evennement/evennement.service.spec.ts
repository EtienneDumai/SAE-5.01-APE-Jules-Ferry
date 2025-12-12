import { TestBed } from '@angular/core/testing';

import { EvennementService } from './evennement.service';

describe('EvennementService', () => {
  let service: EvennementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvennementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
