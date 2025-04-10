import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Bodega } from '../../../bodegas/interfaces/bodega.interface';
import { BodegasService } from '../../../bodegas/servicios/bodegas.service';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { noMenorAFechaActual } from '../../../../shared/otros/date-validators';
import { CalendarComponent } from '../../../../shared/componentes/calendar/calendar.component';
import { CommonModule } from '@angular/common';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { GenerarRutaEntregaPost } from '../../interfaces/generar-ruta-entrega-post';
import { RutasService } from '../../servicios/rutas.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-generar-ruta',
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    CalendarComponent,
    NgbTypeaheadModule,
  ],
  templateUrl: './generar-ruta.component.html',
  styleUrl: './generar-ruta.component.scss',
})
export class GenerarRutaComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<GenerarRutaComponent>);

  // Variables para form grupo
  generarRutaForm: FormGroup = new FormGroup({
    bodega: new FormControl<Bodega | null>(null, {
      validators: [Validators.required],
    }),
    fechaRuta: new FormControl<Date | null>(null, {
      validators: [Validators.required, noMenorAFechaActual()],
      nonNullable: true,
    }),
  });

  bodegas: Bodega[] = [];

  constructor(
    private bodegasService: BodegasService,
    private translate: TranslateService,
    private rutasService: RutasService,
    private _snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.obtenerBodegas();
  }

  obtenerBodegas() {
    this.bodegasService.obtenerBodegas().subscribe((bodegas: Bodega[]) => {
      this.bodegas = bodegas;
    });
  }

  isInvalid(controlName: string) {
    return (
      this.generarRutaForm.get(controlName)!.invalid &&
      (this.generarRutaForm.get(controlName)!.dirty ||
        this.generarRutaForm.get(controlName)!.touched)
    );
  }

  searchBodegas: OperatorFunction<string, readonly { warehouse_name: string }[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term.length < 2
          ? []
          : this.bodegas
              .filter(bodega => new RegExp(term, 'mi').test(bodega.warehouse_name))
              .slice(0, 10),
      ),
    );

  formatter = (x: { warehouse_name: string }) => x.warehouse_name;

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.generarRutaForm.get(controlName)?.hasError('required')) {
      return {
        key: 'RUTAS.CREAR_RUTA.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.generarRutaForm.get(controlName)?.hasError('fechaPasada')) {
      return {
        key: 'RUTAS.CREAR_RUTA.FORM_ERRORS.DATE_PAST',
      };
    }
    return { key: '' };
  }

  crearRuta() {
    const formValue = this.generarRutaForm.value;
    console.log('formValue', formValue);
    const rutaPost: GenerarRutaEntregaPost = {
      warehouse_id: formValue.bodega?.warehouse_id,
      date: formValue.fechaRuta,
    };

    this.rutasService.generarRutasEntrega(rutaPost).subscribe({
      next: res => {
        this.translate.get('RUTAS.CREAR_RUTA.TOAST.SUCCESS').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
        this.dialogRef.close();
      },
      error: err => {
        this.translate.get('RUTAS.CREAR_RUTA.TOAST.ERROR').subscribe((mensaje: string) => {
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
