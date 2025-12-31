import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvennementCardComponent } from './evennement-card.component';

describe('EvennementCardComponent', () => {
  let component: EvennementCardComponent;
  let fixture: ComponentFixture<EvennementCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvennementCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvennementCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
