import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import { MatDialogRef } from '@angular/material/dialog';
import { VendedoresService } from '../../servicios/vendedores.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Vendedor } from '../../interfaces/vendedores.interface';

@Component({
  selector: 'app-crear-vendedor',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, OnlyNumbersDirective],
  templateUrl: './crear-vendedor.component.html',
  styleUrl: './crear-vendedor.component.scss',
})
export class CrearVendedorComponent {
  readonly dialogRef = inject(MatDialogRef<CrearVendedorComponent>);

  vendedorForm = new FormGroup({
    full_name: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    }),
    id_type: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    identification: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    phone: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(10)],
      nonNullable: true,
    }),
    username: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(3)],
      nonNullable: true,
    }),
  });

  constructor(
    private vendedoresService: VendedoresService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.vendedorForm.get(controlName)?.hasError('required')) {
      return {
        key: 'VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.vendedorForm.get(controlName)?.hasError('minlength')) {
      return {
        key: 'VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_LENGTH',
        params: { min: this.vendedorForm.get(controlName)?.errors?.['minlength']?.requiredLength },
      };
    }

    if (this.vendedorForm.get(controlName)?.hasError('maxlength')) {
      return {
        key: 'VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_LENGTH',
        params: { min: this.vendedorForm.get(controlName)?.errors?.['maxlength']?.requiredLength },
      };
    }

    if (this.vendedorForm.get(controlName)?.hasError('email')) {
      return {
        key: 'VENDEDORES.CREAR_VENDEDOR.FORM_ERRORS.FIELD_EMAIL',
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.vendedorForm.get(controlName)!.invalid &&
      (this.vendedorForm.get(controlName)!.dirty || this.vendedorForm.get(controlName)!.touched)
    );
  }

  crearVendedor() {
    const valuesForm = this.vendedorForm.value;
    const vendedor: Vendedor = {
      full_name: valuesForm.full_name!,
      email: valuesForm.email!,
      id_type: valuesForm.id_type!,
      identification: valuesForm.identification!,
      phone: valuesForm.phone!,
      username: valuesForm.username!,
      role: 'SELLER',
    };

    this.vendedoresService.crearVendedor(vendedor).subscribe({
      next: res => {
        this.vendedorForm.reset();
        this.translate
          .get('VENDEDORES.CREAR_VENDEDOR.TOAST.SUCCESS')
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
        this.translate.get('VENDEDORES.CREAR_VENDEDOR.TOAST.ERROR').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
        this.dialogRef.close();
      },
    });
    this.dialogRef.close(this.vendedorForm.value);
  }
}
