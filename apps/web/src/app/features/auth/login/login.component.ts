import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
  remember: FormControl<boolean>;
}>;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <form
        class="card"
        [formGroup]="form"
        (ngSubmit)="onSubmit()"
        novalidate
        aria-labelledby="login-heading"
      >
        <h1 id="login-heading">Sign in</h1>
        <p class="subtitle">Workshop inventory tools</p>

        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          autocomplete="username"
          formControlName="email"
          [attr.aria-invalid]="isInvalid('email') ? 'true' : null"
        />

        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          autocomplete="current-password"
          formControlName="password"
          [attr.aria-invalid]="isInvalid('password') ? 'true' : null"
        />

        <label class="remember">
          <input type="checkbox" formControlName="remember" />
          <span>Remember me on this device</span>
        </label>

        <div class="error" role="alert" aria-live="polite">
          @if (errorMessage()) {
            {{ errorMessage() }}
          }
        </div>

        <button type="submit" [disabled]="pending() || form.invalid">
          @if (pending()) {
            Signing in...
          } @else {
            Sign in
          }
        </button>

        <div class="hint">
          <div class="hint-title">Seeded accounts</div>
          <div><code>admin&#64;test.com</code> / <code>password</code></div>
          <div><code>user&#64;test.com</code> / <code>password</code></div>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: var(--bg);
      }
      .login-shell {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        padding: 24px;
        box-sizing: border-box;
      }
      .card {
        width: 100%;
        max-width: 360px;
        background: var(--card-bg);
        border: 1px solid var(--border);
        border-radius: 10px;
        padding: 28px 24px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
      }
      h1 {
        margin: 0;
        font-size: 20px;
        color: var(--fg);
      }
      .subtitle {
        margin: 0 0 10px;
        color: var(--muted);
        font-size: 13px;
      }
      label {
        font-size: 13px;
        color: var(--muted);
        margin-top: 4px;
      }
      input[type='email'],
      input[type='password'] {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border: 1px solid var(--border);
        border-radius: 6px;
        background: var(--bg);
        color: var(--fg);
      }
      input[aria-invalid='true'] {
        border-color: #dc2626;
      }
      .remember {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 6px 0 4px;
        color: var(--fg);
        font-size: 14px;
      }
      .remember input {
        margin: 0;
      }
      .error {
        min-height: 20px;
        color: #dc2626;
        font-size: 13px;
      }
      button[type='submit'] {
        background: var(--accent);
        color: #fff;
        border: 1px solid var(--accent);
        padding: 9px 12px;
        border-radius: 6px;
        font-weight: 500;
        cursor: pointer;
        margin-top: 4px;
      }
      button[type='submit']:hover:not([disabled]) {
        filter: brightness(0.95);
      }
      button[type='submit'][disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .hint {
        margin-top: 14px;
        padding-top: 14px;
        border-top: 1px dashed var(--border);
        font-size: 12px;
        color: var(--muted);
        line-height: 1.6;
      }
      .hint-title {
        font-weight: 600;
        color: var(--fg);
        margin-bottom: 4px;
      }
      code {
        background: var(--badge-bg);
        padding: 1px 5px;
        border-radius: 4px;
        font-size: 11.5px;
      }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly pending = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form: LoginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    remember: [true],
  });

  isInvalid(controlName: 'email' | 'password'): boolean {
    const c = this.form.controls[controlName];
    return c.invalid && (c.touched || c.dirty);
  }

  onSubmit(): void {
    if (this.pending()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, remember } = this.form.getRawValue();
    this.pending.set(true);
    this.errorMessage.set(null);

    this.authService.login(email, password, remember).subscribe({
      next: () => {
        this.pending.set(false);
        const returnUrl =
          this.route.snapshot.queryParamMap.get('returnUrl') ?? '/products';
        this.router.navigateByUrl(returnUrl);
      },
      error: () => {
        this.pending.set(false);
        this.errorMessage.set('Invalid email or password');
      },
    });
  }
}
