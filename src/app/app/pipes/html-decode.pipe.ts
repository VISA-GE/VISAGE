import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'htmlDecode',
  standalone: true,
})
export class HtmlDecodePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    // Create a textarea element to use the browser's built-in HTML entity decoding
    const textarea = document.createElement('textarea');
    textarea.innerHTML = value;

    // The value property will contain the decoded string
    return textarea.value;
  }
}
