import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface UserProfile {
  firstname: string;
  lastname: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface User {
  _id: string;
  role: 'admin' | 'shop' | 'buyer';
  profile: UserProfile;
  shop_id?: string;
}

export interface AuthResponse {
  _id: string;
  role: string;
  profile: UserProfile;
  token: string;
  shop_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromToken();
  }

  private loadUserFromToken() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        // Check expiration
        if (decoded.exp * 1000 < Date.now()) {
          this.logout();
          return;
        }

        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          this.currentUserSubject.next(user);
        }
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const user: User = {
          _id: response._id,
          role: response.role as 'admin' | 'shop' | 'buyer',
          profile: response.profile,
          shop_id: response.shop_id
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const user: User = {
          _id: response._id,
          role: response.role as 'admin' | 'shop' | 'buyer',
          profile: response.profile,
          shop_id: response.shop_id
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(roles: string[]): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return roles.includes(user.role);
  }

  changePassword(passwords: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/change-password`, passwords);
  }
}
