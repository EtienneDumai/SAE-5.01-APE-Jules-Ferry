import { Component, ViewChild, ViewEncapsulation, OnInit, inject } from '@angular/core';
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

@Component({
  selector: 'app-calendrier',
  standalone: true,
  imports: [CommonModule, FullCalendarModule, RouterModule],
  templateUrl: './calendrier.component.html',
  styleUrl: './calendrier.component.css',
  encapsulation: ViewEncapsulation.None
})
export class CalendrierComponent implements OnInit {

  private readonly evenementService = inject(EvenementService);

  @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;
  
  selectedEvent: Evenement | null = null;
  eventsList: Evenement[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    height: 'auto', 
    
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',

    views: {
      dayGridMonth: {
        displayEventTime: false
      }
    },

    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',

    },
    footerToolbar: {
      left:'prevYear,nextYear'
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

    events: []
  };
  
  ngOnInit(): void {
    this.loadEvenements();
  }
  
  loadEvenements(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
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
    }
  }
  
  closeEventDetails(): void {
    this.selectedEvent = null;
  }

  handleResize(calendarApi: any): void {
    if (window.innerWidth < 768) {
      if (calendarApi.view.type === 'timeGridWeek') {
        calendarApi.changeView('listWeek'); 
      }
    } else {
      if (calendarApi.view.type === 'listWeek') {
        calendarApi.changeView('timeGridWeek');
      }
    }
  }
}