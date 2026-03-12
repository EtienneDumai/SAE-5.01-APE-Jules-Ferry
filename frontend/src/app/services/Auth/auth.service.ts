import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

import { TokenService } from '../Token/token.service';
import { AuthResponse } from '../../models/Auth/auth-response';
import { LoginCredentials } from '../../models/Auth/login-credentials';
import { RegisterData } from '../../models/Auth/register-data';
import { Utilisateur } from '../../models/Utilisateur/utilisateur';
import { environment } from '../../environments/environment.dev';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly tokenService: TokenService = inject(TokenService);

  private getUserFromStorage(): Utilisateur | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  private currentUserSubject = new BehaviorSubject<Utilisateur | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  init(): void {
    if (this.tokenService.hasToken()) {
      this.loadCurrentUser();
    } else {
      this.logoutLocal();
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.handleAuthResponse(response);
        if (String(response.user.role).toLowerCase() === 'administrateur') {
           this.router.navigate(['/evenements']);
        } else {
           this.router.navigate(['/']);
        }
      })
    );
  }

  checkEmailType(email: string): Observable<{ action: string }> {
    return this.http.post<{ action: string }>(`${this.apiUrl}/check-email`, { email });
  }

  requestMagicLink(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/magic-link`, { email });
  }

  verifyMagicLink(targetUrl: string): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(targetUrl).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap({
        next: () => {
          this.clearAuthState();
          this.router.navigate(['/login']);
        },
        error: () => {
          this.clearAuthState();
          this.router.navigate(['/login']);
        }
      })
    );
  }

  // helper nettoyage local
  private logoutLocal() {
    this.tokenService.removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('idConnecte');
    this.currentUserSubject.next(null);
  }

  // helper save reponse
  private handleAuthResponse(response: AuthResponse) {
    if (response.token) {
      this.tokenService.saveToken(response.token);
    } else {
      console.warn("Attenion le backend ne renvoi aucun token !");
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
      
      if (response.user.id_utilisateur) {
          localStorage.setItem('idConnecte', String(response.user.id_utilisateur));
      }
      this.currentUserSubject.next(response.user);
    }
  }

  loadCurrentUser(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      this.logoutLocal();
      return;
    }

    // On utilise la classe HttpHeaders d'Angular
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });

    this.http.get<{ user: Utilisateur }>(`${this.apiUrl}/user`, { headers: headers }).subscribe({
      next: (response) => {
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUserSubject.next(response.user);
      },
      error: (err) => {
        console.error("Token invalide ou expiré :", err);
        // Le token est invalide ou expiré on nettoie tout
        this.logoutLocal();
      }
    });
  }

  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  getCurrentUser(): Utilisateur | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user ? String(user.role).toLowerCase() === role.toLowerCase() : false;
  }

  private clearAuthState(): void {
    this.tokenService.removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('idConnecte');
    this.currentUserSubject.next(null);
  }
}