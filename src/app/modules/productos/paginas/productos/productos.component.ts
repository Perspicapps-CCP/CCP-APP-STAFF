import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { map, Observable, startWith, tap } from 'rxjs';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { Producto } from '../../interfaces/productos.interface';
import { ProductosService } from '../../servicios/productos.service';
import {
  VisorImagenesDialogComponent
} from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';

@Component({
  selector: 'app-productos',
  imports: [sharedImports, ReactiveFormsModule, HighlightTextPipe, LocalCurrencyPipe],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];

  //variable para el buscador de productos
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<Producto[]>;

  constructor(
    private productosService: ProductosService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerProductos();
  }

  obtenerProductos() {
    this.productosService.obtenerProductos().subscribe(res => {
      this.productos = res;
      this.filterProductos();
    });
  }

  filterProductos() {
    this.filterProductos$ = this.formBusquedaProductos.valueChanges.pipe(
      startWith(''),
      tap(value => {
        console.log('value', value);
      }),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.productos, name);
    }
    return this.productos.slice();
  }

  abrirVisorImagenes(producto: Producto) {
    this.dialog.open(VisorImagenesDialogComponent, {
      data: producto,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  }
}
