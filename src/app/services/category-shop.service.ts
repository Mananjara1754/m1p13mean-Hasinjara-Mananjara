import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoryShop {
    _id?: string;
    name: string;
    description?: string;
    icon?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CategoryShopService {
    private apiUrl = `${environment.apiUrl}/category-shops`;

    constructor(private http: HttpClient) { }

    getCategoryShops(): Observable<CategoryShop[]> {
        return this.http.get<CategoryShop[]>(this.apiUrl);
    }

    getCategoryShopById(id: string): Observable<CategoryShop> {
        return this.http.get<CategoryShop>(`${this.apiUrl}/${id}`);
    }

    createCategoryShop(categoryData: CategoryShop): Observable<CategoryShop> {
        return this.http.post<CategoryShop>(this.apiUrl, categoryData);
    }

    updateCategoryShop(id: string, categoryData: CategoryShop): Observable<CategoryShop> {
        return this.http.put<CategoryShop>(`${this.apiUrl}/${id}`, categoryData);
    }

    deleteCategoryShop(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
