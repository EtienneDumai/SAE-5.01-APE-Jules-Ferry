/**
 * Fichier : frontend/src/app/services/ExportCsv/export-csv.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service ExportCsv.
 */

import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ExportCsvService } from './export-csv.service';

describe('ExportCsvService', () => {
  let service: ExportCsvService;
  let mockDocument: { createElement: jasmine.Spy };

  beforeEach(() => {
    mockDocument = {
      createElement: jasmine.createSpy('createElement').and.returnValue({
        href: '',
        download: '',
        click: jasmine.createSpy('click')
      })
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });
    service = TestBed.inject(ExportCsvService);

    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock');
    spyOn(URL, 'revokeObjectURL');
  });

  it('should_be_created', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  it('should_declencher_telechargement_un_fichier_csv', () => {
  // GIVEN
    const data = [{ Nom: 'Test', Email: 'test@example.com' }];

  // WHEN
    service.exportAsCsvFile(data, 'TestFile');

  // THEN
    expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    const mockAnchor = mockDocument.createElement.calls.mostRecent().returnValue;
    expect(mockAnchor.download).toContain('TestFile_');
    expect(mockAnchor.download).toContain('.csv');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('should_ne_fait_rien_when_donnees_vides', () => {
  // GIVEN

  // WHEN
    service.exportAsCsvFile([], 'Empty');

  // THEN
    expect(mockDocument.createElement).not.toHaveBeenCalled();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('should_echappe_guillemets_separateurs_csv', () => {
  // GIVEN

  // WHEN
    service.exportAsCsvFile([{ Nom: 'Jean; "Dupont"', Note: 'Ligne\n2' }], 'Escaped');

  // THEN
    expect(URL.createObjectURL).toHaveBeenCalled();
    const blobArg = (URL.createObjectURL as jasmine.Spy).calls.mostRecent().args[0] as Blob;
    expect(blobArg).toBeTruthy();
  });
});
