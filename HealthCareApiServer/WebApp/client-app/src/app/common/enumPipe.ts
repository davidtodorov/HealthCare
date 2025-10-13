import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enumText',
  standalone: true,
})
export class EnumTextPipe implements PipeTransform {
  transform(value: number | string, enumType: any): string {
    // For numeric enums
    if (typeof value === 'number' && enumType[value]) {
      return enumType[value];
    }

    // For string enums
    if (typeof value === 'string' && enumType[value] !== undefined) {
      return value;
    }

    return '';
  }
}