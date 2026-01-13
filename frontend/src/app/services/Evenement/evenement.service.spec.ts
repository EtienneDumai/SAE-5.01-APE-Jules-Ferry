import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { EvenementService } from './evenement.service';

describe('EvenementService', () => {
  let service: EvenementService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(EvenementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
