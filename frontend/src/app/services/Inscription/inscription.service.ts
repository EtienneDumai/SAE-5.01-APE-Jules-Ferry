import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Inscription } from '../../models/Inscription/inscription';
@Injectable({
  providedIn: 'root'
})
export class InscriptionService {
  private readonly http = inject(HttpClient);
  constructor() { }
  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${environment.apiUrl}/inscriptions`);
  }
  getInscriptionById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${environment.apiUrl}/inscriptions/${id}`);
  }
  createInscription(inscription: Inscription): Observable<Inscription> {
    return this.http.post<Inscription>(`${environment.apiUrl}/inscriptions`, inscription);
  }
  updateInscription(inscription: Inscription, id: number): Observable<Inscription> {
    return this.http.put<Inscription>(`${environment.apiUrl}/inscriptions/${id}`, inscription);
  }
  deleteInscription(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/inscriptions/${id}`);
  }
}
