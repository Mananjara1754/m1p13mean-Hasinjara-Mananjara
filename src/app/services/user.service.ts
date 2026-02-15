import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    addFavorite(productId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/favorites/${productId}`, {});
    }

    removeFavorite(productId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/favorites/${productId}`);
    }
}
