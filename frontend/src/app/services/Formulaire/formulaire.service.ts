import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { StatutFormulaire } from '../../enums/StatutFormulaire/statut-formulaire';
import { environment } from '../../environments/environment.dev'
import { Formulaire } from '../../models/Formulaire/formulaire';
@Injectable({
  providedIn: 'root'
})
export class FormulaireService {
  private readonly http = inject(HttpClient);
  getAllFormulaires(): Observable<Formulaire[]> {
    return this.http.get<Formulaire[]>(`${environment.apiUrl}/formulaires`);
  }

  getTemplates(statut?: StatutFormulaire): Observable<Formulaire[]> {
    const query = statut
      ? `?is_template=1&statut=${statut}`
      : '?is_template=1';

    return this.http.get<Formulaire[]>(`${environment.apiUrl}/formulaires${query}`);
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
