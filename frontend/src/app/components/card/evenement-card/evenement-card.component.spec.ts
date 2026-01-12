import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementCardComponent } from './evenement-card.component';
import { provideRouter } from '@angular/router';

describe('EvenementCardComponent', () => {
  let component: EvenementCardComponent;
  let fixture: ComponentFixture<EvenementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(EvenementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
