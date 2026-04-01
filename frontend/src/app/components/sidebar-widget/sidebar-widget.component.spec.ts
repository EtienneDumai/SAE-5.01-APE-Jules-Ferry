/**
 * Fichier : frontend/src/app/components/sidebar-widget/sidebar-widget.component.spec.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier teste le composant sidebar widget.
 */

import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SidebarWidgetComponent } from './sidebar-widget.component';
import { SidebarWidgetService } from '../../services/SidebarWidget/sidebar-widget.service';

describe('SidebarWidgetComponent', () => {
  let component: SidebarWidgetComponent;
  let fixture: ComponentFixture<SidebarWidgetComponent>;
  let service: SidebarWidgetService;
  let originalInnerWidth: number;
  let internalComponent: {
    widgetId: string;
  };

  beforeEach(async () => {
    originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1024,
    });

    await TestBed.configureTestingModule({
      imports: [SidebarWidgetComponent],
      providers: [SidebarWidgetService, provideRouter([])],
    }).compileComponents();

    service = TestBed.inject(SidebarWidgetService);
  });

  afterEach(() => {
    fixture?.destroy();
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
  });

  function createComponent(inputs: Partial<SidebarWidgetComponent> = {}) {
    fixture = TestBed.createComponent(SidebarWidgetComponent);
    component = fixture.componentInstance;
    internalComponent = component as unknown as {
      widgetId: string;
    };

    Object.assign(component, inputs);
    fixture.detectChanges();
  }

  it('should_create_component_with_default_values', () => {
  // GIVEN
    createComponent();

  // WHEN

  // THEN
    expect(component).toBeTruthy();
    expect(component.title).toBe('');
    expect(component.icon).toBe('fa-solid fa-widget');
    expect(component.position).toBe('right');
    expect(component.defaultOpen).toBeFalse();
    expect(component.isOpen).toBeFalse();
    expect(component.isExpanded).toBeFalse();
    // CORRIGÉ : La formule est topOffset (100) + 40 = 140
    expect(component.contentHeight).toBe('calc(100vh - 140px)');
    // CORRIGÉ : La nouvelle largeur par défaut est 380
    expect(component.currentWidth).toBe(380);
    expect(component.widthPx).toBe('380px');
    expect(component.toggleTransform).toBe('-380px');
  });

  it('should_initialize_component_from_inputs', fakeAsync(() => {
    // GIVEN
    const setActiveWidgetSpy = spyOn(
      service,
      'setActiveWidget',
    ).and.callThrough();

    createComponent({
      title: 'Calendrier',
      defaultOpen: true,
      topOffset: 140,
      smallWidth: 360,
      largeWidth: 720,
      position: 'left',
    });

    // WHEN
    tick(); // Pour le setTimeout dans ngOnInit

    fixture.detectChanges();

    // THEN
    expect(component.isOpen).toBeTrue();
    // CORRIGÉ : 140 + 40 = 180
    expect(component.contentHeight).toBe('calc(100vh - 180px)');
    expect(component.currentWidth).toBe(360);
    expect(component.widthPx).toBe('360px');
    expect(component.toggleTransform).toBe('360px');
    expect(setActiveWidgetSpy).toHaveBeenCalled();
  }));

  it('should_close_when_another_widget_is_opened_from_service', () => {
    // GIVEN
    createComponent({ title: 'Agenda', defaultOpen: false });

    // WHEN
    component.toggleWidget();

    fixture.detectChanges();

    // THEN
    expect(component.isOpen).toBeTrue();

    service.setActiveWidget('widget-other');
    fixture.detectChanges();

    expect(component.isOpen).toBeFalse();
    expect(component.isOtherWidgetOpen).toBeTrue();
  });

  it('should_ignore_its_own_service_widget_id', () => {
    // GIVEN
    createComponent({ title: 'Agenda', defaultOpen: false });

    // WHEN
    component.toggleWidget();

    fixture.detectChanges();

    // THEN
    expect(component.isOpen).toBeTrue();

    service.setActiveWidget(internalComponent.widgetId);
    fixture.detectChanges();

    expect(component.isOpen).toBeTrue();
    expect(component.isOtherWidgetOpen).toBeFalse();
  });

  it('should_toggle_widget_and_update_service_state', () => {
    // GIVEN
    createComponent({ title: 'Notifications' });

    const setActiveWidgetSpy = spyOn(
      service,
      'setActiveWidget',
    ).and.callThrough();

    // WHEN
    component.toggleWidget();

    // THEN
    expect(component.isOpen).toBeTrue();
    expect(setActiveWidgetSpy).toHaveBeenCalledWith(internalComponent.widgetId);

    component.toggleWidget();

    expect(component.isOpen).toBeFalse();
    expect(setActiveWidgetSpy).toHaveBeenCalledWith(null);
  });

  it('should_toggle_size_and_dispatch_resize_event_after_delay', fakeAsync(() => {
    // GIVEN
    const dispatchEventSpy = spyOn(document, 'dispatchEvent').and.callThrough();
    createComponent({ smallWidth: 300, largeWidth: 640 });

    // WHEN
    component.toggleSize();

    // THEN
    expect(component.isExpanded).toBeTrue();
    expect(component.currentWidth).toBe(640);

    tick(350);

    const resizeEvent = dispatchEventSpy.calls
      .all()
      .find((call) => call.args[0].type === 'widgetResized')
      ?.args[0] as CustomEvent;
    expect(resizeEvent).toBeTruthy();
    expect(resizeEvent.detail).toEqual({ width: 640, isExpanded: true });
  }));

  it('should_close_widget_when_escape_key_is_pressed', () => {
    // GIVEN
    createComponent({ title: 'Agenda' });

    // WHEN
    component.toggleWidget();

    component.onEscapeKey();

    // THEN
    expect(component.isOpen).toBeFalse();
  });

  it('should_return_full_width_mobile_screen', () => {
    // GIVEN
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 600,
    });

    createComponent();

    // WHEN

    // THEN
    expect(component.widthPx).toBe('100%');
  });

  it('should_stop_event_propagation_in_toggle_methods', fakeAsync(() => {
    // GIVEN
    createComponent();
    const event = jasmine.createSpyObj<Event>('Event', ['stopPropagation']);

    // WHEN
    component.toggleWidget(event);
    component.toggleSize(event);

    tick(350);

    // THEN
    expect(event.stopPropagation).toHaveBeenCalledTimes(2);
  }));

  it('should_clear_service_state_destroy_when_widget_is_open', () => {
    // GIVEN
    createComponent({ title: 'Agenda' });
    const setActiveWidgetSpy = spyOn(service, 'setActiveWidget').and.callThrough();

    // WHEN
    component.toggleWidget();

    component.ngOnDestroy();

    // THEN
    expect(setActiveWidgetSpy).toHaveBeenCalledWith(null);
  });
});
