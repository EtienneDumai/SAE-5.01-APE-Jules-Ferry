import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteUtilisateurComponent } from './compte-utilisateur.component';

describe('CompteUtilisateurComponent', () => {
  let component: CompteUtilisateurComponent;
  let fixture: ComponentFixture<CompteUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompteUtilisateurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
