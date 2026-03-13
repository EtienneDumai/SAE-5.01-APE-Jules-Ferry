import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SidebarWidgetComponent } from './sidebar-widget.component';

describe('SidebarWidgetComponent', () => {
  let component: SidebarWidgetComponent;
  let fixture: ComponentFixture<SidebarWidgetComponent>;
  let internalComponent: {
    widgetId: string;
    widgetOpenListener: ((e: Event) => void) | null;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarWidgetComponent]
    })
    .compileComponents();
  });

  afterEach(() => {
    fixture?.destroy();
  });

  function createComponent(inputs: Partial<SidebarWidgetComponent> = {}) {
    fixture = TestBed.createComponent(SidebarWidgetComponent);
    component = fixture.componentInstance;
    internalComponent = component as unknown as {
      widgetId: string;
      widgetOpenListener: ((e: Event) => void) | null;
    };

    Object.assign(component, inputs);
    fixture.detectChanges();
  }

  it('Devrait créer le composant avec des valeurs par défaut', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(component.title).toBe('');
    expect(component.icon).toBe('fa-solid fa-widget');
    expect(component.position).toBe('right');
    expect(component.defaultOpen).toBeFalse();
    expect(component.isOpen).toBeFalse();
    expect(component.isExpanded).toBeFalse();
    expect(component.contentHeight).toBe('calc(100vh - 100px)');
    expect(component.currentWidth).toBe(320);
    expect(component.widthPx).toBe('320px');
    expect(component.toggleTransform).toBe('-320px');
  });

  it('Devrait initialiser à partir des entrées et notifier lorsqu\'il est ouvert par défaut', () => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent').and.callThrough();

    createComponent({
      title: 'Calendrier',
      defaultOpen: true,
      topOffset: 140,
      smallWidth: 360,
      largeWidth: 720,
      position: 'left'
    });

    expect(component.isOpen).toBeTrue();
    expect(component.contentHeight).toBe('calc(100vh - 140px)');
    expect(component.currentWidth).toBe(360);
    expect(component.widthPx).toBe('360px');
    expect(component.toggleTransform).toBe('360px');
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    const openedEvent = dispatchEventSpy.calls.mostRecent().args[0] as CustomEvent;
    expect(openedEvent.type).toBe('widgetOpened');
    expect(openedEvent.detail.title).toBe('Calendrier');
    expect(openedEvent.detail.widgetId).toContain('widget-calendrier-');
  });

  it('Devrait fermer quand un autre widget est ouvert', () => {
    createComponent({ title: 'Agenda', defaultOpen: true });

    document.dispatchEvent(new CustomEvent('widgetOpened', {
      detail: { widgetId: 'widget-other', title: 'Other' }
    }));

    expect(component.isOpen).toBeFalse();
  });

  it('Devrait ignorer son propre événement widgetOpened', () => {
    createComponent({ title: 'Agenda', defaultOpen: true });

    document.dispatchEvent(new CustomEvent('widgetOpened', {
      detail: {
        widgetId: internalComponent.widgetId,
        title: component.title
      }
    }));

    expect(component.isOpen).toBeTrue();
  });

  it('Devrait basculer le widget et notifier uniquement lorsqu\'il est ouvert', () => {
    createComponent({ title: 'Notifications' });

    const notifyWidgetOpenedSpy = spyOn<any>(component, 'notifyWidgetOpened').and.callThrough();

    component.toggleWidget();
    expect(component.isOpen).toBeTrue();
    expect(notifyWidgetOpenedSpy).toHaveBeenCalledTimes(1);

    component.toggleWidget();
    expect(component.isOpen).toBeFalse();
    expect(notifyWidgetOpenedSpy).toHaveBeenCalledTimes(1);
  });

  it('Devrait mettre à jour l\'étiquette aria-label du template lorsque le widget est basculé', () => {
    createComponent({ title: 'Raccourcis' });

    const toggleButton = fixture.nativeElement.querySelector('.widget-toggle') as HTMLButtonElement;

    expect(toggleButton.getAttribute('aria-label')).toBe('Ouvrir Raccourcis');

    toggleButton.click();
    fixture.detectChanges();

    expect(toggleButton.getAttribute('aria-label')).toBe('Fermer Raccourcis');
  });

  it('Devrait basculer la taille et dispatcher un événement de redimensionnement après le délai', fakeAsync(() => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent').and.callThrough();
    createComponent({ smallWidth: 300, largeWidth: 640 });

    component.toggleSize();

    expect(component.isExpanded).toBeTrue();
    expect(component.currentWidth).toBe(640);
    expect(dispatchEventSpy).not.toHaveBeenCalled();

    tick(349);
    expect(dispatchEventSpy).not.toHaveBeenCalled();

    tick(1);
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);

    const resizeEvent = dispatchEventSpy.calls.mostRecent().args[0] as CustomEvent;
    expect(resizeEvent.type).toBe('widgetResized');
    expect(resizeEvent.detail).toEqual({ width: 640, isExpanded: true });
  }));

  it('Devrait supprimer l\'écouteur d\'événement du document lors de la destruction', () => {
    const removeEventListenerSpy = spyOn(document, 'removeEventListener').and.callThrough();
    createComponent({ title: 'Aide' });

    fixture.destroy();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('widgetOpened', jasmine.any(Function));
    expect(internalComponent.widgetOpenListener).toBeNull();
  });
});
