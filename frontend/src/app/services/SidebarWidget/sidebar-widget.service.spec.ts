import { TestBed } from '@angular/core/testing';

import { SidebarWidgetService } from './sidebar-widget.service';

describe('SidebarWidgetService', () => {
  let service: SidebarWidgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SidebarWidgetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
