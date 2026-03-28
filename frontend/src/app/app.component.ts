/**
 * Fichier : frontend/src/app/app.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant racine du frontend.
 * Il sert de point d'entree a l'interface generale de l'application.
 */

import { Component, OnInit, inject, HostListener } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { filter } from 'rxjs/operators';

import { HeaderComponent } from './components/header/header.component';
import { ToastComponent } from './components/toast/toast.component';
import { FooterComponent } from './components/footer/footer.component';
import { AuthService } from './services/Auth/auth.service';
import { SidebarWidgetComponent } from './components/sidebar-widget/sidebar-widget.component';
import { CalendrierComponent } from './components/calendrier/calendrier.component';
import { InstagramViewComponent } from './components/instagram-view/instagram-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FooterComponent,
    HeaderComponent,
    ToastComponent,
    SidebarWidgetComponent,
    CalendrierComponent,
    InstagramViewComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'frontend';
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showWidgets = true;
  isMobile = false;

  ngOnInit(): void {
    this.authService.init(); 
    this.checkScreenSize();

    this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.urlAfterRedirects || event.url;
      
      const hideOnRoutes = ['/login', '/register', '/verification-lien', '/admin', '/creer', '/edit'];
      
      if (hideOnRoutes.some(route => url.includes(route))) {
        this.showWidgets = false;
      } else {
        this.showWidgets = true;
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 768;
    }
  }
}