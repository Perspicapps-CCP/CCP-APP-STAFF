import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { Fabricante } from '../../interfaces/fabricantes.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-crear-fabricante',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, OnlyNumbersDirective],
  templateUrl: './crear-fabricante.component.html',
  styleUrl: './crear-fabricante.component.scss',
})
export class CrearFabricanteComponent {
  readonly dialogRef = inject(MatDialogRef<CrearFabricanteComponent>);

  fabricanteForm = new FormGroup({
    manufacturer_name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    identification_type: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    identification_number: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    address: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    contact_phone: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      nonNullable: true,
    }),
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
  });

  constructor(
    private fabricantesService: FabricantesService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.fabricanteForm.get(controlName)?.hasError('required')) {
      return {
        key: 'FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.fabricanteForm.get(controlName)?.hasError('minlength')) {
      return {
        key: 'FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_LENGTH',
        params: {
          min: this.fabricanteForm.get(controlName)?.errors?.['minlength']?.requiredLength,
        },
      };
    }

    if (this.fabricanteForm.get(controlName)?.hasError('maxlength')) {
      return {
        key: 'FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_LENGTH',
        params: {
          min: this.fabricanteForm.get(controlName)?.errors?.['maxlength']?.requiredLength,
        },
      };
    }

    if (this.fabricanteForm.get(controlName)?.hasError('email')) {
      return {
        key: 'FABRICANTES.CREAR_FABRICANTE.FORM_ERRORS.FIELD_EMAIL',
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.fabricanteForm.get(controlName)!.invalid &&
      (this.fabricanteForm.get(controlName)!.dirty || this.fabricanteForm.get(controlName)!.touched)
    );
  }

  crearFabricante() {
    const valuesForm = this.fabricanteForm.value;
    const fabricante: Fabricante = {
      manufacturer_name: valuesForm.manufacturer_name!,
      identification_type: valuesForm.identification_type!,
      identification_number: valuesForm.identification_number!,
      address: valuesForm.address!,
      contact_phone: valuesForm.contact_phone!,
      email: valuesForm.email!,
    };

    this.fabricantesService.crearFabricante(fabricante).subscribe({
      next: res => {
        this.fabricanteForm.reset();
        this.translate
          .get('FABRICANTES.CREAR_FABRICANTE.TOAST.SUCCESS')
          .subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000,
            });
          });
        this.dialogRef.close();
      },
      error: err => {
        this.translate
          .get('FABRICANTES.CREAR_FABRICANTE.TOAST.ERROR')
          .subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000,
            });
          });
        this.dialogRef.close();
      },
    });
  }
}
