import { Component, Input, OnInit } from '@angular/core';
import { Bodega } from '../../interfaces/bodega.interface';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { BodegasService } from '../../servicios/bodegas.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductoBodega } from '../../interfaces/producto-bodega';

@Component({
  selector: 'app-productos-bodega',
  imports: [
    sharedImports,
    HighlightTextPipe,
    ReactiveFormsModule,
    LocalCurrencyPipe
  ],
  templateUrl: './productos-bodega.component.html',
  styleUrl: './productos-bodega.component.scss'
})
export class ProductosBodegaComponent implements OnInit {
  @Input({ required: true }) bodega!: Bodega;
  productos: ProductoBodega[] = [];

  constructor(
    private bodegasService: BodegasService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.obtenerProductosBodega();
  }

  obtenerProductosBodega() {
    this.bodegasService.obtenerProductosBodega(this.bodega).subscribe((res) => {
      console.log("productos bodega",res);
      this.productos = res;
    });
  }
}
