import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Evenement } from '../../models/Evenement/evenement';

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private readonly http = inject(HttpClient);

  getAllEvenements(statut?: string, page: number = 1, limit?: number): Observable<any> {
    let params = `?page=${page}`;
    if (statut && statut !== 'tous') {
      params += `&statut=${statut}`;
    }
    if (limit) {
      params += `&limit=${limit}`;
    }
    return this.http.get<any>(`${environment.apiUrl}/evenements${params}`);
  }

  getEvenementById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${environment.apiUrl}/evenements/${id}`);
  }

  getEvenementDetails(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${environment.apiUrl}/evenements/${id}/details`);
  }

  createEvenement(evenement: Evenement | FormData): Observable<Evenement> {
    return this.http.post<Evenement>(`${environment.apiUrl}/evenements`, evenement);
  }

  updateEvenement(evenement: Evenement | FormData, id: number): Observable<Evenement> {
    return this.http.post<Evenement>(`${environment.apiUrl}/evenements/${id}?_method=PUT`, evenement);
  }

  deleteEvenement(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/evenements/${id}`);
  }
}