import { Component, ViewChild, ViewEncapsulation, OnInit, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule, FullCalendarComponent } from "@fullcalendar/angular"; 
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { EvenementService } from '../../services/Evenement/evenement.service';
import { Evenement } from '../../models/Evenement/evenement';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterModule, SpinnerComponent],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CalendrierComponent implements OnInit {

  private readonly evenementService = inject(EvenementService);

  //Références aux éléments du template
  @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;
  @ViewChild('calendarContainer') calendarContainer: ElementRef | undefined;
  @ViewChild('eventDetails') eventDetails: ElementRef | undefined;
  
  selectedEvent: Evenement | null = null;
  eventsList: Evenement[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  
  calendarState: 'compact' | 'expanded' | 'closed' = 'closed';
  
  // Détection du mode mobile selon la largeur de la fenêtre
  private isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  //Fonction privée 
  private scrollToCalendar(){
      setTimeout(() => {
      this.calendarContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }
  private scrollToEvent(){
      setTimeout(() => {
        this.eventDetails?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  }

  
  // Options du calendrier
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView:'dayGridMonth',
    locale: frLocale,
    height: 'auto',
    allDaySlot: false,
    
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',

    views: {
      dayGridMonth: {
        displayEventTime: false
      }
    },

    headerToolbar: this.isMobile 
      ? {
          left: '',
          center: 'title',
          right: ''
        }
      : {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
        },
    footerToolbar: this.isMobile 
      ? {
          left: 'prev,next',
          center: 'listWeek,dayGridMonth,timeGridDay today',
          right: ''
        }
      : {
          left: 'prevYear,nextYear'
        },
    
    weekNumbers: true,
    weekText: '',
    weekends: true,
    eventDisplay: 'block',
    eventColor: '#9ae39cff',
    eventTextColor: '#000000',
    
    windowResize: (arg) => {
      this.handleResize(arg.view.calendar);
    },
    
    eventClick: (arg: EventClickArg) => {
      this.handleEventClick(arg);
    },

    datesSet: () => {
      this.selectedEvent = null;
      this.scrollToCalendar();
    },

    events: []
  };
  
  ngOnInit(): void {
    this.loadEvenements();
  }
  
  loadEvenements(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    // Récupération des événements depuis le service
    this.evenementService.getAllEvenements().subscribe({
      next: (evenements) => {
        this.eventsList = evenements;
        this.calendarOptions.events = evenements.map(event => ({
          id: event.id_evenement.toString(),
          title: event.titre,
          start: this.formatEventDate(event.date_evenement, event.heure_debut),
          end: this.formatEventDate(event.date_evenement, event.heure_fin),
          extendedProps: {
            lieu: event.lieu
          }
        }));
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur', err);
        this.errorMessage = 'Impossible de charger les événements.';
        this.isLoading = false;
      }
    });
  }
  
  formatEventDate(date: Date, time: string): string {
    const dateStr = new Date(date).toISOString().split('T')[0];
    return `${dateStr}T${time}`;
  }
  
  handleEventClick(arg: EventClickArg): void {
    const clickedEvent = this.eventsList.find(e => e.id_evenement.toString() === arg.event.id);
    if (clickedEvent) {
      this.selectedEvent = clickedEvent;
      this.scrollToEvent();
    }
  }
  
  closeEventDetails(): void {
    this.selectedEvent = null;
    setTimeout(() => {
      this.calendarContainer?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  expandCalendar(): void {
    this.calendarState = 'expanded';
  }

  collapseCalendar(): void {
    this.calendarState = 'compact';
  }

  closeCalendar(): void {
    this.calendarState = 'closed';
  }

  openCalendar(): void {
    this.calendarState = 'expanded';
  }

  // Gestion du redimensionnement de la fenêtre
  handleResize(calendarApi: any): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    if (this.isMobile !== wasMobile) {
      calendarApi.setOption('headerToolbar', this.isMobile 
        ? {
            left: '',
            center: 'title',
            right: ''
          }
        : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          });
      
      calendarApi.setOption('footerToolbar', this.isMobile 
        ? {
            left: 'prev,next',
            center: 'listWeek,dayGridMonth',
            right: ''
          }
        : {
            left: 'prevYear,nextYear'
          });
      
      if (this.isMobile) {
        if (calendarApi.view.type === 'timeGridWeek' || calendarApi.view.type === 'timeGridDay') {
          calendarApi.changeView('listWeek');
        }
      }
    }
  }
}