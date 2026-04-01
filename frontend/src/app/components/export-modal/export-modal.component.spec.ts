/**
 * Fichier : frontend/src/app/components/export-modal/export-modal.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant export modal.
 */

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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(component).toBeTruthy();
  });

  describe('selectAll', () => {
    it('should_select_all_colonnes', () => {
    // GIVEN

    // WHEN
      component.deselectAll();

      component.selectAll();

    // THEN
      expect(component.availableColumns.every(c => c.selected)).toBeTrue();
    });
  });

  describe('deselectAll', () => {
    it('should_deselect_all_colonnes', () => {
    // GIVEN

    // WHEN
      component.deselectAll();

    // THEN
      expect(component.availableColumns.every(c => !c.selected)).toBeTrue();
    });
  });

  describe('onConfirm', () => {
    it('should_emit_cles_colonnes_selectionnees', () => {
    // GIVEN
      const emitted: string[][] = [];

    // WHEN
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();

    // THEN
      expect(emitted.length).toBe(1);
      expect(emitted[0]).toContain('nom');
      expect(emitted[0]).toContain('role');
      expect(emitted[0]).not.toContain('email');
    });

    it('should_emit_tableau_empty_rien_n_est_selectionne', () => {
    // GIVEN

    // WHEN
      component.deselectAll();
      const emitted: string[][] = [];
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();

    // THEN
      expect(emitted[0]).toEqual([]);
    });

    it('should_emit_all_cles_tout_select', () => {
    // GIVEN

    // WHEN
      component.selectAll();
      const emitted: string[][] = [];
      component.confirm.subscribe(keys => emitted.push(keys));

      component.onConfirm();

    // THEN
      expect(emitted[0].length).toBe(3);
    });
  });

  describe('onCancel', () => {
    it('should_emit_event_closemodal', () => {
    // GIVEN
      let emitted = false;

    // WHEN
      component.closeModal.subscribe(() => (emitted = true));

      component.onCancel();

    // THEN
      expect(emitted).toBeTrue();
    });
  });

  describe('Inputs', () => {
    it('should_display_title_par_default', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.title).toBe('Exporter les données');
    });

    it('should_accepter_title_personnalise', () => {
    // GIVEN
      component.title = 'Export personnalisé';

    // WHEN

    // THEN
      expect(component.title).toBe('Export personnalisé');
    });
  });
});
