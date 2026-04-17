import { Pipe, PipeTransform } from '@angular/core';

// pipe para convertir cualquier valor a any y poder acceder a sus propiedades
@Pipe({
  name: 'asAny',
  standalone: true
})
export class AsAnyPipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}
