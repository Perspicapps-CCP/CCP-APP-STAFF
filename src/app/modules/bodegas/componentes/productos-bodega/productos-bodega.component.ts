import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { map, Observable, startWith } from 'rxjs';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { ProductoFabricante } from '../../../fabricantes/interfaces/producto-fabricante.interface';
import { Bodega } from '../../interfaces/bodega.interface';
import { ProductoBodega } from '../../interfaces/producto-bodega';
import { BodegasService } from '../../servicios/bodegas.service';

@Component({
  selector: 'app-productos-bodega',
  imports: [sharedImports, HighlightTextPipe, ReactiveFormsModule],
  templateUrl: './productos-bodega.component.html',
  styleUrl: './productos-bodega.component.scss',
})
export class ProductosBodegaComponent implements OnInit {
  @Input({ required: true }) bodega!: Bodega;
  productos: ProductoBodega[] = [];
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<ProductoBodega[]>;

  constructor(
    private bodegasService: BodegasService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.obtenerProductosBodega();
  }

  obtenerProductosBodega() {
    this.bodegasService.obtenerProductosBodega(this.bodega).subscribe(res => {
      this.productos = res;
      this.filterProductos();
    });
  }

  filterProductos() {
    this.filterProductos$ = this.formBusquedaProductos.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
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

  abrirModalAgregarProductoBodega() {
    this.translate.get('SETTINGS.NOT_IMPLEMENTED_YET').subscribe((mensaje: string) => {
      this._snackBar.open(mensaje, '', {
        horizontalPosition: 'end',
        verticalPosition: 'top',
        duration: 3000,
      });
    });
  }
}
