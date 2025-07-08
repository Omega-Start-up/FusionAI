import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Check for existing session on init
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return this.currentUser?.isAuthenticated || false;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // Simulate API call
      const response = await this.mockApiCall({
        email,
        password
      });

      const user: User = {
        id: '1',
        email: email,
        name: 'John Doe',
        avatar: undefined,
        initials: this.getInitials('John Doe'),
        isAuthenticated: true,
        subscription: 'free'
      };

      this.setCurrentUser(user);
      return user;
    } catch (error) {
      throw new Error('Échec de la connexion');
    }
  }

  async signup(email: string, password: string, name: string): Promise<User> {
    try {
      // Simulate API call
      const response = await this.mockApiCall({
        email,
        password,
        name
      });

      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        avatar: undefined,
        initials: this.getInitials(name),
        isAuthenticated: true,
        subscription: 'free'
      };

      this.setCurrentUser(user);
      return user;
    } catch (error) {
      throw new Error('Échec de la création du compte');
    }
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('platform_x_user');
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('platform_x_user', JSON.stringify(user));
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('platform_x_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error loading user from storage:', error);
      }
    }
  }

  private getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private mockApiCall(data: any): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, data }), 1000);
    });
  }
}