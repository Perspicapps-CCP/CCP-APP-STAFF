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
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

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
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
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

  cargaMasivaProductos($event: Event, cargaMasiva: HTMLInputElement, fabricante: Fabricante) {
    const target = $event.target as HTMLInputElement;
    const files = target.files;
    cargaMasiva.value = '';
    this.fabricanteSelected = null;

    if (files && files.length > 0) {
      const file = files[0];
      const fileName = file.name;
      if (!fileName.toLowerCase().endsWith('.csv')) {
        this.translate.get('FABRICANTES.TOAST.ERROR_SCV_FILE').subscribe((mensaje: string) => {
          this._snackBar.open(mensaje, '', {
            horizontalPosition: 'end',
            verticalPosition: 'top',
            duration: 3000,
          });
        });
        return;
      }
      this.fabricantesService.cargaMasivaProductosFabricante(fabricante, file).subscribe({
        next: res => {
          if (res.total_errors_records > 0) {
            const mensaje = res.detail.map(element => {
              return `${element.row_file}: ${element.detail}
              `;
            });

            this._snackBar.open(`${mensaje.join('\n')}`, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 5000,
              panelClass: ['multiline-snackbar'],
            });
          } else {
            this.translate.get('FABRICANTES.TOAST.SUCCESS_FILE').subscribe((mensaje: string) => {
              this._snackBar.open(mensaje, '', {
                horizontalPosition: 'end',
                verticalPosition: 'top',
                duration: 3000,
              });
            });
          }

          this.obtenerFabricantes();
        },
        error: err => {
          console.error('Error al cargar el archivo CSV:', err);
          this.translate.get('FABRICANTES.TOAST.ERROR_FILE').subscribe((mensaje: string) => {
            this._snackBar.open(mensaje, '', {
              horizontalPosition: 'end',
              verticalPosition: 'top',
              duration: 3000,
            });
          });
        },
      });
    }
  }
}
