import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvennementDetailComponent } from './evennement-detail.component';

describe('EvennementDetailComponent', () => {
  let component: EvennementDetailComponent;
  let fixture: ComponentFixture<EvennementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvennementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvennementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
