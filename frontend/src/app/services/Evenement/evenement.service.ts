import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Evenement } from '../../models/Evenement/evenement';

export interface PaginatedEvenements {
  data: Evenement[];
  current_page: number;
  last_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  private readonly http = inject(HttpClient);

  getAllEvenements(statut?: string, page = 1, limit?: number): Observable<PaginatedEvenements> {
    let params = `?page=${page}`;
    if (statut && statut !== 'tous') {
      params += `&statut=${statut}`;
    }
    if (limit) {
      params += `&limit=${limit}`;
    }
    return this.http.get<PaginatedEvenements>(`${environment.apiUrl}/evenements${params}`);
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

  deleteEvenement(id: number, adminPassword?: string): Observable<{ message: string }> {
    const options = adminPassword ? { body: { admin_password: adminPassword } } : {};
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/evenements/${id}`, options);
  }
}