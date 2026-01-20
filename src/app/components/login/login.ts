import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
 loading = false;
  error = '';
form:FormGroup


  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
      this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  }

  submit(): void {
    this.router.navigateByUrl('/dashboard');
    console.log(this.form.value);
    this.error = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.value;
    this.loading = true;

    const ok = this.auth.login(email!, password!);
    this.loading = false;

    if (ok) {
      this.router.navigateByUrl('/');
    } else {
      this.error = 'Invalid email or password';
    }
  }
}
