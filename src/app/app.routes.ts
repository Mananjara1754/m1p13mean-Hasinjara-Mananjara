import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/login/login.component';
import { ShopListComponent } from './pages/shops/shop-list/shop-list.component';
import { ShopFormComponent } from './pages/shops/shop-form/shop-form.component';
import { ShopProductsComponent } from './pages/shops/shop-products/shop-products.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },

            // Shop Management Routes
            { path: 'shops', component: ShopListComponent },
            { path: 'shops/new', component: ShopFormComponent },
            { path: 'shops/:id', component: ShopFormComponent }, // Edit route
            { path: 'shops/:id/products', component: ShopProductsComponent },

            // Placeholders
            { path: 'rents', component: DashboardComponent },
            { path: 'users', component: DashboardComponent },
            { path: 'settings', component: DashboardComponent },
        ]
    },
    { path: '**', redirectTo: 'login' }
];
