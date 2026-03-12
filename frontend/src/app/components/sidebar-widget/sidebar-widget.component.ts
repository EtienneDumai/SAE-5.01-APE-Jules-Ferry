import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  //Inputs 
  @Input() title: string = '';
  @Input() icon: string = 'fa-solid fa-widget';
  @Input() position: 'left' | 'right' = 'right';
  @Input() defaultOpen: boolean = false;
  @Input() topOffset: number = 100;
  @Input() smallWidth: number = 320;
  @Input() largeWidth: number = 600;
  
  //States
  isOpen: boolean = false;
  isExpanded: boolean = false;
  
  // Unique ID for widgets
  private widgetId: string = '';
  private widgetOpenListener: ((e: Event) => void) | null = null;

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
    
    this.isOpen = this.defaultOpen;
    
    this.widgetOpenListener = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail.widgetId !== this.widgetId && this.isOpen) {
        this.isOpen = false;
      }
    };
    
    if (typeof document !== 'undefined') {
      document.addEventListener('widgetOpened', this.widgetOpenListener);
    }
    
    if (this.isOpen) {
      this.notifyWidgetOpened();
    }
  }
  
  ngOnDestroy() {
    //clean
    if (this.widgetOpenListener && typeof document !== 'undefined') {
      document.removeEventListener('widgetOpened', this.widgetOpenListener);
      this.widgetOpenListener = null;
    }
  }

  toggleWidget() {
    this.isOpen = !this.isOpen;
      if (this.isOpen) {
      this.notifyWidgetOpened();
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
