
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import {TypeToast} from '../../models/TypeToast/type-toast';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<TypeToast | null>(null);
  toast = this.toastSubject.asObservable();
  show(message: string, type: TypeErreurToast = TypeErreurToast.SUCCESS): void {
    this.toastSubject.next({message, type});
  }
  clear(): void {
    this.toastSubject.next(null);
  }

  private toastTimeout: ReturnType<typeof setTimeout> | null = null;
  showWithTimeout(message: string, type: TypeErreurToast = TypeErreurToast.SUCCESS, timeout = 5000): void {
    this.toastSubject.next({message, type});
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = setTimeout(() => {
      this.clear();
    }, timeout);
  }
}
