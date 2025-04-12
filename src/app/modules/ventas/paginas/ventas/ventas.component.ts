import { Component, OnInit } from '@angular/core';
import { Venta } from '../../interfaces/ventas.interface';
import { VentasService } from '../../servicios/ventas.service';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { MatDialog } from '@angular/material/dialog';
import { FiltrarVentasComponent } from '../../componentes/filtrar-ventas/filtrar-ventas.component';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';

@Component({
  selector: 'app-ventas',
  imports: [sharedImports, LocalDatePipe, LocalCurrencyPipe],
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.scss',
})
export class VentasComponent implements OnInit {
  ventas: Venta[] = [];

  constructor(
    private readonly ventasService: VentasService,
    private readonly dialog: MatDialog,
  ) {}
  ngOnInit(): void {
    this.obtenerVentas();
  }

  obtenerVentas() {
    this.ventasService.obtenerVentas().subscribe(res => {
      this.ventas = res;
    });
  }

  descargarVentas() {
    const fileUrl = this.ventasService.obtenerUrlDescarga();
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.target = '_blank';
    anchor.click();
  }

  abrirModalFiltros() {
    const dialogRef = this.dialog.open(FiltrarVentasComponent, {
      width: '22.9375rem',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.obtenerVentas();
    });
  }
}
