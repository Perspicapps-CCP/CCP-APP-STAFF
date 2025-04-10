import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-visor-mapa',
  imports: [],
  templateUrl: './visor-mapa.component.html',
  styleUrl: './visor-mapa.component.scss',
})
export class VisorMapaComponent {
  readonly dialogRef = inject(MatDialogRef<VisorMapaComponent>);
  readonly data = inject<{ latitude: number; longitude: number }[]>(MAT_DIALOG_DATA);
}
