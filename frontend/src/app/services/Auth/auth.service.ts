import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { TokenService } from '../Token/token.service';
import { AuthResponse } from '../../models/Auth/auth-response';
import { LoginCredentials } from '../../models/Auth/login-credentials';
import { RegisterData } from '../../models/Auth/register-data';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { environment } from '../../environments/environment.dev';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<Utilisateur | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private router: Router
  ) {
    if (this.tokenService.hasToken()) {
      this.loadCurrentUser();
    }
  }

  /**
   * Inscription
   */
  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => {
        this.tokenService.saveToken(response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Connexion
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.tokenService.saveToken(response.token);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  /**
   * Déconnexion
   */
  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.removeToken();
        this.currentUserSubject.next(null);
        this.router.navigate(['/']);
      })
    );
  }

  /**
   * CHARGER CHARGER CHARGER CHARGER (les infos du user connecté)
   */
  loadCurrentUser(): void {
    this.http.get<{ user: Utilisateur }>(`${this.apiUrl}/user`).subscribe({
      next: (response) => {
        this.currentUserSubject.next(response.user);
      },
      error: () => {
        this.tokenService.removeToken();
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  /**
   * Récupérer utilisateur actuel
   */
  getCurrentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  /**
   * verif rôle spécifique utilisateur
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }
}