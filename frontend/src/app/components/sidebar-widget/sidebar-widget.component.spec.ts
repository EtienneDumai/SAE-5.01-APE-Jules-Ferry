import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SidebarWidgetComponent } from './sidebar-widget.component';
import { SidebarWidgetService } from '../../services/sidebar-widget.service';
import { ChangeDetectorRef } from '@angular/core';

describe('SidebarWidgetComponent', () => {
  let component: SidebarWidgetComponent;
  let fixture: ComponentFixture<SidebarWidgetComponent>;
  let service: SidebarWidgetService;
  let internalComponent: {
    widgetId: string;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarWidgetComponent],
      providers: [SidebarWidgetService, ChangeDetectorRef]
    })
    .compileComponents();
    
    service = TestBed.inject(SidebarWidgetService);
  });

  afterEach(() => {
    fixture?.destroy();
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

  it('Devrait initialiser à partir des entrées et notifier lorsqu\'il est ouvert par défaut', fakeAsync(() => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent').and.callThrough();
    const setActiveWidgetSpy = spyOn(service, 'setActiveWidget').and.callThrough();

    createComponent({
      title: 'Calendrier',
      defaultOpen: true,
      topOffset: 140,
      smallWidth: 360,
      largeWidth: 720,
      position: 'left'
    });
    
    tick(); // For setTimeout in ngOnInit
    fixture.detectChanges();

    expect(component.isOpen).toBeTrue();
    expect(component.contentHeight).toBe('calc(100vh - 140px)');
    expect(component.currentWidth).toBe(360);
    expect(component.widthPx).toBe('360px');
    expect(component.toggleTransform).toBe('360px');
    expect(setActiveWidgetSpy).toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalled();

    const openedEvent = dispatchEventSpy.calls.all().find(call => call.args[0].type === 'widgetOpened')?.args[0] as CustomEvent;
    expect(openedEvent).toBeTruthy();
    expect(openedEvent.detail.title).toBe('Calendrier');
  }));

  it('Devrait fermer quand un autre widget est ouvert via le service', () => {
    createComponent({ title: 'Agenda', defaultOpen: false });
    component.toggleWidget();
    fixture.detectChanges();
    
    expect(component.isOpen).toBeTrue();

    service.setActiveWidget('widget-other');
    fixture.detectChanges();

    expect(component.isOpen).toBeFalse();
    expect(component.isOtherWidgetOpen).toBeTrue();
  });

  it('Devrait ignorer son propre changement d\'ID dans le service', () => {
    createComponent({ title: 'Agenda', defaultOpen: false });
    component.toggleWidget();
    fixture.detectChanges();
    
    expect(component.isOpen).toBeTrue();

    service.setActiveWidget(internalComponent.widgetId);
    fixture.detectChanges();

    expect(component.isOpen).toBeTrue();
    expect(component.isOtherWidgetOpen).toBeFalse();
  });

  it('Devrait basculer le widget et mettre à jour le service', () => {
    createComponent({ title: 'Notifications' });

    const setActiveWidgetSpy = spyOn(service, 'setActiveWidget').and.callThrough();

    component.toggleWidget();
    expect(component.isOpen).toBeTrue();
    expect(setActiveWidgetSpy).toHaveBeenCalledWith(internalComponent.widgetId);

    component.toggleWidget();
    expect(component.isOpen).toBeFalse();
    expect(setActiveWidgetSpy).toHaveBeenCalledWith(null);
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
    
    tick(350);
    
    const resizeEvent = dispatchEventSpy.calls.all().find(call => call.args[0].type === 'widgetResized')?.args[0] as CustomEvent;
    expect(resizeEvent).toBeTruthy();
    expect(resizeEvent.detail).toEqual({ width: 640, isExpanded: true });
  }));
});
