import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { CalendrierComponent } from './calendrier.component';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { of, throwError } from 'rxjs';
import { CalendarApi } from '@fullcalendar/core';
import { StatutEvenement } from '../../enums/StatutEvenement/statut-evenement';
import { EventClickArg } from '@fullcalendar/core';
import { provideRouter } from '@angular/router';

describe('CalendrierComponent', () => {
  let component: CalendrierComponent;
  let fixture: ComponentFixture<CalendrierComponent>;
  let evenementService: jasmine.SpyObj<EvenementService>;

  // Mock data
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
    },
    {
      id_evenement: 2,
      titre: 'Formation Angular',
      description: 'Atelier de formation',
      date_evenement: new Date('2026-01-20'),
      heure_debut: '14:00',
      heure_fin: '16:00',
      lieu: 'Salle B',
      image_url: 'image2.jpg',
      statut: StatutEvenement.publie,
      id_auteur: 1,
      id_formulaire: null,
    },
  ];

  beforeEach(async () => {
    const evenementServiceSpy = jasmine.createSpyObj('EvenementService', [
      'getAllEvenements',
    ]);

    await TestBed.configureTestingModule({
      imports: [CalendrierComponent],
      providers: [
        { provide: EvenementService, useValue: evenementServiceSpy },
        provideRouter([])
      ],
    }).compileComponents();

    evenementService = TestBed.inject(
      EvenementService
    ) as jasmine.SpyObj<EvenementService>;
    fixture = TestBed.createComponent(CalendrierComponent);
    component = fixture.componentInstance;
  });

  //Test création du composant et initialisation des propriétés
  describe('Initialisation du composant', () => {
    it('devrait créer', () => {
      expect(component).toBeTruthy();
    });

    it('devrait initialiser avec les propriétés par défaut', () => {
      expect(component.selectedEvent).toBeNull();
      expect(component.eventsList).toEqual([]);
      expect(component.isLoading).toBe(true);
      expect(component.errorMessage).toBeNull();
      expect(component.calendarState).toBe('closed');
    });

    it('devrait charger les événements à l\'initialisation', () => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      fixture.detectChanges();

      expect(evenementService.getAllEvenements).toHaveBeenCalled();
      expect(component.eventsList).toEqual(mockEvenements);
      expect(component.isLoading).toBe(false);
    });
  });

  //Tests pour le chargement des événements et gestion des erreurs
  describe('Chargement des événements', () => {
    it('devrait charger les événements avec succès', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();

      setTimeout(() => {
        expect(component.eventsList).toEqual(mockEvenements);
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBeNull();
        done();
      }, 0);
    });

    it('devrait gérer les erreurs lors du chargement des événements', (done) => {
      const error = new Error('API error');
      evenementService.getAllEvenements.and.returnValue(
        throwError(() => error)
      );

      component.loadEvenements();

      setTimeout(() => {
        expect(component.isLoading).toBe(false);
        expect(component.errorMessage).toBe(
          'Impossible de charger les événements.'
        );
        expect(component.eventsList.length).toBe(0);
        done();
      }, 0);
    });

    it('devrait définir isLoading à false après le chargement des événements', () => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.isLoading = true;

      component.loadEvenements();

      expect(component.isLoading).toBe(false);
    });

    it('devrait effacer le message d\'erreur lors du chargement de nouveaux événements', () => {
      component.errorMessage = 'Previous error';
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));

      component.loadEvenements();

      expect(component.errorMessage).toBeNull();
    });

    it('devrait formater correctement les événements du calendrier', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();

      setTimeout(() => {
        const calendarEvents = component.calendarOptions.events as {
          id: string;
          title: string;
          start: string;
          end: string;
          extendedProps: { lieu: string };
        }[];
        expect(calendarEvents.length).toBe(2);
        expect(calendarEvents[0].id).toBe('1');
        expect(calendarEvents[0].title).toBe("Réunion d'équipe");
        expect(calendarEvents[0].start).toContain('2026-01-15T10:00');
        expect(calendarEvents[0].end).toContain('2026-01-15T11:00');
        expect(calendarEvents[0].extendedProps.lieu).toBe('Salle A');
        done();
      }, 0);
    });
  });

  //Tests pour le formatage des dates
  describe('Formatage des dates', () => {
    it('devrait formater correctement la date de l\'événement', () => {
      const date = new Date('2026-01-15');
      const time = '10:30';
      const result = component.formatEventDate(date, time);

      expect(result).toBe('2026-01-15T10:30');
    });

    it('devrait gérer différents formats d\'heure', () => {
      const date = new Date('2026-06-20');
      const time = '23:59';
      const result = component.formatEventDate(date, time);

      expect(result).toBe('2026-06-20T23:59');
    });
  });

  //Tests pour la gestion des clics sur les événements
  describe('Gestion des clics sur événements', () => {
    beforeEach(() => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();
      fixture.detectChanges();
    });

    it('devrait sélectionner un événement lorsqu\'il est cliqué', (done) => {
      const mockEventClickArg: Partial<EventClickArg> = {
        event: {
          id: '1',
        } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

      setTimeout(() => {
        expect(component.selectedEvent).toBeTruthy();
        expect(component.selectedEvent?.id_evenement).toBe(1);
        expect(component.selectedEvent?.titre).toBe("Réunion d'équipe");
        done();
      }, 100);
    });

    it('ne devrait pas sélectionner un événement si l\'ID ne correspond pas', () => {
      const mockEventClickArg: Partial<EventClickArg> = {
        event: {
          id: '999',
        } as EventClickArg['event'],
      };

      component.handleEventClick(mockEventClickArg as EventClickArg);

      expect(component.selectedEvent).toBeNull();
    });

    it('devrait fermer les détails de l\'événement', () => {
      component.selectedEvent = mockEvenements[0];

      component.closeEventDetails();

      expect(component.selectedEvent).toBeNull();
    });
  });

  //Tests pour la gestion de l'état du calendrier
  describe("Gestion de l'état du calendrier", () => {
    it('devrait étendre le calendrier', () => {
      component.calendarState = 'compact';

      component.expandCalendar();

      expect(component.calendarState).toBe('expanded');
    });

    it('devrait réduire le calendrier', () => {
      component.calendarState = 'expanded';

      component.collapseCalendar();

      expect(component.calendarState).toBe('compact');
    });

    it('devrait fermer le calendrier', () => {
      component.calendarState = 'expanded';

      component.closeCalendar();

      expect(component.calendarState).toBe('closed');
    });

    it('devrait ouvrir le calendrier', () => {
      component.calendarState = 'closed';

      component.openCalendar();

      expect(component.calendarState).toBe('expanded');
    });
  });

  //Tests pour la gestion du redimensionnement
  describe('Gestion du redimensionnement', () => {
    it('devrait gérer le redimensionnement de la fenêtre', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: { type: 'dayGridMonth' },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      component['isMobile'] = false;

      component.handleResize(mockCalendarApi);

      expect(component['isMobile']).toBe(false);
    });

    it('devrait mettre à jour headerToolbar lors de la transition du mobile au bureau', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: { type: 'dayGridMonth' },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      component['isMobile'] = true;
      component.handleResize(mockCalendarApi);

      expect(mockCalendarApi.setOption).toHaveBeenCalledWith(
        'headerToolbar',
        jasmine.objectContaining({
          left: jasmine.any(String),
          center: 'title',
          right: jasmine.any(String),
        })
      );
    });

    it('devrait mettre à jour headerToolbar lors de la transition du bureau au mobile', () => {
      const mockCalendarApi = {
        setOption: jasmine.createSpy('setOption'),
        view: {
          type: 'dayGridMonth',
        },
        changeView: jasmine.createSpy('changeView'),
      } as unknown as CalendarApi;

      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      });

      component['isMobile'] = false;
      component.handleResize(mockCalendarApi);

      expect(mockCalendarApi.setOption).toHaveBeenCalledWith(
        'headerToolbar',
        jasmine.objectContaining({
          left: '',
          center: 'title',
          right: '',
        })
      );
    });
  });

  //Tests pour la configuration du calendrier
  describe('Configuration du calendrier', () => {
    it('devrait avoir les bons plugins de calendrier configurés', () => {
      expect(component.calendarOptions.plugins).toBeTruthy();
      expect(
        (component.calendarOptions.locale as { code: string })?.code ||
          component.calendarOptions.locale
      ).toBe('fr');
    });

    it('devrait avoir les bons paramètres de vue initiale', () => {
      expect(component.calendarOptions.initialView).toBe('dayGridMonth');
      expect(component.calendarOptions.weekNumbers).toBe(true);
      expect(component.calendarOptions.weekends).toBe(true);
    });

    it('devrait avoir les bons paramètres de créneaux horaires', () => {
      expect(component.calendarOptions.slotMinTime).toBe('07:00:00');
      expect(component.calendarOptions.slotMaxTime).toBe('20:00:00');
    });

    it('devrait avoir le bon style d\'événement', () => {
      expect(component.calendarOptions.eventColor).toBe('#9ae39cff');
      expect(component.calendarOptions.eventTextColor).toBe('#000000');
    });
  });

  //Tests d'intégration complète
  describe('Intégration complète', () => {
    it('devrait charger les événements et afficher correctement le calendrier', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      fixture.detectChanges();

      setTimeout(() => {
        expect(component.eventsList.length).toBe(2);
        expect(component.isLoading).toBe(false);
        expect((component.calendarOptions.events as unknown[]).length).toBe(2);
        done();
      }, 0);
    });

    it('devrait gérer le flux utilisateur complet', (done) => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();

      setTimeout(() => {
        // Ouvrir le calendrier
        component.openCalendar();
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

  describe('Redirection vers formulaire d\'inscription', () => {
    it('devrait sélectionner un événement au clic', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();
      tick();

      expect(component.eventsList.length).toBe(2);
      
      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };
      component.handleEventClick(mockEventClickArg as EventClickArg);
      
      expect(component.selectedEvent).toBeTruthy();
      expect(component.selectedEvent?.id_evenement).toBe(1);
      expect(component.selectedEvent?.titre).toBe("Réunion d'équipe");
      
      flush();
    }));

    it('devrait permettre de fermer les détails d\'un événement', fakeAsync(() => {
      evenementService.getAllEvenements.and.returnValue(of(mockEvenements));
      component.loadEvenements();
      tick();

      const mockEventClickArg: Partial<EventClickArg> = {
        event: { id: '1' } as EventClickArg['event'],
      };
      component.handleEventClick(mockEventClickArg as EventClickArg);
      
      expect(component.selectedEvent).toBeTruthy();
      
      component.closeEventDetails();
      
      expect(component.selectedEvent).toBeNull();
      
      flush();
    }));
  });
});
