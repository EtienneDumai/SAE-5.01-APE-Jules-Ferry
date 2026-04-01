/**
 * Fichier : frontend/src/app/components/calendrier/calendrier.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant calendrier.
 */

import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { CalendrierComponent } from './calendrier.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { CalendarApi } from '@fullcalendar/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { EventClickArg } from '@fullcalendar/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from '../../services/Auth/auth.service';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';

describe('CalendrierComponent', () => {
  let component: CalendrierComponent;
  let fixture: ComponentFixture<CalendrierComponent>;
  let evenementService: jasmine.SpyObj<EvenementService>;
  const currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);

  const mockEvenements: Evenement[] = [
    {
      id_evenement: 1,
      titre: "Réunion d'équipe",
      description: 'Réunion mensuelle',
      date_evenement: new Date('2026-01-15'),
      heure_debut: '10:00',
      heure_fin: '11:00',
      lieu: 'Salle A',
      image_url: 'image1.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
    }
  ];

  beforeEach(async () => {
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', ['getAllEvenements']);
    evenementServiceSpy.getAllEvenements.and.returnValue(of({ data: [], current_page: 1, last_page: 1, total: 0 }));

    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser'], {
      currentUser$: currentUserSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      imports: [CalendrierComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EvenementService, useValue: evenementServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([])
      ],
    }).compileComponents();

    evenementService = TestBed.inject(EvenementService) as jasmine.SpyObj<EvenementService>;
    fixture = TestBed.createComponent(CalendrierComponent);
    component = fixture.componentInstance;
  });

  describe('Initialisation du composant', () => {
    it('should_create', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component).toBeTruthy();
    });

    it('should_initialize_properties_par_default', () => {
    // GIVEN

    // WHEN

    // THEN
      expect(component.selectedEvent).toBeNull();
      expect(component.eventsList).toEqual([]);
      expect(component.isLoading).toBe(true);
      expect(component.calendarState).toBe('compact');
    });

    it('should_load_events_initialisation', fakeAsync(() => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.ngOnInit();

      tick(300); // Wait for loadEvents + resize timeout

    // THEN
      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.eventsList.length).toBe(1);
      expect(component.isLoading).toBe(false);
      
      flush(); // Flush remaining timers
    }));
  });

  describe('Chargement des événements', () => {
    it('should_load_events_success', fakeAsync(() => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.loadEvenements();

      tick(300);

    // THEN
      expect(component.eventsList).toEqual(mockEvenements);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBeNull();
      flush();
    }));

    it('should_handle_errors_lors_chargement', fakeAsync(() => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(throwError(() => new Error('API error')));
      spyOn(console, 'error');

    // WHEN
      component.loadEvenements();

      tick();

    // THEN
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Impossible de charger les événements.');
      expect(component.eventsList.length).toBe(0);
    }));
  });

  describe('Gestion des clics sur événements', () => {
    beforeEach(() => {
        evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));
        component.loadEvenements();
    });

    it('should_select_event_lorsqu_il_est_clique', fakeAsync(() => {
    // GIVEN
      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as unknown as EventClickArg['event'],
      };

    // WHEN
      component.handleEventClick(mockEventClickArg as EventClickArg);

      tick(100);

    // THEN
      expect(component.selectedEvent).toBeTruthy();
      expect(component.selectedEvent?.id_evenement).toBe(1);
      flush();
    }));

    it('should_close_details_evenement', () => {
    // GIVEN
      component.selectedEvent = mockEvenements[0];

    // WHEN
      component.closeEventDetails();

    // THEN
      expect(component.selectedEvent).toBeNull();
    });
  });

  describe('Navigation et État', () => {
    it('should_changer_etat_du_calendrier_et_mettre_a_jour_le_toolbar', () => {
    // GIVEN
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
      } as unknown as CalendarApi;
      component.calendarComponent = {
        getApi: () => mockCalendarApi
      } as unknown as FullCalendarComponent;
  (component as unknown as { isMobile: boolean }).isMobile = false;

    // WHEN
      component.expandCalendar();

    // THEN
      expect(component.calendarState).toBe('expanded');
      expect(mockCalendarApi.setOption).toHaveBeenCalledWith('headerToolbar', jasmine.any(Object));
      
      const headerToolbarCall = (mockCalendarApi.setOption as jasmine.Spy).calls.allArgs().find(arg => arg[0] === 'headerToolbar');
      expect(headerToolbarCall).toBeDefined();
      const headerToolbar = headerToolbarCall![1];
      expect(headerToolbar.right).toContain('dayGridMonth');
      expect(headerToolbar.right).toContain('timeGridWeek');
      expect(headerToolbar.right).toContain('timeGridDay');
      expect(headerToolbar.right).toContain('listMonth');
    });

    it('should_changer_etat_du_calendrier_et_mettre_a_jour_le_toolbar_en_mode_mobile', () => {
    // GIVEN
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
      } as unknown as CalendarApi;
      component.calendarComponent = {
        getApi: () => mockCalendarApi
      } as unknown as FullCalendarComponent;

      // Forcer le mode mobile
      (component as unknown as { isMobile: boolean }).isMobile = true;

    // WHEN
      component.expandCalendar();

    // THEN
      expect(component.calendarState).toBe('expanded');
      const footerToolbarCall = (mockCalendarApi.setOption as jasmine.Spy).calls.allArgs().find(arg => arg[0] === 'footerToolbar');
      expect(footerToolbarCall).toBeDefined();
      const footerToolbar = footerToolbarCall![1];
      expect(footerToolbar.center).toContain('dayGridMonth');
      expect(footerToolbar.center).toContain('dayGridWeek');
      expect(footerToolbar.center).toContain('timeGridDay');
      expect(footerToolbar.center).toContain('listWeek');
      expect(footerToolbar.center).toContain('today');
    });

    it('should_avoir_configuration_compacte_par_default', () => {
    // GIVEN
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
      } as unknown as CalendarApi;
      component.calendarComponent = {
        getApi: () => mockCalendarApi
      } as unknown as FullCalendarComponent;

    // WHEN
      component.collapseCalendar();
      const headerToolbarCall = (mockCalendarApi.setOption as jasmine.Spy).calls.allArgs().find(arg => arg[0] === 'headerToolbar');

    // THEN
      expect(headerToolbarCall).toBeDefined();
      const headerToolbar = headerToolbarCall![1];
      expect(headerToolbar.right).toBe('');
    });
  });

  describe('Gestion du redimensionnement', () => {
    it('should_handle_redimensionnement_fenetre', () => {
    // GIVEN
        // Mock simple window resize logic
        const mockCalendarApi = {
            setOption: jasmine.createSpy('setOption'),
            view: { type: 'dayGridMonth' },
            changeView: jasmine.createSpy('changeView'),
        } as unknown as CalendarApi;

        // Simuler le composant de calendrier pour que updateToolbar puisse fonctionner
        component.calendarComponent = {
          getApi: () => mockCalendarApi
        } as unknown as FullCalendarComponent;

        // Force 'isMobile' state to be mismatched with current window width to ensure update logic triggers
        const currentWindowIsMobile = window.innerWidth < 768;
        (component as unknown as { isMobile: boolean }).isMobile = !currentWindowIsMobile;

    // WHEN
        component.handleResize(mockCalendarApi);

    // THEN
        expect(mockCalendarApi.setOption).toHaveBeenCalled();
    });
 });


  describe('Intégration complète', () => {
    it('should_load_events_display_correctement_calendrier', (done) => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      fixture.detectChanges();

      setTimeout(() => {

    // THEN
        expect(component.eventsList.length).toBe(1);
        expect(component.isLoading).toBe(false);
        expect((component.calendarOptions.events as unknown[]).length).toBe(1);
        done();
      }, 0);
    });

    it('should_handle_flux_user_complet', (done) => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.loadEvenements();

      setTimeout(() => {
        // Agrandir le calendrier

        component.expandCalendar();

    // THEN
        expect(component.calendarState).toBe('expanded');

        // Réduire le calendrier
        component.collapseCalendar();
        expect(component.calendarState).toBe('compact');

        // Cliquer sur un événement
        const mockEventClickArg: Partial<EventClickArg> = {
          event: { id: '1' } as EventClickArg['event'],
        };
        component.handleEventClick(mockEventClickArg as EventClickArg);

        setTimeout(() => {
          expect(component.selectedEvent).toBeTruthy();

          // Fermer les détails
          component.closeEventDetails();
          expect(component.selectedEvent).toBeNull();

          done();
        }, 100);
      }, 0);
    });
  });

  describe('Détails des événements', () => {
    it('should_select_event_clic_display_details', fakeAsync(() => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.loadEvenements();
      tick();

      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

    // THEN
      expect(component.selectedEvent).toBeTruthy();
      expect(component.selectedEvent?.id_evenement).toBe(1);
      expect(component.selectedEvent?.titre).toBe("Réunion d'équipe");

      flush();
    }));

    it('should_permettre_close_details_un_evenement', fakeAsync(() => {
    // GIVEN
      evenementService.getAllEvenements.and.returnValue(of({ data: mockEvenements, current_page: 1, last_page: 1, total: mockEvenements.length }));

    // WHEN
      component.loadEvenements();
      tick();

      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

    // THEN
      expect(component.selectedEvent).toBeTruthy();

      component.closeEventDetails();

      expect(component.selectedEvent).toBeNull();

      flush();
    }));
  });
});
