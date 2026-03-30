/**
 * Fichier : frontend/src/app/services/Toast/toast.service.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le service Toast.
 */

import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { TypeErreurToast } from '../../enums/TypeErreurToast/type-erreur-toast';
import { TypeToast } from '../../models/TypeToast/type-toast';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    jasmine.clock().install();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
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

    it('devrait supprimer automatiquement le toast au bout de 3 secondes', () => {
      const emissions: (TypeToast | null)[] = [];

      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.show('Message temporaire', TypeErreurToast.SUCCESS);

      expect(emissions[1]).toEqual({
        message: 'Message temporaire',
        type: TypeErreurToast.SUCCESS
      });

      jasmine.clock().tick(2999);
      expect(emissions.length).toBe(2);

      jasmine.clock().tick(1);
      expect(emissions[2]).toBeNull();
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
    it('devrait émettre un toast puis le supprimer après le timeout', () => {
      const message = 'Toast temporaire';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100;
      const emissions: (TypeToast | null)[] = [];

      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.showWithTimeout(message, type, timeout);

      expect(emissions[1]).toEqual({ message, type });

      jasmine.clock().tick(timeout);
      expect(emissions[2]).toBeNull();
    });

    it('devrait réinitialiser le timeout si showWithTimeout est rappelé', () => {
      const message1 = 'Premier toast';
      const message2 = 'Second toast';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100;
      const emissions: (TypeToast | null)[] = [];

      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.showWithTimeout(message1, type, timeout);

      expect(emissions[1]).toEqual({ message: message1, type });

      jasmine.clock().tick(50);
      service.showWithTimeout(message2, type, timeout);
      expect(emissions[2]).toEqual({ message: message2, type });

      jasmine.clock().tick(99);
      expect(emissions.length).toBe(3);

      jasmine.clock().tick(1);
      expect(emissions[3]).toBeNull();
    });
  });
});
