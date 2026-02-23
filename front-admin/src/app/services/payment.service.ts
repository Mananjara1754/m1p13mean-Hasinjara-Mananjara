import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private apiUrl = `${environment.apiUrl}/payments`;

    constructor(private http: HttpClient) { }

    getPayments(page: number = 1, limit: number = 10): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());
        return this.http.get<any>(this.apiUrl, { params });
    }

    getShopPayments(shopId: string, page: number = 1, limit: number = 10, filters?: { payment_type?: string }): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (filters?.payment_type) {
            params = params.set('payment_type', filters.payment_type);
        }

        return this.http.get<any>(`${this.apiUrl}/shop/${shopId}`, { params });
    }

    createPayment(paymentData: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, paymentData);
    }

    getMyPayments(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/my-payments`);
    }

    getPaymentById(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    downloadInvoice(id: string): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/${id}/download`, {
            responseType: 'blob'
        });
    }

    payRent(data: { shop_id: string, month: string, year: string }): Observable<any> {
        // Note: The route is technically /api/shops/rent/pay but we can call it from here
        const shopRentUrl = `${environment.apiUrl}/shops/rent/pay`;
        return this.http.post<any>(shopRentUrl, data);
    }

    validateRent(id: string, method?: string): Observable<any> {
        const adminUrl = `${environment.apiUrl}/admin/rent/validate/${id}`;
        return this.http.put<any>(adminUrl, { method });
    }

    getRentStatus(month: string, year: string, status?: string): Observable<any> {
        let params = new HttpParams()
            .set('month', month)
            .set('year', year);

        if (status) {
            params = params.set('status', status);
        }

        const adminUrl = `${environment.apiUrl}/admin/rent/status`;
        return this.http.get<any>(adminUrl, { params });
    }

    // Updated getPayments to support filtering
    getAllPayments(page: number = 1, limit: number = 10, filters?: { status?: string, payment_type?: string }): Observable<any> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('limit', limit.toString());

        if (filters) {
            if (filters.status) params = params.set('status', filters.status);
            if (filters.payment_type) params = params.set('payment_type', filters.payment_type);
        }

        return this.http.get<any>(this.apiUrl, { params });
    }
}
