import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shop {
  _id: string;
  name: string;
  category: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    floor?: string;
  };
  openingHours?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShopService {
  private apiUrl = `${environment.apiUrl}/shops`;

  constructor(private http: HttpClient) { }

  getShops(): Observable<Shop[]> {
    return this.http.get<Shop[]>(this.apiUrl);
  }

  getShopById(id: string): Observable<Shop> {
    return this.http.get<Shop>(`${this.apiUrl}/${id}`);
  }
}
