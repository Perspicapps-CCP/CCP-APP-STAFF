import { Component, Input } from '@angular/core';
import { Fabricante } from '../../interfaces/fabricantes.interface';
import { ProductoFabricante } from '../../interfaces/producto-fabricante.interface';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { map, Observable, startWith, tap } from 'rxjs';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { MatDialog } from '@angular/material/dialog';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';

@Component({
  selector: 'app-productos-fabricante',
  imports: [
    sharedImports,
    HighlightTextPipe,
    ReactiveFormsModule,
    LocalCurrencyPipe
  ],
  templateUrl: './productos-fabricante.component.html',
  styleUrl: './productos-fabricante.component.scss'
})
export class ProductosFabricanteComponent {
  @Input({ required: true }) fabricante!: Fabricante;
  productos: ProductoFabricante[] = [];
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<ProductoFabricante[]>;

  constructor(
    private fabricantesService: FabricantesService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.obtenerProductosFabricantes();
  }

  obtenerProductosFabricantes() {
    this.fabricantesService.obtenerProductosFabricante(this.fabricante).subscribe((res) => {
      this.productos = res;
      this.filterProductos();
    });
  }

  filterProductos() {
    this.filterProductos$ = this.formBusquedaProductos.valueChanges.pipe(
      startWith(''),
      map((name) => this.buscar(name || '')));
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.productos, name);
    }
    return this.productos.slice();
  }

  abrirVisorImagenes(producto: ProductoFabricante) {
    this.dialog.open(VisorImagenesDialogComponent, {
      data: producto,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  }
}
