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

  it('should_be_create', () => {
  // GIVEN

  // WHEN

  // THEN
    expect(service).toBeTruthy();
  });

  describe('toast observable', () => {
    it('should_be_defini', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(service.toast).toBeDefined();
    });

    it('should_initialement_emit_null', (done) => {
    // GIVEN

    // WHEN
      service.toast.subscribe((toast) => {

    // THEN
        expect(toast).toBeNull();
        done();
      });
    });
  });

  describe('show', () => {
    it('should_emit_toast_message_type_par_default_success', (done) => {
    // GIVEN
      const message = 'Test message';

    // WHEN
      service.toast.subscribe((toast) => {
        if (toast) {

    // THEN
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.SUCCESS);
          done();
        }
      });

      service.show(message);
    });

    it('should_emit_toast_message_type_success', (done) => {
    // GIVEN
      const message = 'Success message';

    // WHEN
      service.toast.subscribe((toast) => {
        if (toast) {

    // THEN
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.SUCCESS);
          done();
        }
      });

      service.show(message, TypeErreurToast.SUCCESS);
    });

    it('should_emit_toast_message_type_error', (done) => {
    // GIVEN
      const message = 'Error message';

    // WHEN
      service.toast.subscribe((toast) => {
        if (toast) {

    // THEN
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.ERROR);
          done();
        }
      });

      service.show(message, TypeErreurToast.ERROR);
    });

    it('should_delete_automatiquement_toast_bout_3_secondes', () => {
    // GIVEN
      const emissions: (TypeToast | null)[] = [];

    // WHEN
      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.show('Message temporaire', TypeErreurToast.SUCCESS);

    // THEN
      expect(emissions[1]).toEqual({
        message: 'Message temporaire',
        type: TypeErreurToast.SUCCESS
      });

      jasmine.clock().tick(2999);
      expect(emissions.length).toBe(2);

      jasmine.clock().tick(1);
      expect(emissions[2]).toBeNull();
    });

    it('should_emit_toast_message_type_warning', (done) => {
    // GIVEN
      const message = 'Warning message';

    // WHEN
      service.toast.subscribe((toast) => {
        if (toast) {

    // THEN
          expect(toast.message).toBe(message);
          expect(toast.type).toBe(TypeErreurToast.WARNING);
          done();
        }
      });

      service.show(message, TypeErreurToast.WARNING);
    });

    it('should_update_toast_when_show_appele_plusieurs_fois', (done) => {
    // GIVEN
      const messages: TypeToast[] = [];

    // WHEN
      service.toast.subscribe((toast) => {
        if (toast) {

          messages.push(toast);
          if (messages.length === 2) {

    // THEN
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
    it('should_emit_null_when_clear_appele', (done) => {
    // GIVEN
      let emissionCount = 0;

    // WHEN
      service.toast.subscribe((toast) => {
        emissionCount++;
        if (emissionCount === 1) {

    // THEN
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

    it('should_effacer_toast_avoir_ete_defini', (done) => {
    // GIVEN

    // WHEN
      service.show('Test message', TypeErreurToast.ERROR);
      
      let callCount = 0;
      service.toast.subscribe((toast) => {
        callCount++;
        if (toast === null && callCount > 1) {

    // THEN
          expect(toast).toBeNull();
          done();
        }
      });

      service.clear();
    });

    it('should_annule_timeout_cours_lors_clear', () => {
    // GIVEN

    // WHEN
      service.showWithTimeout('Message', TypeErreurToast.SUCCESS, 100);
      service.clear();

      jasmine.clock().tick(100);

      let lastToast: TypeToast | null | undefined;
      service.toast.subscribe(toast => {
        lastToast = toast;
      });

    // THEN
      expect(lastToast).toBeNull();
    });
  });

  describe('showWithTimeout', () => {
    it('should_emit_toast_puis_delete_timeout', () => {
    // GIVEN
      const message = 'Toast temporaire';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100;
      const emissions: (TypeToast | null)[] = [];

    // WHEN
      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.showWithTimeout(message, type, timeout);

    // THEN
      expect(emissions[1]).toEqual({ message, type });

      jasmine.clock().tick(timeout);
      expect(emissions[2]).toBeNull();
    });

    it('should_reinitialiser_timeout_showwithtimeout_rappele', () => {
    // GIVEN
      const message1 = 'Premier toast';
      const message2 = 'Second toast';
      const type = TypeErreurToast.SUCCESS;
      const timeout = 100;
      const emissions: (TypeToast | null)[] = [];

    // WHEN
      service.toast.subscribe((toast) => {
        emissions.push(toast);
      });

      service.showWithTimeout(message1, type, timeout);

    // THEN
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
