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
  private readonly apiUrl = `${environment.apiUrl}/inscriptions`;

  getAllInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.apiUrl);
  }

  getMesInscriptions(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(`${this.apiUrl}/mes-inscriptions`);
  }

  createInscription(data: { id_creneau: number, commentaire?: string }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  deleteInscription(id_creneau: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id_creneau}`);
  }
}