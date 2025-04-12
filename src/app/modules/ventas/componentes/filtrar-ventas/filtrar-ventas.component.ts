import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import {
  fechaFinMayorAInicio,
  noMenorAFechaActual,
} from '../../../../shared/otros/date-validators';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  OperatorFunction,
} from 'rxjs';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../../../../shared/componentes/calendar/calendar.component';
import { VentaQuery } from '../../interfaces/ventas.interface';
@Component({
  selector: 'app-filtrar-ventas',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    NgbTypeaheadModule,
    CommonModule,
    CalendarComponent,
  ],
  templateUrl: './filtrar-ventas.component.html',
  styleUrls: ['./filtrar-ventas.component.scss'],
})
export class FiltrarVentasComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<FiltrarVentasComponent>);

  filterForm = new FormGroup(
    {
      seller: new FormControl<Vendedor | null>(null, {
        validators: [],
        nonNullable: false,
      }),
      start_date: new FormControl<string | null>(null, {
        validators: [],
        nonNullable: true,
      }),
      end_date: new FormControl<string | null>(null, {
        validators: [],
        nonNullable: true,
      }),
    },
    { validators: fechaFinMayorAInicio() },
  );

  sellers: Vendedor[] = [];

  constructor(private readonly vendedoresService: VendedoresService) {}

  ngOnInit(): void {
    this.getSellers();
  }

  getSellers() {
    this.vendedoresService.obtenerVendedores().subscribe(res => {
      this.sellers = res;
      console.log('sellers', this.sellers);
    });
  }

  searchSellers: OperatorFunction<string, readonly { full_name: string }[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term.length < 2
          ? []
          : this.sellers
              .filter(seller => new RegExp(term, 'mi').test(seller.full_name))
              .slice(0, 3),
      ),
    );

  formatter = (x: { full_name: string }) => x.full_name;

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.filterForm.get(controlName)?.hasError('required')) {
      return {
        key: 'VENTAS.FILTER_FORM.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.filterForm.get(controlName)?.hasError('fechaPasada')) {
      return {
        key: 'VENTAS.FILTER_FORM.FORM_ERRORS.DATE_PAST',
      };
    }

    if (controlName === 'end_date' && this.filterForm.get(controlName)?.hasError('fechaFinMenor')) {
      return {
        key: 'VENTAS.FILTER_FORM.FORM_ERRORS.END_DATE_BEFORE_START_DATE',
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.filterForm.get(controlName)!.invalid &&
      (this.filterForm.get(controlName)!.dirty || this.filterForm.get(controlName)!.touched)
    );
  }

  enviarFiltros() {
    const valueForm = this.filterForm.value;
    console.log(valueForm);
    const queries: VentaQuery = {
      seller_id: valueForm.seller ? valueForm.seller.id : undefined,
      start_date: valueForm.start_date ? valueForm.start_date : undefined,
      end_date: valueForm.end_date ? valueForm.end_date : undefined,
    };
    this.dialogRef.close(queries);
  }
}
