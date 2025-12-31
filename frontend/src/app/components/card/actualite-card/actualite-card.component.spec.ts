import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActualiteCardComponent } from './actualite-card.component';

describe('ActualiteCardComponent', () => {
  let component: ActualiteCardComponent;
  let fixture: ComponentFixture<ActualiteCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActualiteCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActualiteCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
