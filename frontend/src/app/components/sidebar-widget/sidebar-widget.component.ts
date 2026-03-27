/**
 * Fichier : frontend/src/app/components/sidebar-widget/sidebar-widget.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant sidebar widget.
 */

import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarWidgetService } from '../../services/SidebarWidget/sidebar-widget.service';
import { Subscription } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Widget component to display content in a collapsible sidebar on the right or left of the screen.
 * 
 * Inputs : 
 * - title : string - Title of the widget
 * - icon : string - FontAwesome class for the toggle button icon
 * - position : 'left' | 'right' - Position of the widget
 * - defaultOpen : boolean - Whether the widget is open by default
 * - topOffset : number - Top offset of the widget
 * - smallWidth : number - Small width of the widget
 * - largeWidth : number - Large width of the widget
 * 
 * Toggle between two fixed sizes with a button.
 * 
 */

@Component({
  selector: 'app-sidebar-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar-widget.component.html',
})
export class SidebarWidgetComponent implements OnInit, OnDestroy {
  // Injections
  private sidebarWidgetService = inject(SidebarWidgetService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  //Inputs 
  @Input() title = '';
  @Input() icon = 'fa-solid fa-widget';
  @Input() position: 'left' | 'right' = 'right';
  @Input() defaultOpen = false;
  @Input() topOffset = 100;
  @Input() smallWidth = 380;
  @Input() largeWidth = 600;
  
  //States
  isOpen = false;
  isExpanded = false;
  isOtherWidgetOpen = false;
  
  // Unique ID for widgets
  private widgetId = '';
  private subscription: Subscription = new Subscription();

  @HostListener('document:keydown.escape')
onEscapeKey() {
  if (this.isOpen) {
    this.toggleWidget();
  }
}

  get contentHeight(): string {
    return `calc(100vh - ${this.topOffset + 40}px)`;
  }

  get currentWidth(): number {
    return this.isExpanded ? this.largeWidth : this.smallWidth;
  }

  get widthPx(): string {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return '100%'; 
    }
    return `${this.currentWidth}px`;
  }

  get toggleTransform(): string {
    return this.position === 'right' ? `-${this.currentWidth}px` : `${this.currentWidth}px`;
  }

  ngOnInit() {
    this.widgetId = `widget-${this.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    this.subscription.add(
      this.sidebarWidgetService.activeWidgetId$.subscribe(activeId => {
        this.isOtherWidgetOpen = activeId !== null && activeId !== this.widgetId;
        if (activeId !== this.widgetId && this.isOpen) {
          this.isOpen = false;
        }
        this.cdr.markForCheck();
      })
    );

    this.subscription.add(
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        if (this.isOpen) {
          this.isOpen = false;
          this.sidebarWidgetService.setActiveWidget(null);
          this.cdr.markForCheck();
        }
      })
    );
    
    if (this.defaultOpen) {
      setTimeout(() => {
        this.toggleWidget();
      }, 0);
    }
  }
  
  ngOnDestroy() {
    this.subscription.unsubscribe();
    if (this.isOpen) {
      this.sidebarWidgetService.setActiveWidget(null);
    }
  }

  toggleWidget(event?: Event) {
    if (event) event.stopPropagation();
    
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.sidebarWidgetService.setActiveWidget(this.widgetId);
    } else if (this.sidebarWidgetService.getActiveWidgetId() === this.widgetId) {
      this.sidebarWidgetService.setActiveWidget(null);
    }
  }

  toggleSize(event?: Event) {
    if (event) event.stopPropagation();
    this.isExpanded = !this.isExpanded;
    
    setTimeout(() => {
      if (typeof document !== 'undefined') {
        const customEvent = new CustomEvent('widgetResized', { 
          detail: { width: this.currentWidth, isExpanded: this.isExpanded },
          bubbles: true 
        });
        document.dispatchEvent(customEvent);
      }
    }, 350);
  }
}
