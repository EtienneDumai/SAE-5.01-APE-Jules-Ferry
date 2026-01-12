import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActualiteService } from './actualite.service';


describe('ActualiteService', () => {
  let service: ActualiteService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    service = TestBed.inject(ActualiteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
