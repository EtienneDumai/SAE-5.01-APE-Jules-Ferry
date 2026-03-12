import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportExcelService {

  exportAsExcelFile(json: unknown[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: ArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: BlobPart, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    let finalFileName = '';
    if (fileName === 'Comptes_Utilisateurs') {
      finalFileName = `${fileName}_${dateStr}`;
    } else {
      finalFileName = `${fileName}_${dateStr}`;
    }

    const downloadLink = document.createElement('a');
    downloadLink.href = window.URL.createObjectURL(data);
    downloadLink.download = `${finalFileName}.xlsx`;
    downloadLink.click();
  }
}
