import { Routes } from '@angular/router';
import { ShopListComponent } from './pages/shop-list/shop-list.component';
import { ShopDetailComponent } from './pages/shop-detail/shop-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'shops', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'shops', component: ShopListComponent },
    { path: 'shops/:id', component: ShopDetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'orders', component: OrdersComponent, canActivate: [authGuard] },
    { path: '**', redirectTo: 'shops' }
];
