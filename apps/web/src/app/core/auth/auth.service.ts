import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE } from '../config';
import { CurrentUser, LoginRequest, LoginResponse } from './auth.types';

const TOKEN_KEY = 'auth.token';
const USER_KEY = 'auth.user';

type StoredAuth = {
  token: string;
  user: CurrentUser;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _token = signal<string | null>(null);
  private readonly _user = signal<CurrentUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();

  readonly isLoggedIn = computed<boolean>(() => this._user() !== null);
  readonly isAdmin = computed<boolean>(() => !!this._user()?.isAdmin);

  constructor() {
    const restored = this.readFromStorage();
    if (restored) {
      this._token.set(restored.token);
      this._user.set(restored.user);
    }
  }

  login(email: string, password: string, remember: boolean): Observable<LoginResponse> {
    const body: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${API_BASE}/auth/login`, body).pipe(
      tap((res) => {
        this.persist(res.accessToken, res.user, remember);
        this._token.set(res.accessToken);
        this._user.set(res.user);
      }),
    );
  }

  logout(): void {
    this.clearStorage();
    this._token.set(null);
    this._user.set(null);
  }

  private persist(token: string, user: CurrentUser, remember: boolean): void {
    this.clearStorage();
    const store = remember ? localStorage : sessionStorage;
    try {
      store.setItem(TOKEN_KEY, token);
      store.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Storage may be unavailable (private mode, quota). Session is still
      // held in-memory on the signals, so silently ignore.
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  }

  private readFromStorage(): StoredAuth | null {
    const fromLocal = this.readFrom(localStorage);
    if (fromLocal) return fromLocal;
    return this.readFrom(sessionStorage);
  }

  private readFrom(store: Storage): StoredAuth | null {
    try {
      const token = store.getItem(TOKEN_KEY);
      const rawUser = store.getItem(USER_KEY);
      if (!token || !rawUser) return null;
      const user = JSON.parse(rawUser) as CurrentUser;
      if (
        !user ||
        typeof user.id !== 'number' ||
        typeof user.email !== 'string' ||
        typeof user.isAdmin !== 'boolean'
      ) {
        store.removeItem(TOKEN_KEY);
        store.removeItem(USER_KEY);
        return null;
      }
      return { token, user };
    } catch {
      try {
        store.removeItem(TOKEN_KEY);
        store.removeItem(USER_KEY);
      } catch {
        // ignore
      }
      return null;
    }
  }
}
