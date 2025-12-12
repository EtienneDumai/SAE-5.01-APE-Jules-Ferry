import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Evennement } from '../../models/Evennement/evennement';
@Injectable({
  providedIn: 'root'
})
export class EvennementService {
  private readonly http = inject(HttpClient);
  constructor() { }
  getAllEvennements(): Observable<Evennement[]> {
    return this.http.get<Evennement[]>(`${environment.apiUrl}/evennements`);
  }
  getEvennementById(id: number): Observable<Evennement> {
    return this.http.get<Evennement>(`${environment.apiUrl}/evennements/${id}`);
  }
  createEvennement(evennement: Evennement): Observable<Evennement> {
    return this.http.post<Evennement>(`${environment.apiUrl}/evennements`, evennement);
  }
  updateEvennement(evennement: Evennement, id: number): Observable<Evennement> {
    return this.http.put<Evennement>(`${environment.apiUrl}/evennements/${id}`, evennement);
  }
  deleteEvennement(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/evennements/${id}`);
  }
}
