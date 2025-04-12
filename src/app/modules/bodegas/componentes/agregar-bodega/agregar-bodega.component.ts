import { Component, inject, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BodegasService } from '../../servicios/bodegas.service';
import { CommonModule } from '@angular/common';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import { Bodega } from '../../interfaces/bodega.interface';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { Pais } from '../../interfaces/paises.interface';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Ciudad } from '../../interfaces/ciudades.interface';

@Component({
  selector: 'app-agregar-bodega',
  imports: [ReactiveFormsModule, TranslateModule, CommonModule, OnlyNumbersDirective, NgbTypeaheadModule],
  templateUrl: './agregar-bodega.component.html',
  styleUrl: './agregar-bodega.component.scss',
})
export class AgregarBodegaComponent implements OnInit {
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

  countries: { name: string; iso2: string }[] = [];
  cities: Ciudad[] = [];
  constructor(
    private wareHouseService: BodegasService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.obtenerPaises();
  }

  obtenerPaises() {
    this.wareHouseService.obtenerPaises().subscribe(res => {
      this.countries = res;
    });
  }

  formatter = (x: { name: string }) => x.name;
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

  searchCountries: OperatorFunction<string, readonly { name: string }[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term.length < 2
          ? []
          : this.countries.filter(country => new RegExp(term, 'mi').test(country.name)).slice(0, 3),
      ),
    );

  onCountrySelected(event: any) {
    const selectedCountry = event.item;
    this.cities = [];
    this.bodegaForm.get('city')?.reset();
    this.wareHouseService.obtenerCuidadesPais(selectedCountry.iso2).subscribe(res => {
      this.cities = res;
    });
  }

  isValidCountry() {
    const inputValue = this.bodegaForm.get('country')?.value?.trim();

    if (typeof inputValue === 'string') {
      const foundCountry = this.countries.find(
        c => c.name.toLowerCase() === inputValue.toLowerCase(),
      );
      if (!foundCountry) {
        this.bodegaForm.get('country')?.reset();
        this.bodegaForm.get('city')?.reset();
        this.cities = [];
      } else {
        this.bodegaForm.get('country')?.setValue(foundCountry.name);
      }
      this.bodegaForm.get('country')?.markAsTouched();
      this.bodegaForm.get('country')?.updateValueAndValidity();
    }
  }
}
