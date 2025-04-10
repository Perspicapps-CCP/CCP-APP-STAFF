import { Component, Input } from '@angular/core';
import { Order, RutaEntrega } from '../../interfaces/rutas-entrega';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { sharedImports } from '../../../../shared/otros/shared-imports';

@Component({
  selector: 'app-ruta-detalle',
  imports: [sharedImports],
  templateUrl: './ruta-detalle.component.html',
  styleUrl: './ruta-detalle.component.scss',
})
export class RutaDetalleComponent {
  @Input({ required: true }) rutaEntrega!: RutaEntrega;
  constructor(
    private dialog: MatDialog,
    private translate: TranslateService,
  ) {}

  abrirVisorImagenes(order: Order) {
    this.dialog.open(VisorImagenesDialogComponent, {
      data: order,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  }
}
