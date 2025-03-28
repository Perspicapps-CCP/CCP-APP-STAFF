import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounce, debounceTime, map, Observable, startWith, tap } from 'rxjs';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { Bodega } from '../../interfaces/bodega.interface';
import { ProductosBodegaComponent } from '../../componentes/productos-bodega/productos-bodega.component';
import { BodegasService } from '../../servicios/bodegas.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-bodegas',
  imports: [
    sharedImports,
    ReactiveFormsModule,
    HighlightTextPipe,
    ProductosBodegaComponent
  ],
  templateUrl: './bodegas.component.html',
  styleUrl: './bodegas.component.scss'
})
export class BodegasComponent {
  bodegaSelected: Bodega | null = null;
  bodegas: Bodega[] = [];
  //variable para el buscador de bodegas
  formBusquedaBodegas = new FormControl('');
  filterBodegas$?: Observable<Bodega[]>;

  constructor(
    private bodegasService: BodegasService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.obtenerBodegas();
  }

  obtenerBodegas() {
    this.bodegasService.obtenerBodegas().subscribe((res) => {
      this.bodegas = res;
      this.filterBodegas();
    });
  }

  filterBodegas() {
    this.filterBodegas$ = this.formBusquedaBodegas.valueChanges.pipe(
      startWith(''),
      map((name) => this.buscar(name || '')));
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.bodegas, name);
    }
    return this.bodegas.slice();
  }

  abrirModalCrearBodega() {

  }

  abrirModalAgregarProductoBodega(bodega: Bodega) {

  }

  toggleExpansion(bodega: Bodega): void {
    if (this.bodegaSelected && this.bodegaSelected.warehouse_id === bodega.warehouse_id) {
      this.bodegaSelected = null;
    } else {
      this.bodegaSelected = bodega;
    }
  }
}
