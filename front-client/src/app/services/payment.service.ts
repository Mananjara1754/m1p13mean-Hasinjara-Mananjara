import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) { }

  downloadInvoice(orderId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/order/${orderId}/download`, {
      responseType: 'blob'
    });
  }
}
