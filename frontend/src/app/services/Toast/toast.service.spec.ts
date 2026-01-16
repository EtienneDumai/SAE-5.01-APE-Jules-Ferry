import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { TypeToast } from '../../models/TypeToast/type-toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('toast observable', () => {
    it('should be defined', () => {
      expect(service.toast).toBeDefined();
    });

    it('should initially emit null', (done) => {
      service.toast.subscribe((toast) => {
        expect(toast).toBeNull();
        done();
      });
    });
  });

  describe('show', () => {
    it('should emit a toast with message and default type SUCCESS', (done) => {
      const message = 'Test message';
      
      service.toast.subscribe((toast) => {
        if (toast) {
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.SUCCESS);
          done();
        }
      });

      service.show(message);
    });

    it('should emit a toast with message and type SUCCESS', (done) => {
      const message = 'Success message';
      
      service.toast.subscribe((toast) => {
        if (toast) {
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.SUCCESS);
          done();
        }
      });

      service.show(message, TypeErreurToast.SUCCESS);
    });

    it('should emit a toast with message and type ERROR', (done) => {
      const message = 'Error message';
      
      service.toast.subscribe((toast) => {
        if (toast) {
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.ERROR);
          done();
        }
      });

      service.show(message, TypeErreurToast.ERROR);
    });

    it('should emit a toast with message and type WARNING', (done) => {
      const message = 'Warning message';
      
      service.toast.subscribe((toast) => {
        if (toast) {
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.WARNING);
          done();
        }
      });

      service.show(message, TypeErreurToast.WARNING);
    });

    it('should update toast when show is called multiple times', (done) => {
      const messages: TypeToast[] = [];
      
      service.toast.subscribe((toast) => {
        if (toast) {
          messages.push(toast);
          if (messages.length === 2) {
            expect(messages[0].message).toBe('First message');
            expect(messages[0].type).toBe(TypeErreurToast.SUCCESS);
            expect(messages[1].message).toBe('Second message');
            expect(messages[1].type).toBe(TypeErreurToast.ERROR);
            done();
          }
        }
      });

      service.show('First message', TypeErreurToast.SUCCESS);
      service.show('Second message', TypeErreurToast.ERROR);
    });
  });

  describe('clear', () => {
    it('should emit null when clear is called', (done) => {
      let emissionCount = 0;
      
      service.toast.subscribe((toast) => {
        emissionCount++;
        if (emissionCount === 1) {
          expect(toast).toBeNull();
        } else if (emissionCount === 2) {
          expect(toast?.message).toBe('Test message');
        } else if (emissionCount === 3) {
          expect(toast).toBeNull();
          done();
        }
      });

      service.show('Test message');
      service.clear();
    });

    it('should clear toast after being set', (done) => {
      service.show('Test message', TypeErreurToast.ERROR);
      
      service.toast.subscribe((toast) => {
        if (toast === null) {
          done();
        }
      });

      service.clear();
    });
  });
});
