import { Component, inject, model, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductoFabricante } from '../../../modules/fabricantes/interfaces/producto-fabricante.interface';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-visor-imagenes-dialog',
  imports: [NgbCarouselModule, TranslateModule],
  templateUrl: './visor-imagenes-dialog.component.html',
  styleUrl: './visor-imagenes-dialog.component.scss',
})
export class VisorImagenesDialogComponent {
  readonly dialogRef = inject(MatDialogRef<VisorImagenesDialogComponent>);
  readonly data = inject<ProductoFabricante>(MAT_DIALOG_DATA);
}
