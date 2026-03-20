import { Component, Input, OnInit, OnDestroy, inject, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarWidgetService } from '../../services/sidebar-widget.service';
import { Subscription } from 'rxjs';

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
  styleUrls: ['./sidebar-widget.component.css']
})
export class SidebarWidgetComponent implements OnInit, OnDestroy {
  // Injections
  private sidebarWidgetService = inject(SidebarWidgetService);
  private cdr = inject(ChangeDetectorRef);

  //Inputs 
  @Input() title: string = '';
  @Input() icon: string = 'fa-solid fa-widget';
  @Input() position: 'left' | 'right' = 'right';
  @Input() defaultOpen: boolean = false;
  @Input() topOffset: number = 100;
  @Input() smallWidth: number = 320;
  @Input() largeWidth: number = 600;
  
  //States
  isOpen = false;
  isExpanded = false;
  isOtherWidgetOpen = false;
  
  // Unique ID for widgets
  private widgetId = '';
  private subscription: Subscription = new Subscription();

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey() {
    if (this.isOpen) {
      this.toggleWidget();
    }
  }

  get contentHeight(): string {
    return `calc(100vh - ${this.topOffset}px)`;
  }

  get currentWidth(): number {
    return this.isExpanded ? this.largeWidth : this.smallWidth;
  }

  get widthPx(): string {
    return `${this.currentWidth}px`;
  }

  get toggleTransform(): string {
    return this.position === 'right' ? `-${this.currentWidth}px` : `${this.currentWidth}px`;
  }

  ngOnInit() {
    //Id generated based on title and timestamp
    this.widgetId = `widget-${this.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Subscribe to service to manage mutual exclusivity
    this.subscription.add(
      this.sidebarWidgetService.activeWidgetId$.subscribe(activeId => {
        this.isOtherWidgetOpen = activeId !== null && activeId !== this.widgetId;
        
        if (activeId !== this.widgetId && this.isOpen) {
          this.isOpen = false;
        }
        
        // Force change detection since we're in a subscription
        this.cdr.markForCheck();
      })
    );
    
    if (this.defaultOpen) {
      // Small delay to ensure all widgets are initialized before setting active
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

  toggleWidget() {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      this.sidebarWidgetService.setActiveWidget(this.widgetId);
      this.notifyWidgetOpened();
    } else if (this.sidebarWidgetService.getActiveWidgetId() === this.widgetId) {
      this.sidebarWidgetService.setActiveWidget(null);
    }
  }
  
  private notifyWidgetOpened() {
    if (typeof document !== 'undefined') {
      const event = new CustomEvent('widgetOpened', {
        detail: { widgetId: this.widgetId, title: this.title },
        bubbles: true
      });
      document.dispatchEvent(event);
    }
  }

  toggleSize() {
    this.isExpanded = !this.isExpanded;
    
    setTimeout(() => {
      const event = new CustomEvent('widgetResized', { 
        detail: { width: this.currentWidth, isExpanded: this.isExpanded },
        bubbles: true 
      });
      document.dispatchEvent(event);
    }, 350);
  }
}
