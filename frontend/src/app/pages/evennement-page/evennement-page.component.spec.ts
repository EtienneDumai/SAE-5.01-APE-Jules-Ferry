import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvennementPageComponent } from './evennement-page.component';

describe('EvennementPageComponent', () => {
  let component: EvennementPageComponent;
  let fixture: ComponentFixture<EvennementPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvennementPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvennementPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
