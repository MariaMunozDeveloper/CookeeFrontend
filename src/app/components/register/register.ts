import { inject, Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/authService';
import { FormValidators } from '../../validators/formValidators';
import { User } from '../../common/interfaces/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly router: Router = inject(Router);

  registerForm: FormGroup = this.formBuilder.group({
    name: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    surname: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    nick: ['', [Validators.required, Validators.minLength(3), FormValidators.notOnlyWhiteSpace, FormValidators.forbiddenWord('admin')]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), FormValidators.notOnlyWhiteSpace]]
  });

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const user: User = this.registerForm.value;

    this.authService.register(user).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
