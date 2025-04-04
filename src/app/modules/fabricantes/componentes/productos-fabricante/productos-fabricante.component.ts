import { Component, Input, OnInit } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-productos-fabricante',
  imports: [sharedImports, HighlightTextPipe, ReactiveFormsModule, LocalCurrencyPipe],
  templateUrl: './productos-fabricante.component.html',
  styleUrl: './productos-fabricante.component.scss',
})
export class ProductosFabricanteComponent implements OnInit {
  @Input({ required: true }) fabricante!: Fabricante;
  productos: ProductoFabricante[] = [];
  formBusquedaProductos = new FormControl('');
  filterProductos$?: Observable<ProductoFabricante[]>;

  constructor(
    private fabricantesService: FabricantesService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.obtenerProductosFabricantes();
  }

  obtenerProductosFabricantes() {
    this.fabricantesService.obtenerProductosFabricante(this.fabricante).subscribe(res => {
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

  cargarImagenes($event: Event, cargaMasiva: HTMLInputElement, producto: ProductoFabricante) {
    const fabricante = this.fabricante;
    const target = $event.target as HTMLInputElement;
    const files = target.files;
    if (files && files.length > 0) {
      // Check if all files are images
      const allowedImageFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
      for (const file of Array.from(files)) {
        const fileName = file.name.toLowerCase();
        const isImageFile = allowedImageFormats.some(format => fileName.endsWith(format));

        if (!isImageFile) {
          this.translate.get('FABRICANTES.TOAST.ERROR_IMAGE_FILE').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000,
            });
          });
          return;
        }
      }
      this.fabricantesService.cargarImagenesProducto(fabricante, producto, files).subscribe({
        next: res => {
          this.translate
            .get('BODEGAS.PRODUCTOS_BODEGA.TOAST.MASSIVE_PRODUCTS_PROCESSED', {
              count: res.processed_records,
              countOk: res.successful_records,
              countError: res.failed_records,
            })
            .subscribe((mensaje: string) => {
              console.log('mensaje traducido', mensaje);
              this._snackBar.open(mensaje, '', {
                horizontalPosition: 'end',
                verticalPosition: 'top',
                duration: 5000,
                panelClass: ['multiline-snackbar'],
              });
            });
          this.obtenerProductosFabricantes();
        },
        error: error => {
          this.translate
            .get('BODEGAS.PRODUCTOS_BODEGA.TOAST.ERROR_PROCESS_MASIVE')
            .subscribe((mensaje: string) => {
              this._snackBar.open(mensaje, '', {
                horizontalPosition: 'end',
                verticalPosition: 'top',
                duration: 3000,
              });
            });
        },
      });
    }
    cargaMasiva.value = '';
  }
}
