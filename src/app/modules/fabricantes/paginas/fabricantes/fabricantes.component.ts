import { Component, OnDestroy, OnInit } from '@angular/core';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { Fabricante } from '../../interfaces/fabricantes.interface';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { ProductosFabricanteComponent } from '../../componentes/productos-fabricante/productos-fabricante.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith, tap } from 'rxjs';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { CrearFabricanteComponent } from '../../componentes/crear-fabricante/crear-fabricante.component';
import { MatDialog } from '@angular/material/dialog';
import { AgregarProductoFabricanteComponent } from '../../componentes/agregar-producto-fabricante/agregar-producto-fabricante.component';

@Component({
  selector: 'app-fabricantes',
  imports: [sharedImports, ProductosFabricanteComponent, ReactiveFormsModule, HighlightTextPipe],
  templateUrl: './fabricantes.component.html',
  styleUrl: './fabricantes.component.scss',
})
export class FabricantesComponent implements OnInit {
  fabricanteSelected: Fabricante | null = null;
  fabricantes: Fabricante[] = [];
  //variable para el buscador de fabricantes
  formBusquedaFabricantes = new FormControl('');
  filterFabricantes$?: Observable<Fabricante[]>;

  constructor(
    private fabricantesService: FabricantesService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerFabricantes();
  }

  obtenerFabricantes() {
    this.fabricantesService.obtenerFabricantes().subscribe(res => {
      this.fabricantes = res;
      this.filterFabricantes();
    });
  }

  filterFabricantes() {
    this.filterFabricantes$ = this.formBusquedaFabricantes.valueChanges.pipe(
      startWith(''),
      tap(value => {
        console.log('value', value);
      }),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.fabricantes, name);
    }
    return this.fabricantes.slice();
  }

  toggleExpansion(fabricante: Fabricante): void {
    if (this.fabricanteSelected && this.fabricanteSelected.id === fabricante.id) {
      this.fabricanteSelected = null; // Collapse if the same item is clicked
    } else {
      this.fabricanteSelected = fabricante; // Expand the clicked item
    }
  }

  abrirModalCrearFabricante() {
    this.dialog.open(CrearFabricanteComponent, {
      width: '29.125rem',
    });

    this.dialog.afterAllClosed.subscribe(() => {
      this.obtenerFabricantes();
    });
  }

  abrirModalAgregarProductosFabricante(fabricante: Fabricante) {
    this.dialog.open(AgregarProductoFabricanteComponent, {
      width: '29.125rem',
      data: { ...fabricante },
    });
  }
}
