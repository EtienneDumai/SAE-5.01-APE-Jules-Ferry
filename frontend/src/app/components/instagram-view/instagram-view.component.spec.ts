import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstagramViewComponent } from './instagram-view.component';

describe('InstagramViewComponent', () => {
  let component: InstagramViewComponent;
  let fixture: ComponentFixture<InstagramViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstagramViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstagramViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
