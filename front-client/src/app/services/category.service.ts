import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoryShops } from '../data/dto/categoryShops.dto';
import { CategoryProducts } from '../data/dto/categoryProducts.dto';


@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) { }

  getCategoryShops(): Observable<CategoryShops[]> {
    return this.http.get<CategoryShops[]>(`${environment.apiUrl}/category-shops`);
  }
  getCategoryProducts(): Observable<CategoryProducts[]> {
    return this.http.get<CategoryProducts[]>(`${environment.apiUrl}/categories`);
  }
}
