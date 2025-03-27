import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { FabricantesComponent } from './fabricantes.component';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { FabricantesService } from '../../servicios/fabricantes.service';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CrearFabricanteComponent } from '../../componentes/crear-fabricante/crear-fabricante.component';
import { AgregarProductoFabricanteComponent } from '../../componentes/agregar-producto-fabricante/agregar-producto-fabricante.component';

// Mock del servicio de localización
class MockLocalizationService {
  currentLocalizationSubject = new BehaviorSubject<any>({});
  currentLocalization$ = this.currentLocalizationSubject.asObservable();
  currentLang$ = new BehaviorSubject<string>('es').asObservable();
  localeId = 'es-ES';
  currentLocale$ = new BehaviorSubject<string>('es-ES');

  getLocale() { return 'es-ES'; }
  getLang() { return 'es'; }
  getCurrencyCode() { return 'EUR'; }
}

// Mock del servicio de fabricantes
class MockFabricantesService {
  obtenerFabricantes() {
    return of([
      {
        id: "1",
        nombre: "Fabricante 1",
        identificacion: "123456789",
        telefono: "123456789",
        direccion: "Calle 1",
        correo: "fabricante1@fabricante.com",
        productos: [],
      },
      {
        id: "2",
        nombre: "Fabricante 2",
        identificacion: "987654321",
        telefono: "987654321",
        direccion: "Calle 2",
        correo: "fabricante2@fabricante.com",
        productos: [],
      },
    ]);
  }
}

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: any[], searchTerm: string) {
    return items.filter(item =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}

// Mock del servicio de traducción
class MockTranslateService {
  get(key: string | Array<string>) {
    return of(key);
  }
  instant(key: string | Array<string>) {
    return key;
  }
  getBrowserLang() {
    return 'es';
  }
  setDefaultLang(lang: string) {}
  use(lang: string) { return of({}); }
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

// Mock para MatDialog
class MockMatDialog {
  open(component: any, config?: any): MatDialogRef<any> {
    return {
      afterClosed: () => of({}),
      close: (result?: any) => {}
    } as MatDialogRef<any>;
  }
}

describe('FabricantesComponent', () => {
  let component: FabricantesComponent;
  let fixture: ComponentFixture<FabricantesComponent>;
  let fabricantesService: FabricantesService;
  let dinamicSearchService: DinamicSearchService;
  let dialog: MatDialog;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FabricantesComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
        { provide: FabricantesService, useClass: MockFabricantesService },
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: MatDialog, useClass: MockMatDialog },
        TranslateStore
      ],
      // Ignorar errores de componentes secundarios que no son críticos para estas pruebas
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FabricantesComponent);
    component = fixture.componentInstance;
    fabricantesService = TestBed.inject(FabricantesService);
    dinamicSearchService = TestBed.inject(DinamicSearchService);
    dialog = TestBed.inject(MatDialog);

    // Espiar métodos para verificar llamadas
    spyOn(fabricantesService, 'obtenerFabricantes').and.callThrough();
    spyOn(component, 'filterFabricantes').and.callThrough();
    spyOn(dialog, 'open').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar los fabricantes al inicializar', () => {
    // Verificar que se llamó al servicio
    expect(fabricantesService.obtenerFabricantes).toHaveBeenCalled();

    // Verificar que se establecieron los fabricantes
    expect(component.fabricantes.length).toBe(2);
    expect(component.fabricantes[0].nombre).toBe('Fabricante 1');
  });

  it('debería inicializar filterFabricantes$ correctamente', () => {
    // Verificar que se llamó al método filterFabricantes
    expect(component.filterFabricantes).toHaveBeenCalled();

    // Verificar que filterFabricantes$ está definido
    expect(component.filterFabricantes$).toBeDefined();
  });

  it('debería alternar la selección de fabricante al llamar toggleExpansion', () => {
    // Inicialmente ningún fabricante está seleccionado
    expect(component.fabricanteSelected).toBeNull();

    // Seleccionar un fabricante
    const fabricante = {
      id: "1",
      nombre: "Fabricante 1",
      identificacion: "123456789",
      telefono: "123456789",
      direccion: "Calle 1",
      correo: "fabricante1@fabricante.com",
      productos: [],
    };
    component.toggleExpansion(fabricante);
    expect(component.fabricanteSelected).toBe(fabricante);

    // Volver a llamar al mismo fabricante debería deseleccionarlo
    component.toggleExpansion(fabricante);
    expect(component.fabricanteSelected).toBeNull();

    // Seleccionar otro fabricante después de tener uno seleccionado
    const otroFabricante = {
      id: "2",
      nombre: "Fabricante 2",
      identificacion: "987654321",
      telefono: "987654321",
      direccion: "Calle 2",
      correo: "fabricante2@fabricante.com",
      productos: [],
    };
    component.toggleExpansion(fabricante);
    component.toggleExpansion(otroFabricante);
    expect(component.fabricanteSelected).toBe(otroFabricante);
  });

  it('debería filtrar fabricantes correctamente', () => {
    // Simular búsqueda
    spyOn(component, 'buscar').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaFabricantes.setValue('Fabricante 1');

    // Comprobar que se llama al método buscar
    expect(component.buscar).toHaveBeenCalledWith('Fabricante 1');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  // Pruebas para los métodos de diálogo

  it('debería abrir el modal de crear fabricante', () => {
    // Llamar al método
    component.abrirModalCrearFabricante();

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(CrearFabricanteComponent, {
      width: '29.125rem',
    });
  });

  it('debería abrir el modal para agregar productos a un fabricante', () => {
    // Crear un fabricante de prueba
    const fabricante = {
      id: "1",
      nombre: "Fabricante 1",
      identificacion: "123456789",
      telefono: "123456789",
      direccion: "Calle 1",
      correo: "fabricante1@fabricante.com",
      productos: [],
    };

    // Llamar al método
    component.abrirModalAgregarProductosFabricante(fabricante);

    // Verificar que se abrió el diálogo con los parámetros correctos
    expect(dialog.open).toHaveBeenCalledWith(AgregarProductoFabricanteComponent, {
      width: '29.125rem',
      data: { ...fabricante }
    });
  });
});
