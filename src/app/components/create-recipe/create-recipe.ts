import { inject, Component, signal, WritableSignal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PublicationService } from '../../services/publicationService';
import { FormValidators } from '../../validators/formValidators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-recipe.html',
  styleUrl: './create-recipe.css'
})
export class CreateRecipeComponent {
  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  private readonly publicationService: PublicationService = inject(PublicationService);
  private readonly router: Router = inject(Router);

  currentStep: WritableSignal<number> = signal<number>(1);
  totalSteps = 4;
  sending: boolean = false;
  errorMessage: string = '';

  // imágenes generales de la receta
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  stepImages: (File | null)[] = [];
  stepImagePreviews: (string | null)[] = [];

  recipeForm: FormGroup = this.formBuilder.group({
    // paso 1 - info básica
    title: ['', [Validators.required, Validators.minLength(3), FormValidators.notOnlyWhiteSpace, FormValidators.primeraMayuscula]],
    description: ['', [FormValidators.notOnlyWhiteSpace]],
    raciones: [null, [FormValidators.minValue(1), FormValidators.soloEnteros]],
    tiempoHorno: [null, [FormValidators.minValue(0), FormValidators.soloEnteros]],
    temperaturaHorno: [null, [FormValidators.minValue(0), FormValidators.soloEnteros]],
    visibility: ['public'],

    // paso 2 - ingredientes
    ingredients: this.formBuilder.array([]),

    // paso 3 - pasos
    steps: this.formBuilder.array([])
  });

  // getters para los FormArray
  get ingredients(): FormArray {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.recipeForm.get('steps') as FormArray;
  }

  // ingredientes
  newIngredient(): FormGroup {
    return this.formBuilder.group({
      name: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
      quantity: [null, [FormValidators.minValue(0)]],
      unit: ['unidad']
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.newIngredient());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  // pasos
  newStep(): FormGroup {
    return this.formBuilder.group({
      text: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
      image: [null]
    });
  }

  addStep(): void {
    this.steps.push(this.newStep());
    this.stepImages.push(null);
    this.stepImagePreviews.push(null);
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
    this.stepImages.splice(index, 1);
    this.stepImagePreviews.splice(index, 1);
  }

  // imágenes generales
  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        this.selectedImages.push(file);
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreviews.push(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    }
  }

  onStepImageSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.stepImages[index] = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.stepImagePreviews[index] = reader.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  removeStepImage(index: number): void {
    this.stepImages[index] = null;
    this.stepImagePreviews[index] = null;
  }

  removeImage(index: number): void {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // navegación entre pasos
  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  canGoNext(): boolean {
    if (this.currentStep() === 1) {
      return this.recipeForm.get('title')!.valid;
    }
    if (this.currentStep() === 2) {
      return this.ingredients.length > 0 && this.ingredients.valid;
    }
    if (this.currentStep() === 3) {
      return this.steps.length > 0 && this.steps.valid;
    }
    return true;
  }

  // enviar
  onSubmit(): void {
    if (this.recipeForm.invalid) {
      this.recipeForm.markAllAsTouched();
      return;
    }

    this.sending = true;
    this.errorMessage = '';

    const data = {
      tipo: 'receta',
      title: this.recipeForm.value.title,
      description: this.recipeForm.value.description,
      raciones: this.recipeForm.value.raciones,
      tiempoHorno: this.recipeForm.value.tiempoHorno,
      temperaturaHorno: this.recipeForm.value.temperaturaHorno,
      visibility: this.recipeForm.value.visibility,
      ingredients: this.recipeForm.value.ingredients,
      steps: this.recipeForm.value.steps,
      text: ''
    };

    this.publicationService.savePublication(data).subscribe({
      next: (response: any) => {
        if (response.status) {
          const publicationId = response.publication._id;
          this.uploadAllImages(publicationId);
        }
      },
      error: () => {
        this.errorMessage = 'No se pudo publicar la receta.';
        this.sending = false;
      }
    });
  }

  private uploadAllImages(publicationId: string): void {
    const uploads: Observable<any>[] = [];

    // fotos de pasos
    this.stepImages.forEach((file, index) => {
      if (file) {
        uploads.push(
          this.publicationService.uploadStepImage(publicationId, index, file)
        );
      }
    });

    // fotos generales
    this.selectedImages.forEach(file => {
      uploads.push(
        this.publicationService.uploadImage(publicationId, file)
      );
    });

    if (uploads.length === 0) {
      this.sending = false;
      this.router.navigate(['/feed']);
      return;
    }

    // subir una a una en secuencia
    this.uploadNext(publicationId, uploads, 0);
  }

  private uploadNext(publicationId: string, uploads: Observable<any>[], index: number): void {
    if (index >= uploads.length) {
      this.sending = false;
      this.router.navigate(['/feed']);
      return;
    }

    uploads[index].subscribe({
      next: () => this.uploadNext(publicationId, uploads, index + 1),
      error: () => this.uploadNext(publicationId, uploads, index + 1)
    });
  }

  private uploadImages(publicationId: string, index: number): void {
    if (index >= this.selectedImages.length) {
      this.sending = false;
      this.router.navigate(['/feed']);
      return;
    }

    this.publicationService.uploadImage(publicationId, this.selectedImages[index]).subscribe({
      next: () => {
        this.uploadImages(publicationId, index + 1);
      },
      error: () => {
        this.uploadImages(publicationId, index + 1);
      }
    });
  }

  get unidades(): string[] {
    return ['g', 'kg', 'ml', 'l', 'cucharadita', 'cucharada', 'taza', 'unidad', 'pizca', 'tbsp', 'cup', 'tsp', 'oz'];
  }
}
