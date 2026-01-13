import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { InscriptionService } from './inscription.service';

describe('InscriptionService', () => {
  let service: InscriptionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(InscriptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
