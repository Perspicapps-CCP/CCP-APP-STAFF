import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import { Fabricante } from '../../interfaces/fabricantes.interface';

@Component({
  selector: 'app-agregar-producto-fabricante',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, OnlyNumbersDirective],
  templateUrl: './agregar-producto-fabricante.component.html',
  styleUrl: './agregar-producto-fabricante.component.scss',
})
export class AgregarProductoFabricanteComponent {
  readonly dialogRef = inject(MatDialogRef<AgregarProductoFabricanteComponent>);
  readonly data = inject<Fabricante>(MAT_DIALOG_DATA);

  productoForm = new FormGroup({
    product_name: new FormControl<string>('', [Validators.required]),
    product_code: new FormControl<string>('', [Validators.required]),
    price: new FormControl<string>('', [Validators.required]),
    images: new FormControl<any>(null, [Validators.required]),
    images_text: new FormControl<string>('', [Validators.required]),
  });

  constructor(private translate: TranslateService) {}

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.productoForm.get(controlName)?.hasError('required')) {
      return {
        key: 'FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.productoForm.get(controlName)?.hasError('minlength')) {
      return {
        key: 'FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_LENGTH',
        params: { min: this.productoForm.get(controlName)?.errors?.['minlength']?.requiredLength },
      };
    }

    if (this.productoForm.get(controlName)?.hasError('maxlength')) {
      return {
        key: 'FABRICANTES.CREAR_PRODUCTO.FORM_ERRORS.FIELD_LENGTH',
        params: { min: this.productoForm.get(controlName)?.errors?.['maxlength']?.requiredLength },
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.productoForm.get(controlName)!.invalid &&
      (this.productoForm.get(controlName)!.dirty || this.productoForm.get(controlName)!.touched)
    );
  }

  crearProducto() {
    this.dialogRef.close(this.productoForm.value);
  }

  onFileSelected(event: any) {
    const files = event.target.files;
    console.log('archivos cargados', files);
    if (files.length > 0) {
      const formData = new FormData();
      for (const file of files) {
        formData.append('images', file);
      }
      this.translate
        .get('FABRICANTES.CREAR_PRODUCTO.FORM.IMAGES_CHARGED')
        .subscribe((mensaje: string) => {
          this.productoForm.patchValue({ images_text: `${files.length} ${mensaje}` });
        });
      this.productoForm.patchValue({ images: files });
    } else {
      this.productoForm.patchValue({ images: null });
      this.productoForm.patchValue({ images_text: null });
      this.productoForm.get('images_text')?.markAsDirty();
      this.productoForm.get('images_text')?.markAsTouched();
    }
  }
}
