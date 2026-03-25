import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { EvenementEditComponent } from './evenement-edit.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { FormulaireService } from '../../services/Formulaire/formulaire.service';
import { ToastService } from '../../services/Toast/toast.service';
import { Formulaire } from '../../models/Formulaire/formulaire';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';

describe('EvenementEditComponent', () => {
  let component: EvenementEditComponent;
  let fixture: ComponentFixture<EvenementEditComponent>;
  let formulaireServiceSpy: jasmine.SpyObj<FormulaireService>;

  const activeTemplate: Formulaire = {
    id_formulaire: 1,
    nom_formulaire: 'Modele actif',
    description: 'Description',
    statut: StatutFormulaire.actif,
    is_template: true,
    id_createur: 1,
    taches: []
  };

  beforeEach(async () => {
    formulaireServiceSpy = jasmine.createSpyObj('FormulaireService', ['getTemplates']);
    formulaireServiceSpy.getTemplates.and.returnValue(of([activeTemplate]));

    await TestBed.configureTestingModule({
      imports: [EvenementEditComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'new' } }
          }
        },
        {
          provide: EvenementService,
          useValue: jasmine.createSpyObj('EvenementService', ['getEvenementById', 'createEvenement', 'updateEvenement'])
        },
        { provide: FormulaireService, useValue: formulaireServiceSpy },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['show', 'showWithTimeout'])
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EvenementEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load only active templates for event creation', () => {
    expect(formulaireServiceSpy.getTemplates).toHaveBeenCalledWith(StatutFormulaire.actif);
    expect(component.templates).toEqual([activeTemplate]);
    expect(component.loading).toBeFalse();
  });
});
