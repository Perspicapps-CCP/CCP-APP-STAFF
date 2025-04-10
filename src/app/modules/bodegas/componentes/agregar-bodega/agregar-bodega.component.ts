import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BodegasService } from '../../servicios/bodegas.service';
import { CommonModule } from '@angular/common';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import { Bodega } from '../../interfaces/bodega.interface';

@Component({
  selector: 'app-agregar-bodega',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, OnlyNumbersDirective],
  templateUrl: './agregar-bodega.component.html',
  styleUrl: './agregar-bodega.component.scss',
})
export class AgregarBodegaComponent {
  readonly dialogRef = inject(MatDialogRef<AgregarBodegaComponent>);

  bodegaForm = new FormGroup({
    warehouse_name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    address: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    country: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    city: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),

    contact_phone: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      nonNullable: true,
    }),
  });

  constructor(
    private wareHouseService: BodegasService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.bodegaForm.get(controlName)?.hasError('required')) {
      return {
        key: 'BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.bodegaForm.get(controlName)?.hasError('minlength')) {
      return {
        key: 'BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_LENGTH',
        params: {
          min: this.bodegaForm.get(controlName)?.errors?.['minlength']?.requiredLength,
        },
      };
    }

    if (this.bodegaForm.get(controlName)?.hasError('maxlength')) {
      return {
        key: 'BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_LENGTH',
        params: {
          min: this.bodegaForm.get(controlName)?.errors?.['maxlength']?.requiredLength,
        },
      };
    }

    if (this.bodegaForm.get(controlName)?.hasError('email')) {
      return {
        key: 'BODEGAS.CREAR_BODEGA.FORM_ERRORS.FIELD_EMAIL',
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.bodegaForm.get(controlName)!.invalid &&
      (this.bodegaForm.get(controlName)!.dirty || this.bodegaForm.get(controlName)!.touched)
    );
  }

  crearBodega() {
    const valuesForm = this.bodegaForm.value;
    const bodega: Bodega = {
      warehouse_name: valuesForm.warehouse_name!,
      country: valuesForm.country!,
      city: valuesForm.city!,
      address: valuesForm.address!,
      phone: valuesForm.contact_phone!,
    };

    this.wareHouseService.crearBodega(bodega).subscribe({
      next: res => {
        this.bodegaForm.reset();
        this.translate.get('BODEGAS.CREAR_BODEGA.TOAST.SUCCESS').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
        this.dialogRef.close();
      },
      error: err => {
        this.translate.get('BODEGAS.CREAR_BODEGA.TOAST.ERROR').subscribe((mensaje: string) => {
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
