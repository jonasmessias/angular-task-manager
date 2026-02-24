import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ZardCardComponent } from '../../shared/components/card/card.component';
import { LoginFormComponent } from '../components/login-form/login-form.component';
import { LoginDto } from '../models/auth.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [RouterModule, LoginFormComponent, ZardCardComponent],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  onLogin(dto: LoginDto): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(dto).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (err: Error) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Erro ao fazer login');
      },
    });
  }
}
