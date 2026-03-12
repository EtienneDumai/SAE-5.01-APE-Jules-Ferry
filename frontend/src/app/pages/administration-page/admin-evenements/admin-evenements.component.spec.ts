import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AdminEvenementsComponent } from './admin-evenements.component';

describe('AdminEvenementsComponent', () => {
  let component: AdminEvenementsComponent;
  let fixture: ComponentFixture<AdminEvenementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEvenementsComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AdminEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
