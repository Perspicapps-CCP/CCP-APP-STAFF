import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-agregar-bodega',
  imports: [],
  templateUrl: './agregar-bodega.component.html',
  styleUrl: './agregar-bodega.component.scss'
})
export class AgregarBodegaComponent {
  readonly dialogRef = inject(MatDialogRef<AgregarBodegaComponent>);
}
