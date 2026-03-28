/**
 * Fichier : frontend/src/app/components/instagram-view/instagram-view.component.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier porte la logique du composant instagram view.
 */

import { Component, AfterViewInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface InstagramEmbeds {
  process(): void;
}

declare global {
  interface Window {
    instgrm?: {
      Embeds: InstagramEmbeds;
    };
  }
}

@Component({
  selector: 'app-instagram-view',
  standalone: true,
  imports: [],
  templateUrl: './instagram-view.component.html',
  styleUrls: ['./instagram-view.component.css']
})
export class InstagramViewComponent implements AfterViewInit {
  private readonly INSTAGRAM_SCRIPT_ID = 'instagram-embed-script';
  private readonly INSTAGRAM_SCRIPT_URL = 'https://www.instagram.com/embed.js';
  
  //Injections 
  private readonly platformId = inject(PLATFORM_ID);

  
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadInstagramScript();
    }
  }

  private loadInstagramScript(): void {
    const existingScript = document.getElementById(this.INSTAGRAM_SCRIPT_ID);
    
    if (existingScript) {
      this.processInstagramEmbeds();
      return;
    }

    this.createAndLoadScript();
  }

  private createAndLoadScript(): void {
    const script = document.createElement('script');
    script.id = this.INSTAGRAM_SCRIPT_ID;
    script.src = this.INSTAGRAM_SCRIPT_URL;
    script.async = true;
    script.onload = () => this.processInstagramEmbeds();
    document.body.appendChild(script);
  }

  private processInstagramEmbeds(): void {
    if (window.instgrm?.Embeds) {
      window.instgrm.Embeds.process();
    }
  }
}
