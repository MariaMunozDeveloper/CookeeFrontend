import { Ingredient } from './ingredient';
import { Step } from './step';
import { User } from './user';

export interface Publication {
  _id: string;
  user: User | string;
  tipo: 'texto' | 'receta';
  text: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: Step[];
  images: string[];
  tiempoHorno: number | null;
  temperaturaHorno: number | null;
  raciones: number | null;
  createdAt?: string;
  updatedAt?: string;
}
