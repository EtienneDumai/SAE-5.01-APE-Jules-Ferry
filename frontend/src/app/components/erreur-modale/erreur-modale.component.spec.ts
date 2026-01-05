import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErreurModaleComponent } from './erreur-modale.component';

describe('ErreurModaleComponent', () => {
  let component: ErreurModaleComponent;
  let fixture: ComponentFixture<ErreurModaleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErreurModaleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErreurModaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
