import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith } from 'rxjs';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { AgregarBodegaComponent } from '../../componentes/agregar-bodega/agregar-bodega.component';
import { ProductosBodegaComponent } from '../../componentes/productos-bodega/productos-bodega.component';
import { Bodega } from '../../interfaces/bodega.interface';
import { BodegasService } from '../../servicios/bodegas.service';

@Component({
  selector: 'app-bodegas',
  imports: [sharedImports, ReactiveFormsModule, HighlightTextPipe, ProductosBodegaComponent],
  templateUrl: './bodegas.component.html',
  styleUrl: './bodegas.component.scss',
})
export class BodegasComponent implements OnInit {
  bodegaSelected: Bodega | null = null;
  bodegas: Bodega[] = [];
  //variable para el buscador de bodegas
  formBusquedaBodegas = new FormControl('');
  filterBodegas$?: Observable<Bodega[]>;

  constructor(
    private bodegasService: BodegasService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerBodegas();
  }

  obtenerBodegas() {
    this.bodegasService.obtenerBodegas().subscribe(res => {
      this.bodegas = res;
      this.filterBodegas();
    });
  }

  filterBodegas() {
    this.filterBodegas$ = this.formBusquedaBodegas.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.bodegas, name);
    }
    return this.bodegas.slice();
  }

  abrirModalCrearBodega() {
    const dialogRef = this.dialog.open(AgregarBodegaComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerBodegas();
      }
    });
  }

  toggleExpansion(bodega: Bodega): void {
    if (this.bodegaSelected && this.bodegaSelected.warehouse_id === bodega.warehouse_id) {
      this.bodegaSelected = null;
    } else {
      this.bodegaSelected = bodega;
    }
  }
}
