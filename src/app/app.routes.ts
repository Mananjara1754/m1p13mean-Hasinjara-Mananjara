import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ShopListComponent } from './pages/shops/shop-list/shop-list.component';
import { ShopFormComponent } from './pages/shops/shop-form/shop-form.component';
import { ShopProductsComponent } from './pages/shops/shop-products/shop-products.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { CategoriesShopComponent } from './pages/categories-shop/categories-shop.component';
import { PromotionsComponent } from './pages/promotions/promotions.component';
import { MyProductsComponent } from './pages/my-products/my-products.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { RentComponent } from './pages/rent/rent.component';
import { ShopPromotionsComponent } from './pages/promotions/shop-promotions.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },

            // Admin Routes
            { path: 'shops', component: ShopListComponent },
            { path: 'shops/new', component: ShopFormComponent },
            { path: 'shops/:id', component: ShopFormComponent },
            { path: 'shops/:id/products', component: ShopProductsComponent },
            { path: 'categories', component: CategoriesComponent },
            { path: 'categories-shop', component: CategoriesShopComponent },
            { path: 'promotions', component: PromotionsComponent },
            { path: 'users', component: DashboardComponent }, // Placeholder

            // Shop Owner Routes
            { path: 'my-products', component: MyProductsComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'shop-promotions', component: ShopPromotionsComponent },
            { path: 'rents', component: RentComponent },

            // Shared/Other
            { path: 'settings', component: DashboardComponent },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
