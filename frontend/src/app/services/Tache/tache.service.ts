import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Tache } from '../../models/Tache/tache';
@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private readonly http = inject(HttpClient);
  constructor() { }
  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${environment.apiUrl}/taches`);
  }
  getTacheById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${environment.apiUrl}/taches/${id}`);
  }
  createTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${environment.apiUrl}/taches`, tache);
  }
  updateTache(tache: Tache, id: number): Observable<Tache> {
    return this.http.put<Tache>(`${environment.apiUrl}/taches/${id}`, tache);
  }
  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/taches/${id}`);
  }
}
