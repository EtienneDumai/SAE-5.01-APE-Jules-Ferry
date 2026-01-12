import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementDetailComponent } from './evenement-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('EvenementDetailComponent', () => {
  let component: EvenementDetailComponent;
  let fixture: ComponentFixture<EvenementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EvenementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
