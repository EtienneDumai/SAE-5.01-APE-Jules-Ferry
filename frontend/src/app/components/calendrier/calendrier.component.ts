/**
 * Fichier : frontend/src/app/components/calendrier/calendrier.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant calendrier.
 */

import { Component, ViewChild, ViewEncapsulation, OnInit, AfterViewInit, OnDestroy, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule, FullCalendarComponent } from "@fullcalendar/angular";
import { CalendarOptions, EventClickArg, CalendarApi } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { EvenementService, PaginatedEvenements } from '../../services/Evenement/evenement.service';
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
export class CalendrierComponent implements OnInit, AfterViewInit, OnDestroy {

  private readonly evenementService = inject(EvenementService);

  @ViewChild('calendar') calendarComponent: FullCalendarComponent | undefined;
  @ViewChild('calendarContainer') calendarContainer: ElementRef | undefined;
  @ViewChild('eventDetails') eventDetails: ElementRef | undefined;

  selectedEvent: Evenement | null = null;
  eventsList: Evenement[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  
  calendarState: 'compact' | 'expanded' = 'compact';
  private isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  private resizeObserver: ResizeObserver | null = null;
  private transitionEndListener: ((e: Event) => void) | null = null;
  private widgetResizeListener: ((e: Event) => void) | null = null;
  
  // Track timeouts to prevent execution on destroyed components
  private resizeTimeouts: (ReturnType<typeof setTimeout>)[] = [];

  private getToolbarConfig() {
    if (this.calendarState === 'compact') {
      return {
        header: { left: 'prev,next', center: 'title', right: '' },
        footer: { left: '', center: '', right: '' }
      };
    } else {
      if (this.isMobile) {
        return {
          header: { left: '', center: 'title', right: '' },
          footer: { left: 'prev,next', center: 'dayGridMonth,dayGridWeek,timeGridDay,listWeek today', right: '' }
        };
      } else {
        return {
          header: { 
            left: 'prev,next today', 
            center: 'title', 
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listMonth' 
          },
          footer: { left: 'prevYear,nextYear', center: '', right: '' }
        };
      }
    }
  }

  private updateToolbar(): void {
    if (!this.calendarComponent) return;
    const api = this.calendarComponent.getApi();
    if (!api) return;

    const config = this.getToolbarConfig();
    api.setOption('headerToolbar', config.header);
    api.setOption('footerToolbar', config.footer);
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    height: 'auto',
    allDaySlot: false,
    slotMinTime: '07:00:00',
    slotMaxTime: '20:00:00',
    views: {
      dayGridMonth: { displayEventTime: false }
    },
    headerToolbar: { left: 'prev,next', center: 'title', right: '' },
    footerToolbar: { left: '', center: '', right: '' },
    weekNumbers: true,
    weekText: '',
    weekends: true,
    eventDisplay: 'block',
    eventColor: '#9ae39cff',
    eventTextColor: '#000000',
    windowResize: (arg) => {
        if(arg && arg.view && arg.view.calendar) {
            this.handleResize(arg.view.calendar);
        }
    },
    eventClick: (arg: EventClickArg) => this.handleEventClick(arg),
    datesSet: () => { this.selectedEvent = null; },
    events: []
  };

  ngOnInit(): void {
    this.loadEvenements();
  }
  
  ngAfterViewInit(): void {
    const t = setTimeout(() => {
      this.setupResizeObserver();
      this.updateToolbar();
      this.forceCalendarResize();
    }, 200);
    this.resizeTimeouts.push(t);
  }
  
  public forceCalendarResize(): void {
    if (!this.calendarComponent) return;
    
    // Safely check and update inside timeouts
    const t1 = setTimeout(() => {
      if (this.calendarComponent) {
          const api = this.calendarComponent.getApi();
          if (api) api.updateSize();
      }
      
      const t2 = setTimeout(() => {
        if (this.calendarComponent) {
            const api = this.calendarComponent.getApi();
            if (api) api.updateSize();
        }
      }, 100);
      this.resizeTimeouts.push(t2);
    }, 50);
    this.resizeTimeouts.push(t1);
  }
  
  private setupResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined' || typeof document === 'undefined') return;
    
    const widgetContent = this.calendarContainer?.nativeElement?.closest('.widget-content');
    
    if (widgetContent) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const width = entry.contentRect.width;
          const newState = width > 600 ? 'expanded' : 'compact';
          
          if (this.calendarState !== newState) {
            this.calendarState = newState;
            this.updateToolbar();
          }
          this.forceCalendarResize();
        }
      });
      this.resizeObserver.observe(widgetContent);
      
      this.transitionEndListener = (e: Event) => {
        if ((e as TransitionEvent).propertyName === 'width') {
          this.forceCalendarResize();
        }
      };
      widgetContent.addEventListener('transitionend', this.transitionEndListener);
    }
    
    this.widgetResizeListener = () => {
      if (widgetContent) {
        const width = widgetContent.getBoundingClientRect().width;
        const newState = width > 600 ? 'expanded' : 'compact';
        if (this.calendarState !== newState) {
          this.calendarState = newState;
          this.updateToolbar();
        }
      }
      this.forceCalendarResize();
    };
    document.addEventListener('widgetResized', this.widgetResizeListener);
  }
  
  ngOnDestroy(): void {
    this.resizeTimeouts.forEach(t => clearTimeout(t));
    this.resizeTimeouts = [];

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    if (this.transitionEndListener && typeof document !== 'undefined') {
      const widgetContent = this.calendarContainer?.nativeElement?.closest('.widget-content');
      if (widgetContent) {
        widgetContent.removeEventListener('transitionend', this.transitionEndListener);
      }
      this.transitionEndListener = null;
    }
    
    if (this.widgetResizeListener && typeof document !== 'undefined') {
      document.removeEventListener('widgetResized', this.widgetResizeListener);
      this.widgetResizeListener = null;
    }
  }
  
  loadEvenements(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.evenementService.getAllEvenements().subscribe({
      next: (response: PaginatedEvenements | Evenement[]) => {
        const evenements = Array.isArray(response) ? response : (response?.data || []);
        this.eventsList = evenements;
        this.calendarOptions.events = evenements.map((event: Evenement) => ({
          id: event.id_evenement.toString(),
          title: event.titre,
          start: this.formatEventDate(event.date_evenement, event.heure_debut),
          end: this.formatEventDate(event.date_evenement, event.heure_fin),
          extendedProps: { lieu: event.lieu }
        }));
        this.isLoading = false;
        
        const t = setTimeout(() => this.forceCalendarResize(), 300);
        this.resizeTimeouts.push(t);
      },
      error: (err) => {
        console.error('Erreur', err);
        this.errorMessage = 'Impossible de charger les événements.';
        this.isLoading = false;
      }
    });
  }

  formatEventDate(date: string | Date, time: string): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    return `${dateObj.toISOString().split('T')[0]}T${time}`;
  }

  isInscriptionOuverte(event: Evenement): boolean {
    if (!event || !event.id_formulaire) return false;
    if (!event.date_evenement) return false;
    const dateEvent = new Date(event.date_evenement);
    const aujourdhui = new Date();
    
    dateEvent.setHours(0, 0, 0, 0);
    aujourdhui.setHours(0, 0, 0, 0);
    
    return aujourdhui.getTime() <= dateEvent.getTime();
  }

  handleEventClick(arg: EventClickArg): void {
    const clickedEvent = this.eventsList.find(e => e.id_evenement.toString() === arg.event.id);
    if (clickedEvent) {
      this.selectedEvent = clickedEvent;
      const t = setTimeout(() => {
        if (this.eventDetails?.nativeElement) {
          this.eventDetails.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      this.resizeTimeouts.push(t);
    }
  }

  closeEventDetails(): void { this.selectedEvent = null; }
  
  expandCalendar(): void { 
    this.calendarState = 'expanded'; 
    this.updateToolbar();
    this.forceCalendarResize();
  }
  
  collapseCalendar(): void { 
    this.calendarState = 'compact'; 
    this.updateToolbar();
    this.forceCalendarResize();
  }
  
  handleResize(calendarApi: CalendarApi): void {
    if (!calendarApi) return;
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;

    if (this.isMobile !== wasMobile) {
      this.updateToolbar();

      if (this.isMobile && (calendarApi.view.type === 'timeGridWeek' || calendarApi.view.type === 'timeGridDay')) {
        calendarApi.changeView('listWeek');
      }
    }
  }
}