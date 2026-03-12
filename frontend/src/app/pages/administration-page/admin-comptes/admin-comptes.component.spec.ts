import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { AdminComptesComponent } from './admin-comptes.component';

describe('AdminComptesComponent', () => {
  let component: AdminComptesComponent;
  let fixture: ComponentFixture<AdminComptesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminComptesComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminComptesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
