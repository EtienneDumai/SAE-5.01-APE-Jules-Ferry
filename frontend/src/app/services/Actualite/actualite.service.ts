/**
 * Fichier : frontend/src/app/services/Actualite/actualite.service.ts
 * Auteur : cf ~/docs/general/participants.md
 * Description : Ce fichier centralise la logique du service Actualite.
 */

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actualite } from '../../models/Actualite/actualite';
import { environment }  from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ActualiteService {
  private readonly http = inject(HttpClient);
  getAllActualites(): Observable<Actualite[]> {
    return this.http.get<Actualite[]>(`${environment.apiUrl}/actualites`);
  }
  getActualiteById(id: number): Observable<Actualite> {
    return this.http.get<Actualite>(`${environment.apiUrl}/actualites/${id}`);
  }
  createActualite(actualite: FormData | Actualite): Observable<Actualite> {
    return this.http.post<Actualite>(`${environment.apiUrl}/actualites`, actualite);
  }
  updateActualite(actualite: FormData | Actualite, id: number): Observable<Actualite> {
    return this.http.put<Actualite>(`${environment.apiUrl}/actualites/${id}`, actualite);
  }
  deleteActualite(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/actualites/${id}`);
  }
}
