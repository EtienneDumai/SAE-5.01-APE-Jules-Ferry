import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Evenement } from '../../models/Evenement/evenement';

@Injectable({
  providedIn: 'root'
})
export class EvennementService {
  private readonly http = inject(HttpClient);
  getAllEvennements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${environment.apiUrl}/evenements`);
  }
  getEvennementById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${environment.apiUrl}/evenements/${id}`);
  }
  createEvennement(evennement: Evenement): Observable<Evenement> {
    return this.http.post<Evenement>(`${environment.apiUrl}/evenements`, evennement);
  }
  updateEvennement(evennement: Evenement, id: number): Observable<Evenement> {
    return this.http.put<Evenement>(`${environment.apiUrl}/evenements/${id}`, evennement);
  }
  deleteEvennement(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/evenements/${id}`);
  }
}
