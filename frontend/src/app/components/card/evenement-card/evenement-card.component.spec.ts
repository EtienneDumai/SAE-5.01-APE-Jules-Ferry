import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementCardComponent } from './evenement-card.component';

describe('EvenementCardComponent', () => {
  let component: EvenementCardComponent;
  let fixture: ComponentFixture<EvenementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvenementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
