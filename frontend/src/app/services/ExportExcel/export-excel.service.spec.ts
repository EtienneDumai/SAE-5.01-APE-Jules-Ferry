import { TestBed } from '@angular/core/testing';
import { ExportExcelService } from './export-excel.service';

describe('ExportExcelService', () => {
  let service: ExportExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExportExcelService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('exportAsExcelFile', () => {
    it('devrait déclencher un téléchargement en créant un lien DOM', () => {
      const mockLink = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(mockLink as HTMLAnchorElement);
      const clickSpy = spyOn(mockLink, 'click');

      const data = [{ Nom: 'Jules', Role: 'admin' }];
      service.exportAsExcelFile(data, 'test_export');

      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(clickSpy).toHaveBeenCalled();
    });

    it('devrait inclure le nom du fichier dans l\'href du lien', () => {
      const mockLink = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(mockLink as HTMLAnchorElement);
      spyOn(mockLink, 'click');

      const fileName = 'mes_comptes';
      service.exportAsExcelFile([{ col: 'val' }], fileName);

      expect(mockLink.download).toContain(fileName);
      expect(mockLink.download).toContain('.xlsx');
    });

    it('devrait fonctionner avec une liste vide sans erreur', () => {
      const mockLink = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(mockLink as HTMLAnchorElement);
      spyOn(mockLink, 'click');

      expect(() => service.exportAsExcelFile([], 'vide')).not.toThrow();
    });

    it('devrait fonctionner avec plusieurs lignes de données', () => {
      const mockLink = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(mockLink as HTMLAnchorElement);
      const clickSpy = spyOn(mockLink, 'click');

      const data = [
        { Nom: 'Alice', Email: 'alice@test.com' },
        { Nom: 'Bob', Email: 'bob@test.com' },
        { Nom: 'Charlie', Email: 'charlie@test.com' },
      ];
      service.exportAsExcelFile(data, 'multi_lignes');

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });
});
