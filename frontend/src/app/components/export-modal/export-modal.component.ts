/**
 * Fichier : frontend/src/app/components/export-modal/export-modal.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant export modal.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export-modal.component.html',
  styleUrl: './export-modal.component.css'
})
export class ExportModalComponent {
  @Input() title = 'Exporter les données';
  @Input() availableColumns: { key: string; label: string; selected: boolean }[] = [];
  @Output() confirm = new EventEmitter<string[]>();
  @Output() closeModal = new EventEmitter<void>();

  onCancel() {
    this.closeModal.emit();
  }

  onConfirm() {
    const selectedKeys = this.availableColumns
      .filter(col => col.selected)
      .map(col => col.key);
    this.confirm.emit(selectedKeys);
  }

  selectAll() {
    this.availableColumns.forEach(col => col.selected = true);
  }

  deselectAll() {
    this.availableColumns.forEach(col => col.selected = false);
  }
}
