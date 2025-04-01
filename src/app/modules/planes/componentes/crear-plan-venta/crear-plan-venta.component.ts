import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductoFabricante } from '../../../fabricantes/interfaces/producto-fabricante.interface';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import {
  fechaFinMayorAInicio,
  noMenorAFechaActual,
} from '../../../../shared/otros/date-validators';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  OperatorFunction,
} from 'rxjs';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { FabricantesService } from '../../../fabricantes/servicios/fabricantes.service';
import { CalendarComponent } from '../../../../shared/componentes/calendar/calendar.component';

@Component({
  selector: 'app-crear-plan-venta',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    NgbTypeaheadModule,
    CalendarComponent,
  ],
  templateUrl: './crear-plan-venta.component.html',
  styleUrl: './crear-plan-venta.component.scss',
})
export class CrearPlanVentaComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<CrearPlanVentaComponent>);

  sellers: Vendedor[] = [];
  selectionSellers = new SelectionModel<Vendedor>(true, []);

  planForm = new FormGroup(
    {
      product: new FormControl<ProductoFabricante | null>(null, [Validators.required]),
      goal: new FormControl<number>(0, [Validators.required]),
      start_date: new FormControl<Date | null>(null, [Validators.required, noMenorAFechaActual()]),
      end_date: new FormControl<Date | null>(null, [Validators.required, noMenorAFechaActual()]),
    },
    { validators: fechaFinMayorAInicio() },
  );

  productos: ProductoFabricante[] = [];

  constructor(
    private translate: TranslateService,
    private vendedoresService: VendedoresService,
    private fabricantesService: FabricantesService,
  ) {}

  ngOnInit(): void {
    this.getSellers();
    this.getProducts();
  }

  getProducts() {
    this.fabricantesService.obtenerProductosFabricante().subscribe(res => {
      this.productos = res;
    });
  }

  getSellers() {
    this.vendedoresService.obtenerVendedores().subscribe(res => {
      this.sellers = res;
    });
  }

  getErrorMessage(controlName: string): { key: string; params?: any } {
    if (this.planForm.get(controlName)?.hasError('required')) {
      return {
        key: 'PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.FIELD_REQUIRED',
      };
    }

    if (this.planForm.get(controlName)?.hasError('fechaPasada')) {
      return {
        key: 'PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.DATE_PAST',
      };
    }

    if (controlName === 'end_date' && this.planForm.get(controlName)?.hasError('fechaFinMenor')) {
      return {
        key: 'PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.END_DATE_BEFORE_START_DATE',
      };
    }

    return { key: '' };
  }

  isInvalid(controlName: string) {
    return (
      this.planForm.get(controlName)!.invalid &&
      (this.planForm.get(controlName)!.dirty || this.planForm.get(controlName)!.touched)
    );
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selectionSellers.selected.length;
    const numRows = this.sellers.length;
    return numSelected === numRows && numRows > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selectionSellers.clear();
      return;
    }

    this.selectionSellers.select(...this.sellers);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Vendedor): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selectionSellers.isSelected(row) ? 'deselect' : 'select'} row ${row.username}`;
  }

  searchProduct: OperatorFunction<string, readonly { name: string }[]> = (
    text$: Observable<string>,
  ) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term =>
        term.length < 2
          ? []
          : this.productos
              .filter(product => new RegExp(term, 'mi').test(product.name))
              .slice(0, 10),
      ),
    );

  formatter = (x: { name: string }) => x.name;

  crearPlan() {
    console.log('respuesta', this.planForm);
    // this.dialogRef.close(this.planForm.value);
  }
}
