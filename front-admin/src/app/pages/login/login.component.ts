import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // Demo mode: check if URL contains /admin to pre-fill admin or shop credentials
    const url = window.location.href;
    if (url.includes('/admin')) {
      this.email = 'admin@grosserie.com';
      this.password = 'admin123';
    } else {
      this.email = 'jumboscore@mail.com';
      this.password = 'jumboscore123';
    }
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else if (response.role === 'shop') {
          this.router.navigate(['/dashboard-shop']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        this.error = err.error?.message || 'Invalid email or password.';
      }
    });
  }
}
