import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UserBodyRegister } from '../data/dto/userBodyRegister.dto';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    shop_id?: string;
    favorite_products?: string[];
}

export interface AuthResponse {
    _id: string;
    name: string;
    email: string;
    role: string;
    token: string;
    shop_id?: string;
    favorite_products?: string[];
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    public get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromToken();
    }

    private loadUserFromToken() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            try {
                const decoded: any = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    this.logout();
                } else {
                    this.currentUserSubject.next(JSON.parse(user));
                }
            } catch {
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
                    name: response.name,
                    email: response.email,
                    role: response.role,
                    shop_id: response.shop_id,
                    favorite_products: response.favorite_products
                };
                localStorage.setItem('user', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    register(userData: UserBodyRegister): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                const user: User = {
                    _id: response._id,
                    name: response.name,
                    email: response.email,
                    role: response.role,
                    shop_id: response.shop_id,
                    favorite_products: response.favorite_products
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

    updateCurrentUser(user: User) {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
    }
}
