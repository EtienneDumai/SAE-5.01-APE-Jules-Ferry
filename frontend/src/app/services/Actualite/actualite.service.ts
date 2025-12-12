import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Actualite } from '../../models/Actualite/actualite';
import { environment }  from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class ActualiteService {
  private readonly http = inject(HttpClient);
  constructor() { }
  getAllActualites(): Observable<Actualite[]> {
    return this.http.get<Actualite[]>(`${environment.apiUrl}/actualites`);
  }
  getActualiteById(id: number): Observable<Actualite> {
    return this.http.get<Actualite>(`${environment.apiUrl}/actualites/${id}`);
  }
  createActualite(actualite: Actualite): Observable<Actualite> {
    return this.http.post<Actualite>(`${environment.apiUrl}/actualites`, actualite);
  }
  updateActualite(actualite: Actualite, id: number): Observable<Actualite> {
    return this.http.put<Actualite>(`${environment.apiUrl}/actualites/${id}`, actualite);
  }
  deleteActualite(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/actualites/${id}`);
  }
}
