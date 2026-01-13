import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment.dev';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
@Injectable({
  providedIn: 'root'
})
export class UtilisateurService {
  private readonly http = inject(HttpClient);
  private utilisateurCourantSubject = new BehaviorSubject<Utilisateur | null>(null);
  utilisateurCourant = this.utilisateurCourantSubject.asObservable();

  setUtilisateurCourant(utilisateur: Utilisateur | null) {
    this.utilisateurCourantSubject.next(utilisateur);
  }

  getUtilisateurCourant(): Utilisateur | null {
    return this.utilisateurCourantSubject.value;
  }
  getAllUtilisateurs(): Observable<Utilisateur[]> {
    return this.http.get<Utilisateur[]>(`${environment.apiUrl}/utilisateurs`);
  }
  getUtilisateurById(id: number): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${environment.apiUrl}/utilisateurs/${id}`);
  }
  createUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur> {
    return this.http.post<Utilisateur>(`${environment.apiUrl}/utilisateurs`, utilisateur);
  }
  updateUtilisateur(utilisateur: Utilisateur, id: number): Observable<Utilisateur> {
    return this.http.put<Utilisateur>(`${environment.apiUrl}/utilisateurs/${id}`, utilisateur);
  }
  deleteUtilisateur(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/utilisateurs/${id}`);
  }
}
