import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VendedoresService } from '../../../vendedores/servicios/vendedores.service';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { fechaFinMayorAInicio } from '../../../../shared/otros/date-validators';
@Component({
  selector: 'app-filtrar-ventas',
  imports: [ReactiveFormsModule, TranslateModule],
  templateUrl: './filtrar-ventas.component.html',
  styleUrls: ['./filtrar-ventas.component.css'],
})
export class FiltrarVentasComponent implements OnInit {
  sellers: Vendedor[] = [];

  filterForm = new FormGroup(
    {
      start_date: new FormControl<Date | null>(null, {
        validators: [],
        nonNullable: false,
      }),
      end_date: new FormControl<Date | null>(null, {
        validators: [],
        nonNullable: false,
      }),
      seller: new FormControl<Vendedor | null>(null, {
        validators: [],
        nonNullable: false,
      }),
      order_number: new FormControl<number | null>(null, {
        validators: [],
        nonNullable: false,
      }),
    },
    { validators: fechaFinMayorAInicio() },
  );
  constructor(private vendedoresService: VendedoresService) {}

  ngOnInit() {
    this.getSellers();
  }

  getSellers() {
    this.vendedoresService.obtenerVendedores().subscribe(res => {
      this.sellers = res;
    });
  }
}
