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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('devrait declencher le telechargement d\'un fichier csv', () => {
    const data = [{ Nom: 'Test', Email: 'test@example.com' }];

    service.exportAsCsvFile(data, 'TestFile');

    expect(mockDocument.createElement).toHaveBeenCalledWith('a');
    const mockAnchor = mockDocument.createElement.calls.mostRecent().returnValue;
    expect(mockAnchor.download).toContain('TestFile_');
    expect(mockAnchor.download).toContain('.csv');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });
});
