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

  createUtilisateur(utilisateur: Utilisateur, admin_password?: string): Observable<Utilisateur> {
    const body = { ...utilisateur, admin_password };
    return this.http.post<Utilisateur>(`${environment.apiUrl}/utilisateurs`, body);
  }

  updateUtilisateur(utilisateur: Utilisateur, id: number, admin_password?: string): Observable<Utilisateur> {
    const body = { ...utilisateur, admin_password };
    return this.http.put<Utilisateur>(`${environment.apiUrl}/utilisateurs/${id}`, body);
  }

  deleteUtilisateur(id: number, admin_password?: string): Observable<{ message: string }> {
    const options = admin_password ? { body: { admin_password } } : {};
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/utilisateurs/${id}`, options);
  }

  updatePassword(id: number, motDePasse: string): Observable<Utilisateur> {
    return this.http.patch<Utilisateur>(`${environment.apiUrl}/utilisateurs/${id}/mot-de-passe`, { mot_de_passe: motDePasse });
  }
}