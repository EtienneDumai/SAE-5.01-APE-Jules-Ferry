/**
 * Fichier : frontend/src/app/services/Inscription/inscription.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Inscription.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription } from '../../models/Inscription/inscription';

@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/inscriptions`;

  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.apiUrl);
  }

  getMesInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/mes-inscriptions`);
  }

  createInscription(data: { id_creneau: number; commentaire?: string | null }): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, data);
  }

  deleteInscription(id_creneau: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id_creneau}`);
  }

  deleteInscriptionAdmin(id_utilisateur: number, id_creneau: number, password: string): Observable<{ message?: string }> {
    const body = { id_utilisateur, id_creneau, password };
    return this.http.delete<{ message?: string }>(`${environment.apiUrl}/admin/inscriptions`, { body });
  }

  createInscriptionAdmin(id_utilisateur: number, id_creneau: number, password: string, commentaire?: string): Observable<{ message?: string }> {
    const body: Record<string, string | number> = { id_utilisateur, id_creneau, password };
    if (commentaire) {
      body['commentaire'] = commentaire;
    }
    return this.http.post<{ message?: string }>(`${environment.apiUrl}/admin/inscriptions`, body);
  }

  updateInscriptionAdmin(id_utilisateur: number, old_id_creneau: number, new_id_creneau: number, password: string): Observable<{ message?: string }> {
    const body = { id_utilisateur, old_id_creneau, new_id_creneau, password };
    return this.http.put<{ message?: string }>(`${environment.apiUrl}/admin/inscriptions`, body);
  }
}