import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/authService';
import { FormValidators } from '../../validators/formValidators';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          FormValidators.notOnlyWhiteSpace
        ]
      ]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData = this.loginForm.value;

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {

        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        this.authService.setIdentity(response.user);

        this.userService.getCounters().subscribe({
          next: (statsResponse: any) => {
            localStorage.setItem('stats', JSON.stringify(statsResponse));
            this.router.navigate(['/']);
          },
          error: (error: any) => {
            console.error(error);
            this.router.navigate(['/']);
          }
        });

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }
}
