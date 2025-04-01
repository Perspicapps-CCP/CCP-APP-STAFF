import { Component, Input, OnInit } from '@angular/core';
import { PlanVenta } from '../../interfaces/planes.interface';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';

@Component({
  selector: 'app-vendedores-plan',
  imports: [sharedImports, HighlightTextPipe, ReactiveFormsModule],
  templateUrl: './vendedores-plan.component.html',
  styleUrl: './vendedores-plan.component.scss',
})
export class VendedoresPlanComponent implements OnInit {
  @Input({ required: true }) planVenta!: PlanVenta;
  formBusquedaVendedores = new FormControl('');
  filterVendedores$?: Observable<Vendedor[]>;

  constructor(private dinamicSearchService: DinamicSearchService) {}

  ngOnInit(): void {
    this.filterVendedores();
  }

  filterVendedores() {
    this.filterVendedores$ = this.formBusquedaVendedores.valueChanges.pipe(
      startWith(''),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.planVenta.sellers, name);
    }
    return this.planVenta.sellers.slice();
  }
}
