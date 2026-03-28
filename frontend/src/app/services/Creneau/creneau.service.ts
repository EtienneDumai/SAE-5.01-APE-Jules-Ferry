/**
 * Fichier : frontend/src/app/services/Creneau/creneau.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Creneau.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Creneau } from '../../models/Creneau/creneau';
@Injectable({
  providedIn: 'root'
})
export class CreneauService {
  private readonly http = inject(HttpClient);
  getAllCreneaux(): Observable<Creneau[]> {
    return this.http.get<Creneau[]>(`${environment.apiUrl}/creneaux`);
  }
  getCreneauById(id: number): Observable<Creneau> {
    return this.http.get<Creneau>(`${environment.apiUrl}/creneaux/${id}`);
  }
  createCreneau(creneau: Creneau): Observable<Creneau> {
    return this.http.post<Creneau>(`${environment.apiUrl}/creneaux`, creneau);
  }
  updateCreneau(creneau: Creneau, id: number): Observable<Creneau> {
    return this.http.put<Creneau>(`${environment.apiUrl}/creneaux/${id}`, creneau);
  }
  deleteCreneau(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/creneaux/${id}`);
  }
  getCreneauxByEventId(eventId: number): Observable<Creneau[]> {
    return this.http.get<Creneau[]>(`${environment.apiUrl}/evenements/${eventId}/creneaux`);
  }
}
