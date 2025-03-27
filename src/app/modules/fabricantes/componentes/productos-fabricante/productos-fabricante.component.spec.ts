import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { ProductosFabricanteComponent } from './productos-fabricante.component';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
import { VisorImagenesDialogComponent } from '../../../../shared/componentes/visor-imagenes-dialog/visor-imagenes-dialog.component';

describe('ProductosFabricanteComponent', () => {
  let component: ProductosFabricanteComponent;
  let fixture: ComponentFixture<ProductosFabricanteComponent>;

  // Mocks básicos
  const fabricantesServiceMock = {
    obtenerProductosFabricante: jasmine.createSpy('obtenerProductosFabricante').and.returnValue(of([
      { id: '1', nombre: 'Producto 1', costoUnidad: 10.5, images: [] },
      { id: '2', nombre: 'Producto 2', costoUnidad: 20.75, images: [] }
    ]))
  };

  const dinamicSearchServiceMock = {
    dynamicSearch: jasmine.createSpy('dynamicSearch').and.callFake((items, searchTerm) => {
      return items.filter((item: { nombre: string }) => item.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
    })
  };

  const dialogMock = {
    open: jasmine.createSpy('open')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductosFabricanteComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        HighlightTextPipe,
        LocalCurrencyPipe
      ],
      providers: [
        { provide: FabricantesService, useValue: fabricantesServiceMock },
        { provide: DinamicSearchService, useValue: dinamicSearchServiceMock },
        { provide: MatDialog, useValue: dialogMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProductosFabricanteComponent);
    component = fixture.componentInstance;

    // Establecer el Input requerido
    component.fabricante = {
      id: '1',
      nombre: 'Test Fabricante',
      identificacion: '123456',
      telefono: '555-1234',
      direccion: 'Calle Test 123',
      correo: 'test@fabricante.com',
      productos: [],
      expandido: false
    }

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Nuevas pruebas para cubrir abrirVisorImagenes y el método buscar

  it('debería filtrar productos utilizando el servicio de búsqueda dinámica', () => {
    // Configurar el componente con productos
    component.productos = [
      { id: '1', nombre: 'Producto 1', codigoProducto: 'abc12', costoUnidad: 10.5, imagenes: ['imagen1.jpg'] },
      { id: '2', nombre: 'Producto 2', codigoProducto: 'abc12', costoUnidad: 20.75, imagenes: ['imagen2.jpg'] },
    ];

    // Probar el método buscar con un término de búsqueda
    const terminoBusqueda = 'Producto 1';
    const resultado = component.buscar(terminoBusqueda);

    // Verificar que se llamó al servicio de búsqueda dinámica
    expect(dinamicSearchServiceMock.dynamicSearch).toHaveBeenCalledWith(component.productos, terminoBusqueda);
  });

  it('debería abrir el visor de imágenes con el producto seleccionado', () => {
    // Crear un producto de prueba
    const productoSeleccionado = {
      id: '1',
      nombre: 'Producto 1',
      costoUnidad: 10.5,
      codigoProducto: 'P001',
      imagenes: ['imagen1.jpg', 'imagen2.jpg']
    };

    // Llamar al método abrirVisorImagenes
    component.abrirVisorImagenes(productoSeleccionado);

    // Verificar que se llamó al diálogo con los parámetros correctos
    expect(dialogMock.open).toHaveBeenCalledWith(VisorImagenesDialogComponent, {
      data: productoSeleccionado,
      width: '39.4375rem',
      height: '24.3125rem',
    });
  });
});
