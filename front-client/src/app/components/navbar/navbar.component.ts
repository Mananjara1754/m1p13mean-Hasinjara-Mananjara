import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TranslationService } from '../../services/translation.service';
import { AuthService, User } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, TranslateModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  showLanguageDropdown = false;
  showSearchBar = false;
  searchQuery = '';
  cartCount$: Observable<number>;
  currentUser$: Observable<User | null>;

  constructor(
    public translationService: TranslationService,
    private authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.cartCount$ = this.cartService.cartItems$.pipe(
      map(items => items.reduce((acc, item) => acc + item.quantity, 0))
    );
    this.currentUser$ = this.authService.currentUser$;
  }

  toggleLanguageDropdown(): void {
    this.showLanguageDropdown = !this.showLanguageDropdown;
  }

  changeLanguage(language: string): void {
    this.translationService.changeLanguage(language);
    this.showLanguageDropdown = false;
  }

  getCurrentLanguage(): string {
    return this.translationService.getCurrentLanguage();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleSearch(): void {
    this.showSearchBar = !this.showSearchBar;
    if (this.showSearchBar) {
      setTimeout(() => {
        const input = document.getElementById('navbar-search-input');
        if (input) input.focus();
      }, 100);
    } else {
      this.searchQuery = '';
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.performSearch();
    }
    if (event.key === 'Escape') {
      this.showSearchBar = false;
      this.searchQuery = '';
    }
  }

  performSearch(): void {
    const q = this.searchQuery.trim();
    this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
    this.showSearchBar = false;
    this.searchQuery = '';
  }
}
