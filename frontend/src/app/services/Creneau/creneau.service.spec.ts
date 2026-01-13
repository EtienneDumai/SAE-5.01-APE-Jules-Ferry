import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CreneauService } from './creneau.service';

describe('CreneauService', () => {
  let service: CreneauService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(CreneauService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
