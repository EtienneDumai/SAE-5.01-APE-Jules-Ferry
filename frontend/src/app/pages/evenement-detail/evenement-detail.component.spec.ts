import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvenementDetailComponent } from './evenement-detail.component';

describe('EvenementDetailComponent', () => {
  let component: EvenementDetailComponent;
  let fixture: ComponentFixture<EvenementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvenementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvenementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
