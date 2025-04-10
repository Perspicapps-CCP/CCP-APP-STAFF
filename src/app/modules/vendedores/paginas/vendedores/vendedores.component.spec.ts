import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { VendedoresComponent } from './vendedores.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VendedoresService } from '../../servicios/vendedores.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { CrearVendedorComponent } from '../../componentes/crear-vendedor/crear-vendedor.component';
import { Vendedor } from '../../interfaces/vendedores.interface';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';

// Mock del servicio de vendedores
class MockVendedoresService {
  obtenerVendedores() {
    return of<Vendedor[]>([
      {
        id: '1',
        full_name: 'Juan Pérez',
        email: 'juan@example.com',
        id_type: 'CC',
        identification: '12345678',
        phone: '3001234567',
        username: 'juanperez',
      },
      {
        id: '2',
        full_name: 'María Gómez',
        email: 'maria@example.com',
        id_type: 'CE',
        identification: '87654321',
        phone: '3109876543',
        username: 'mariagomez',
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: Vendedor[], searchTerm: string) {
    return items.filter(item => item.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
}

// Mock para MatDialog
class MockMatDialog {
  // Añadir afterClosed como un Observable
  afterClosed = of({});

  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: any) => {
        console.log('Dialog closed with result:', result);
      },
    } as MatDialogRef<any>;
  }
}

// Mock del servicio de traducción
class MockTranslateService {
  get(key: string | string[]) {
    return of(key);
  }
  instant(key: string | string[]) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {
    console.log(`Default language set to: ${lang}`);
  }
  use(lang: string) {
    return of({});
  }
  onLangChange = new BehaviorSubject({ lang: 'es' });
  onTranslationChange = new BehaviorSubject({});
  onDefaultLangChange = new BehaviorSubject({});
}

// Mock del TranslateLoader
export class MockTranslateLoader implements TranslateLoader {
  getTranslation(lang: string) {
    return of({});
  }
}

describe('VendedoresComponent', () => {
  let component: VendedoresComponent;
  let fixture: ComponentFixture<VendedoresComponent>;
  let vendedoresService: VendedoresService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VendedoresComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader },
        }),
      ],
      providers: [
        { provide: VendedoresService, useClass: MockVendedoresService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        TranslateStore,
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(VendedoresComponent);
    component = fixture.componentInstance;
    vendedoresService = TestBed.inject(VendedoresService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(vendedoresService, 'obtenerVendedores').and.callThrough();
    spyOn(component, 'filterVendedores').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los vendedores al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(vendedoresService.obtenerVendedores).toHaveBeenCalled();

    // Verificar que se establecieron los vendedores
    expect(component.vendedores.length).toBe(2);
    expect(component.vendedores[0].full_name).toBe('Juan Pérez');
  });

  it('debería inicializar filterVendedores$ correctamente', () => {
    // Verificar que se llamó al método filterVendedores
    expect(component.filterVendedores).toHaveBeenCalled();

    // Verificar que filterVendedores$ está definido
    expect(component.filterVendedores$).toBeDefined();
  });

  it('debería filtrar vendedores correctamente', () => {
    // Simular búsqueda
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaVendedores.setValue('Juan');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('Juan');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('debería abrir el modal de crear vendedor y recargar los vendedores después de cerrar', () => {
    // Espiar el método obtenerVendedores para verificar si se llama después de cerrar el diálogo
    spyOn(component, 'obtenerVendedores').and.callThrough();

    // Llamar al método
    component.abrirModalCrearVendedor();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(CrearVendedorComponent, {
      width: '22.9375rem',
    });

    // Verificar que se llamó a obtenerVendedores después de que el diálogo se cerrara
    expect(component.obtenerVendedores).toHaveBeenCalled();
  });
});
