import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { UserBodyRegister } from '../../data/dto/userBodyRegister.dto';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  user: UserBodyRegister = {
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    phone: '',
    role: 'buyer', // Default role
    avatar: 'https://ui-avatars.com/api/?name=User&background=random' // Default avatar or empty
  };

  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.isValid()) return;

    this.isLoading = true;
    this.errorMessage = '';

    // Generate avatar URL from name if not provided
    if (!this.user.avatar || this.user.avatar.includes('ui-avatars')) {
      this.user.avatar = `https://ui-avatars.com/api/?name=${this.user.firstname}+${this.user.lastname}&background=random`;
    }

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.status === 409) {
          this.errorMessage = 'Email already exists';
        } else {
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      }
    });
  }

  isValid(): boolean {
    return !!(
      this.user.firstname &&
      this.user.lastname &&
      this.user.email &&
      this.user.password &&
      this.user.password.length >= 6
    );
  }
}
