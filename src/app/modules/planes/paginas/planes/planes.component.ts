import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith, tap } from 'rxjs';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { VendedoresPlanComponent } from '../../componentes/vendedores-plan/vendedores-plan.component';
import { PlanVenta } from '../../interfaces/planes.interface';
import { PlanesService } from '../../servicios/planes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';
import { CrearPlanVentaComponent } from '../../componentes/crear-plan-venta/crear-plan-venta.component';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';

@Component({
  selector: 'app-planes',
  imports: [
    sharedImports,
    ReactiveFormsModule,
    VendedoresPlanComponent,
    HighlightTextPipe
  ],
  templateUrl: './planes.component.html',
  styleUrl: './planes.component.scss'
})
export class PlanesComponent {
  planVentaSelected: PlanVenta | null = null;
  planesVentas: PlanVenta[] = [];
  //variable para el buscador de fabricantes
  formBusquedaPlanes = new FormControl('');
  filterPlanes$?: Observable<PlanVenta[]>;

  constructor(
    private planesService: PlanesService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.obtenerPlanes();
  }

  obtenerPlanes() {
    this.planesService.obtenerPlanes().subscribe((res) => {
      this.planesVentas = res;
      this.filterPlanes();
    });
  }

  filterPlanes() {
    this.filterPlanes$ = this.formBusquedaPlanes.valueChanges.pipe(
      startWith(''),
      tap((value) => { console.log("value", value); }),
      map((name) => this.buscar(name || '')));
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.planesVentas, name);
    }
    return this.planesVentas.slice();
  }

  toggleExpansion(plan: PlanVenta): void {
    if (this.planVentaSelected && this.planVentaSelected.id === plan.id) {
      this.planVentaSelected = null; // Collapse if the same item is clicked
    } else {
      this.planVentaSelected = plan; // Expand the clicked item
    }
  }

  abrirModalCrearPlan() {
    this.dialog.open(CrearPlanVentaComponent, {
      width: '29.125rem',
    });
  }
}
