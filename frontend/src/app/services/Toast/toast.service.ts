/**
 * Fichier : frontend/src/app/services/Toast/toast.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Toast.
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import {TypeToast} from '../../models/TypeToast/type-toast';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private static readonly DEFAULT_TIMEOUT = 3000;

  private toastSubject = new BehaviorSubject<TypeToast | null>(null);
  toast = this.toastSubject.asObservable();

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: TypeErreurToast = TypeErreurToast.SUCCESS): void {
    this.showWithTimeout(message, type);
  }

  clear(): void {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
      this.toastTimeout = null;
    }
    this.toastSubject.next(null);
  }

  showWithTimeout(
    message: string,
    type: TypeErreurToast = TypeErreurToast.SUCCESS,
    timeout = ToastService.DEFAULT_TIMEOUT
  ): void {
    this.toastSubject.next({message, type});
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.clear();
    }, timeout);
  }
}
