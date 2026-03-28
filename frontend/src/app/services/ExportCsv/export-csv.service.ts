/**
 * Fichier : frontend/src/app/services/ExportCsv/export-csv.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service ExportCsv.
 */

import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExportCsvService {
  private readonly document = inject(DOCUMENT);

  exportAsCsvFile(json: unknown[], csvFileName: string): void {
    if (!json || !json.length) {
      return;
    }

    const separator = ';';
    const keys = Object.keys(json[0] as Record<string, unknown>);

    const csvContent = [
      keys.join(separator),
      ...(json as Record<string, unknown>[]).map(row =>
        keys.map(key => {
          let cell = row[key] === null || row[key] === undefined ? '' : String(row[key]);
          cell = cell.replace(/"/g, '""');
          if (cell.includes(separator) || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator)
      )
    ].join('\n');

    this.saveAsCsvFile(csvContent, csvFileName);
  }

  private saveAsCsvFile(csvContent: string, fileName: string): void {
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], {
      type: 'text/csv;charset=utf-8;'
    });

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${day}-${month}-${year}`;

    const finalFileName = `${fileName}_${dateStr}`;
    const downloadLink = this.document.createElement('a');
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.download = `${finalFileName}.csv`;
    downloadLink.click();
    URL.revokeObjectURL(url);
  }
}
