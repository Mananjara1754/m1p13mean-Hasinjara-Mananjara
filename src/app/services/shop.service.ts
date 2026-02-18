import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shop {
    _id: string;
    name: string;
    description?: string;
    logo?: string;
    category_id?: string;
    product_category_ids?: string[];
    location?: {
        floor?: number;
        zone?: string;
        map_position?: {
            x: number;
            y: number;
        };
    };
    opening_hours?: {
        monday?: { open: string; close: string; is_closed?: boolean };
        tuesday?: { open: string; close: string; is_closed?: boolean };
        wednesday?: { open: string; close: string; is_closed?: boolean };
        thursday?: { open: string; close: string; is_closed?: boolean };
        friday?: { open: string; close: string; is_closed?: boolean };
        saturday?: { open: string; close: string; is_closed?: boolean };
        sunday?: { open: string; close: string; is_closed?: boolean };
        [key: string]: any;
    };
    rent?: {
        amount: number;
        currency: string;
        billing_cycle: string;
    };
    owner_user_id?: string | {
        _id: string;
        profile: {
            firstname: string;
            lastname: string;
            email: string;
        };
    };
    stats?: {
        total_sales: number;
        total_orders: number;
        rating: number;
    };
    created_at?: string;
    updated_at?: string;
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

    createShop(shopData: any): Observable<Shop> {
        // Handle FormData if logo is included
        return this.http.post<Shop>(this.apiUrl, shopData);
    }

    createShopWithUser(shopData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/with-user`, shopData);
    }

    updateShop(id: string, shopData: any): Observable<Shop> {
        return this.http.put<Shop>(`${this.apiUrl}/${id}`, shopData);
    }

    deleteShop(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
