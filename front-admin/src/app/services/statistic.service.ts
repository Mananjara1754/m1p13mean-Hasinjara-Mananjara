import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class StatisticService {
    private apiUrl = `${environment.apiUrl}/admin/statistics`;

    constructor(private http: HttpClient) { }

    getGlobalStats(year: number): Observable<any> {
        const params = new HttpParams().set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/global`, { params });
    }

    getPaymentStats(year: number): Observable<any> {
        const params = new HttpParams().set('year', year.toString());
        return this.http.get<any>(`${this.apiUrl}/payment`, { params });
    }

    getUsersStats(startDate: string, endDate: string): Observable<any> {
        const params = new HttpParams()
            .set('startDate', startDate)
            .set('endDate', endDate);
        return this.http.get<any>(`${this.apiUrl}/users`, { params });
    }
}
