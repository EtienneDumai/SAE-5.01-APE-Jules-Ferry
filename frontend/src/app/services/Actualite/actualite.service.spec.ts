import { TestBed } from '@angular/core/testing';

import { ActualiteService } from './actualite.service';

describe('ActualiteService', () => {
  let service: ActualiteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActualiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
