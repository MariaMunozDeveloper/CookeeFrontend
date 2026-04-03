import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormValidators } from '../../validators/formValidators';
import { AuthService } from '../../services/authService';
import { User } from '../../common/interfaces/user';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          FormValidators.notOnlyWhiteSpace
        ]
      ],
      surname: [
        '',
        [
          Validators.required,
          FormValidators.notOnlyWhiteSpace
        ]
      ],
      nick: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          FormValidators.notOnlyWhiteSpace,
          FormValidators.forbiddenWord('admin')
        ]
      ],
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
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const user: User = this.registerForm.value;

    this.authService.register(user).subscribe({
      next: (response) => {
        console.log('Usuario registrado correctamente', response);
      },
      error: (error) => {
        console.error('Error en el registro', error);
      }
    });
  }
}
