import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Shop {
    _id: string;
    name: string;
    owner: {
        _id: string;
        name: string;
        email: string;
    };
    location: {
        lat: number;
        lng: number;
        floor?: string;
        address: string;
    };
    category: string;
    openingHours?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateShopDto {
    name: string;
    ownerId: string; // ID of the user (manager)
    location: {
        lat: number;
        lng: number;
        floor?: string;
        address: string;
    };
    category: string;
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

    createShop(data: CreateShopDto): Observable<Shop> {
        const payload = { ...data, owner: data.ownerId }; // Backend expects 'owner' field as ID
        return this.http.post<Shop>(this.apiUrl, payload);
    }

    updateShop(id: string, data: Partial<CreateShopDto>): Observable<Shop> {
        return this.http.put<Shop>(`${this.apiUrl}/${id}`, data);
    }

    // Helper to delete if needed (though not in original routes list, standard REST practice)
    deleteShop(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
