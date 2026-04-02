import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsletterUnsubscribeComponent } from './newsletter-unsubscribe.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('NewsletterUnsubscribeComponent', () => {
  let component: NewsletterUnsubscribeComponent;
  let fixture: ComponentFixture<NewsletterUnsubscribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsletterUnsubscribeComponent],
      providers: [provideHttpClient(), provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewsletterUnsubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});