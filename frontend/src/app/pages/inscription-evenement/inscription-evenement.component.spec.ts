import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionEvenementComponent } from './inscription-evenement.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Evenement } from '../../models/Evenement/evenement';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';

describe('InscriptionEvenementComponent', () => {
  let component: InscriptionEvenementComponent;
  let fixture: ComponentFixture<InscriptionEvenementComponent>;

  const mockEvenement: Evenement = {
    id_evenement: 1,
    titre: 'Événement test',
    description: 'Description test',
    date_evenement: new Date(),
    heure_debut: '10:00',
    heure_fin: '12:00',
    lieu: 'Salle test',
    image_url: 'test.jpg',
    statut: StatutEvenement.publie,
    id_auteur: 1,
    id_formulaire: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionEvenementComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InscriptionEvenementComponent);
    component = fixture.componentInstance;
    
    component.evenement = mockEvenement;
    
    fixture.detectChanges();
  });

  it('devrait créer', () => {
    expect(component).toBeTruthy();
  });
});
