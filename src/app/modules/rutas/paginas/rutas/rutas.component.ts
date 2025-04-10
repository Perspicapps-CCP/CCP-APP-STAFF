import { Component, OnInit } from '@angular/core';
import { RutasService } from '../../servicios/rutas.service';
import { RutaEntrega } from '../../interfaces/rutas-entrega';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { map, Observable, startWith, tap } from 'rxjs';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { RutaDetalleComponent } from '../../componentes/ruta-detalle/ruta-detalle.component';
import { GenerarRutaComponent } from '../../componentes/generar-ruta/generar-ruta.component';
import { VisorMapaComponent } from '../../../../shared/componentes/visor-mapa/visor-mapa.component';

@Component({
  selector: 'app-rutas',
  imports: [
    sharedImports,
    RutaDetalleComponent,
    ReactiveFormsModule,
    HighlightTextPipe,
    RutaDetalleComponent,
  ],
  templateUrl: './rutas.component.html',
  styleUrl: './rutas.component.scss',
})
export class RutasComponent implements OnInit {
  rutaSelected: RutaEntrega | null = null;
  rutas: RutaEntrega[] = [];
  //variable para el buscador de fabricantes
  formBusquedaRutas = new FormControl('');
  filterRutas$?: Observable<RutaEntrega[]>;

  constructor(
    private rutasService: RutasService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.obtenerRutas();
  }

  obtenerRutas() {
    this.rutasService.obtenerRutasEntrega().subscribe(data => {
      this.rutas = data;
      this.filterRutas();
    });
  }

  filterRutas() {
    this.filterRutas$ = this.formBusquedaRutas.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.rutas, name);
    }
    return this.rutas.slice();
  }

  toggleExpansion(ruta: RutaEntrega): void {
    if (this.rutaSelected && this.rutaSelected.shipping_number === ruta.shipping_number) {
      this.rutaSelected = null; // Collapse if the same item is clicked
    } else {
      this.rutaSelected = ruta; // Expand the clicked item
    }
  }

  abrirModalCrearRutas() {
    const dialogRef = this.dialog.open(GenerarRutaComponent, {
      width: '29.125rem',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.obtenerRutas();
    });
  }

  abrirVisorRuta(ruta: RutaEntrega) {
    console.log(ruta);
    this.dialog.open(VisorMapaComponent, {
      data: ruta,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  }
}
