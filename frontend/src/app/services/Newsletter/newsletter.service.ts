/**
 * Fichier : frontend/src/app/services/Newsletter/newsletter.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Newsletter.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AdminNewsletterSubscription, NewsletterSubscription, NewsletterResponse, NewsletterSubscriber } from '../../models/Newsletter/newsletter.model';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
  private readonly http = inject(HttpClient);
  private readonly subscribeApiUrl = `${environment.apiUrl}/newsletter/subscribe`;
  private readonly unsubscribeApiUrl = `${environment.apiUrl}/newsletter/unsubscribe`;
  private readonly adminApiUrl = `${environment.apiUrl}/newsletters`;

  subscribe(data: NewsletterSubscription): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(this.subscribeApiUrl, data);
  }

  unsubscribe(email: string): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(this.unsubscribeApiUrl, { email });
  }

  getAllSubscribers(): Observable<NewsletterSubscriber[]> {
    return this.http.get<NewsletterSubscriber[]>(this.adminApiUrl);
  }

  addSubscriber(data: AdminNewsletterSubscription): Observable<NewsletterResponse> {
    return this.http.post<NewsletterResponse>(this.adminApiUrl, data);
  }

  deleteSubscriber(id: number, admin_password?: string): Observable<NewsletterResponse> {
    const options = admin_password ? { body: { admin_password } } : {};
    return this.http.delete<NewsletterResponse>(`${this.adminApiUrl}/${id}`, options);
  }
}