import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { map, Observable, startWith, tap } from 'rxjs';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { Vendedor } from '../../interfaces/vendedores.interface';
import { VendedoresService } from '../../servicios/vendedores.service';
import { CrearVendedorComponent } from '../../componentes/crear-vendedor/crear-vendedor.component';

@Component({
  selector: 'app-vendedores',
  imports: [sharedImports, ReactiveFormsModule, HighlightTextPipe],
  templateUrl: './vendedores.component.html',
  styleUrl: './vendedores.component.scss',
})
export class VendedoresComponent implements OnInit {
  vendedores: Vendedor[] = [];

  //variable para el buscador de fabricantes
  formBusquedaVendedores = new FormControl('');
  filterVendedores$?: Observable<Vendedor[]>;

  constructor(
    private vendedoresService: VendedoresService,
    private dinamicSearchService: DinamicSearchService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.obtenerVendedores();
  }

  obtenerVendedores() {
    this.vendedoresService.obtenerVendedores().subscribe(res => {
      this.vendedores = res;
      this.filterVendedores();
    });
  }

  filterVendedores() {
    this.filterVendedores$ = this.formBusquedaVendedores.valueChanges.pipe(
      startWith(''),
      tap(value => {
        console.log('value', value);
      }),
      map(name => this.buscar(name || '')),
    );
  }

  buscar(name: string) {
    if (name) {
      return this.dinamicSearchService.dynamicSearch(this.vendedores, name);
    }
    return this.vendedores.slice();
  }

  abrirModalCrearVendedor() {
    this.dialog.open(CrearVendedorComponent, {
      width: '22.9375rem',
    });
  }
}
