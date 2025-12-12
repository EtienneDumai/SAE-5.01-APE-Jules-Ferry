import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Formulaire } from '../../models/Formulaire/formulaire';
@Injectable({
  providedIn: 'root'
})
export class FormulaireService {
  private readonly http = inject(HttpClient);
  constructor() { }
  getAllFormulaires(): Observable<Formulaire[]> {
    return this.http.get<Formulaire[]>(`${environment.apiUrl}/formulaires`);
  }
  getFormulaireById(id: number): Observable<Formulaire> {
    return this.http.get<Formulaire>(`${environment.apiUrl}/formulaires/${id}`);
  }
  createFormulaire(formulaire: Formulaire): Observable<Formulaire> {
    return this.http.post<Formulaire>(`${environment.apiUrl}/formulaires`, formulaire);
  }
  updateFormulaire(formulaire: Formulaire, id: number): Observable<Formulaire> {
    return this.http.put<Formulaire>(`${environment.apiUrl}/formulaires/${id}`, formulaire);
  }
  deleteFormulaire(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/formulaires/${id}`);
  }
}
