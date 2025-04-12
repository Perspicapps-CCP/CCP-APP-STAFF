import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith, tap } from 'rxjs';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { FiltrarVentasComponent } from '../../componentes/filtrar-ventas/filtrar-ventas.component';
import { VentaQuery, VentaTabla } from '../../interfaces/ventas.interface';
import { VentasService } from '../../servicios/ventas.service';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';

@Component({
  selector: 'app-ventas',
  imports: [sharedImports, ReactiveFormsModule, LocalCurrencyPipe, HighlightTextPipe],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit {
  //variable para el buscador de fabricantes
  formBusquedaVentas = new FormControl('');
  filterVentas$?: Observable<VentaTabla[]>;

  ventas: VentaTabla[] = [];
  VentaQuery: VentaQuery = {};

  totalVentas = 0;

  constructor(
    private readonly ventasService: VentasService,
    private readonly dialog: MatDialog,
    private dinamicSearchService: DinamicSearchService,
  ) {}

  ngOnInit(): void {
    this.obtenerVentas();
  }

  obtenerVentas() {
    this.ventasService.obtenerVentas(this.VentaQuery).subscribe(res => {
      this.ventas = res;
      this.filterVentas();
      this.totalVentas = this.ventasService.getTotalVentas();
    });
  }

  filterVentas() {
    this.filterVentas$ = this.formBusquedaVentas.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.ventas, name);
    }
    return this.ventas.slice();
  }

  descargarVentas() {
    const fileUrl = this.ventasService.obtenerUrlDescarga(this.VentaQuery);
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.target = '_blank';
    anchor.click();
  }

  abrirModalFiltros() {
    const dialogRef = this.dialog.open(FiltrarVentasComponent, {
      width: '28.25rem',
    });

    dialogRef.afterClosed().subscribe(filtros => {
      if (filtros) {
        this.VentaQuery = filtros as VentaQuery;
        this.obtenerVentas();
      }
    });
  }
}
