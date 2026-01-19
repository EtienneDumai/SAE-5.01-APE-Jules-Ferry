import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { NewsletterSubscription, NewsletterResponse } from '../../models/Newsletter/newsletter.model';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/newsletter/subscribe`;

  subscribe(data: NewsletterSubscription): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(this.apiUrl, data);
  }
}