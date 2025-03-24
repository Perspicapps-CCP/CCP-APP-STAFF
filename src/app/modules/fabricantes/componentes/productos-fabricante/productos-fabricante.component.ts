import { Component, Input } from '@angular/core';
import { Fabricante } from '../../interfaces/fabricantes.interface';

@Component({
  selector: 'app-productos-fabricante',
  imports: [],
  templateUrl: './productos-fabricante.component.html',
  styleUrl: './productos-fabricante.component.scss'
})
export class ProductosFabricanteComponent {
  @Input({ required: true }) fabricante!: Fabricante;

  constructor() { }


}
