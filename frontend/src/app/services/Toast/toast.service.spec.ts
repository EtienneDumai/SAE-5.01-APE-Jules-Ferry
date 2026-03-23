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

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  describe('toast observable', () => {
    it('devrait être défini', () => {
      expect(service.toast).toBeDefined();
    });

    it('devrait initialement émettre null', (done) => {
      service.toast.subscribe((toast) => {
        expect(toast).toBeNull();
        done();
      });
    });
  });

  describe('show', () => {
    it('devrait émettre un toast avec un message et le type par défaut SUCCESS', (done) => {
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

    it('devrait émettre un toast avec un message et le type SUCCESS', (done) => {
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

    it('devrait émettre un toast avec un message et le type ERROR', (done) => {
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

    it('devrait émettre un toast avec un message et le type WARNING', (done) => {
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

    it('devrait mettre à jour le toast quand show est appelé plusieurs fois', (done) => {
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
    it('devrait émettre null quand clear est appelé', (done) => {
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

    it('devrait effacer le toast après avoir été défini', (done) => {
      service.show('Test message', TypeErreurToast.ERROR);
      
      let callCount = 0;
      service.toast.subscribe((toast) => {
        callCount++;
        if (toast === null && callCount > 1) {
          expect(toast).toBeNull();
          done();
        }
      });

      service.clear();
    });
  });

  describe('showWithTimeout', () => {
    it('devrait émettre un toast puis le supprimer après le timeout', (done) => {
      const message = 'Toast temporaire';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100; 
      let step = 0;
      service.toast.subscribe((toast) => {
        if (step === 0) {
          step++;
          return;
        }
        if (step === 1) {
          expect(toast).toEqual({ message, type });
        } else if (step === 2) {
          expect(toast).toBeNull();
          done();
        }
        step++;
      });
      service.showWithTimeout(message, type, timeout);
    });

    it('devrait réinitialiser le timeout si showWithTimeout est rappelé', (done) => {
      const message1 = 'Premier toast';
      const message2 = 'Second toast';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100;
      const emissions: (TypeToast | null)[] = [];
      let step = 0;
      service.toast.subscribe((toast) => {
        // Ignorer la première émission (null initial)
        if (step === 0) {
          step++;
          return;
        }
        emissions.push(toast);
        if (emissions.length === 1) {
          expect(toast).toEqual({ message: message1, type });
          setTimeout(() => {
            service.showWithTimeout(message2, type, timeout);
          }, 50); // avant la fin du premier timeout
        } else if (emissions.length === 2) {
          expect(toast).toEqual({ message: message2, type });
        } else if (emissions.length === 3) {
          expect(toast).toBeNull();
          done();
        }
      });
      service.showWithTimeout(message1, type, timeout);
    });
  });
});