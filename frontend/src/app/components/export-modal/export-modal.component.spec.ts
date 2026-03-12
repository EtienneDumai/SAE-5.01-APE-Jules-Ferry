import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExportModalComponent } from './export-modal.component';

describe('ExportModalComponent', () => {
  let component: ExportModalComponent;
  let fixture: ComponentFixture<ExportModalComponent>;

  const mockColumns = [
    { key: 'nom', label: 'Nom', selected: true },
    { key: 'email', label: 'Email', selected: false },
    { key: 'role', label: 'Rôle', selected: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportModalComponent);
    component = fixture.componentInstance;
    component.availableColumns = mockColumns.map(c => ({ ...c }));
    fixture.detectChanges();
  });

  it('devrait être créé', () => {
    expect(component).toBeTruthy();
  });

  describe('selectAll', () => {
    it('devrait sélectionner toutes les colonnes', () => {
      component.deselectAll();
      component.selectAll();
      expect(component.availableColumns.every(c => c.selected)).toBeTrue();
    });
  });

  describe('deselectAll', () => {
    it('devrait désélectionner toutes les colonnes', () => {
      component.deselectAll();
      expect(component.availableColumns.every(c => !c.selected)).toBeTrue();
    });
  });

  describe('onConfirm', () => {
    it('devrait émettre les clés des colonnes sélectionnées', () => {
      const emitted: string[][] = [];
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toContain('nom');
      expect(emitted[0]).toContain('role');
      expect(emitted[0]).not.toContain('email');
    });

    it('devrait émettre un tableau vide si rien n\'est sélectionné', () => {
      component.deselectAll();
      const emitted: string[][] = [];
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();

      expect(emitted[0]).toEqual([]);
    });

    it('devrait émettre toutes les clés si tout est sélectionné', () => {
      component.selectAll();
      const emitted: string[][] = [];
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();

      expect(emitted[0].length).toBe(3);
    });
  });

  describe('onCancel', () => {
    it('devrait émettre un événement closeModal', () => {
      let emitted = false;
      component.closeModal.subscribe(() => (emitted = true));

      component.onCancel();

      expect(emitted).toBeTrue();
    });
  });

  describe('Inputs', () => {
    it('devrait afficher le titre par défaut', () => {
      expect(component.title).toBe('Exporter les données');
    });

    it('devrait accepter un titre personnalisé', () => {
      component.title = 'Export personnalisé';
      expect(component.title).toBe('Export personnalisé');
    });
  });
});
