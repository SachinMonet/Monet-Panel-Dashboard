
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'app_token';

  login(email: string, password: string): boolean {
    // fake check; replace with API call
    if (email && password) {
      localStorage.setItem(this.TOKEN_KEY, 'dummy-token');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
