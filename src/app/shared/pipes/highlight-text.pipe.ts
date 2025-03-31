import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlightText',
  standalone: true,
  pure: false,
})
export class HighlightTextPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, search = ''): SafeHtml {
    const valueStr = value ? value + '' : '';
    if (!search) {
      return valueStr;
    }
    const expresion = new RegExp(
      '(?![^&;]+;)(?!<[^<>]*)(' + search + ')(?![^<>]*>)(?![^&;]+;)',
      'gi',
    );
    const respuesta = '<strong style="color:black" class="highlight">$1</strong>';
    return this.sanitizer.bypassSecurityTrustHtml(valueStr.replace(expresion, respuesta));
  }
}
