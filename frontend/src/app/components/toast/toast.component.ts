/**
 * Fichier : frontend/src/app/components/toast/toast.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant toast.
 */

import { Component, inject } from '@angular/core';
import {ToastService} from '../../services/Toast/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  toast = toSignal(this.toastService.toast, { initialValue: null });
  close(): void {
    this.toastService.clear();
  }
}
