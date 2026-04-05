import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormValidators } from '../../validators/formValidators';
import { AuthService } from '../../services/authService';
import { UserService } from '../../services/userService';
import { UserCardComponent } from '../user-card/user-card';

@Component({
  selector: 'app-my-data',
  standalone: true,
  imports: [ReactiveFormsModule, UserCardComponent],
  templateUrl: './my-data.html',
  styleUrl: './my-data.css'
})
export class MyDataComponent {
  myDataForm: FormGroup;
  identity: any;
  status: string = '';
  errorMessage: string = '';
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.identity = this.authService.getIdentity();

    this.myDataForm = this.formBuilder.group({
      name: [
        this.identity?.name || '',
        [Validators.required, FormValidators.notOnlyWhiteSpace]
      ],
      surname: [
        this.identity?.surname || '',
        [Validators.required, FormValidators.notOnlyWhiteSpace]
      ],
      nick: [
        this.identity?.nick || '',
        [Validators.required, Validators.minLength(3), FormValidators.notOnlyWhiteSpace]
      ],
      email: [
        this.identity?.email || '',
        [Validators.required, Validators.email]
      ]
    });
  }

  onSubmit(): void {
    if (this.myDataForm.invalid) {
      this.myDataForm.markAllAsTouched();
      return;
    }

    this.userService.updateUser(this.myDataForm.value).subscribe({
      next: (response: any) => {
        this.status = 'success';
        this.identity = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));

        if (this.selectedFile) {
          this.userService.uploadAvatar(this.selectedFile).subscribe({
            next: (avatarResponse: any) => {
              this.identity = avatarResponse.user;
              localStorage.setItem('user', JSON.stringify(avatarResponse.user));
              console.log('Avatar subido correctamente', avatarResponse);
            },
            error: (error: any) => {
              console.error('Error al subir avatar', error);
            }
          });
        }

        console.log('Usuario actualizado correctamente', response);
      },
      error: (error: any) => {
        if (error.status === 409) {
          this.status = 'duplicate';
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.status = 'unauthorized';
          this.errorMessage = 'Tu sesión ha caducado. Vuelve a iniciar sesión';
        } else {
          this.status = 'error';
          this.errorMessage = 'Ha ocurrido un error al actualizar los datos';
        }

        console.error('Error al actualizar usuario', error);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile);
    }
  }
}
