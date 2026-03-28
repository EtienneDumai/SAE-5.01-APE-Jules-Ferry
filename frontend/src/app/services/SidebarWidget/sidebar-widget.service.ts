/**
 * Fichier : frontend/src/app/services/SidebarWidget/sidebar-widget.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service SidebarWidget.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarWidgetService {
  private activeWidgetId = new BehaviorSubject<string | null>(null);
  activeWidgetId$ = this.activeWidgetId.asObservable();

  /**
   * Set the currently active widget ID.
   * Pass null to indicate no widget is open.
   */
  setActiveWidget(id: string | null) {
    this.activeWidgetId.next(id);
  }

  /**
   * Get the current active widget ID.
   */
  getActiveWidgetId(): string | null {
    return this.activeWidgetId.getValue();
  }
}
