import { SelectionModel } from '@angular/cdk/collections';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { CalendarComponent } from '../../../../shared/componentes/calendar/calendar.component';
import { OnlyNumbersDirective } from '../../../../shared/directivas/only-numbers.directive';
import {
  fechaFinMayorAInicio,
  noMenorAFechaActual,
} from '../../../../shared/otros/date-validators';
import { ProductoFabricante } from '../../../fabricantes/interfaces/producto-fabricante.interface';
import { FabricantesService } from '../../../fabricantes/servicios/fabricantes.service';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { PlanVentaPost } from '../../interfaces/planes.interface';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlanesService } from '../../servicios/planes.service';

@Component({
  selector: 'app-crear-plan-venta',
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    CommonModule,
    NgbTypeaheadModule,
    CalendarComponent,
    OnlyNumbersDirective,
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
      product: new FormControl<ProductoFabricante | null>(null, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      goal: new FormControl<number>(1, {
        validators: [Validators.required, Validators.min(1)],
        nonNullable: true,
      }),
      start_date: new FormControl<Date | null>(null, {
        validators: [Validators.required, noMenorAFechaActual()],
        nonNullable: true,
      }),
      end_date: new FormControl<Date | null>(null, {
        validators: [Validators.required, noMenorAFechaActual()],
        nonNullable: true,
      }),
    },
    { validators: fechaFinMayorAInicio() },
  );

  productos: ProductoFabricante[] = [];

  constructor(
    private vendedoresService: VendedoresService,
    private fabricantesService: FabricantesService,
    private translate: TranslateService,
    private _snackBar: MatSnackBar,
    private planesService: PlanesService,
  ) {}

  ngOnInit(): void {
    this.getSellers();
    this.getProducts();
  }

  getProducts() {
    this.fabricantesService.obtenerProductos().subscribe(res => {
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

    if (this.planForm.get(controlName)?.hasError('min')) {
      return {
        key: 'PLAN_VENTA.CREAR_PLAN.FORM_ERRORS.GOAL_MIN',
        params: { min: 1 },
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
    if (this.selectionSellers.selected.length === 0) {
      this.translate
        .get('PLAN_VENTA.CREAR_PLAN.TOAST.ERROR_SELLERS')
        .subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
      return;
    }

    const valueForm = this.planForm.value;
    const vendedoresIds = this.selectionSellers.selected.map(v => v.id!);

    const plan: PlanVentaPost = {
      product_id: valueForm.product!.id,
      goal: valueForm.goal!,
      start_date: valueForm.start_date!,
      end_date: valueForm.end_date!,
      seller_ids: vendedoresIds,
    };

    this.planesService.crearPlan(plan).subscribe({
      next: res => {
        this.translate.get('PLAN_VENTA.CREAR_PLAN.TOAST.SUCCESS').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
        this.dialogRef.close();
      },
      error: err => {
        this.translate.get('PLAN_VENTA.CREAR_PLAN.TOAST.ERROR').subscribe((mensaje: string) => {
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
