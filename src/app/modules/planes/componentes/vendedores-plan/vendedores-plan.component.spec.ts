import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VendedoresPlanComponent } from './vendedores-plan.component';
import { DinamicSearchService } from '../../../../shared/servicios/dinamic-search.service';
import { ReactiveFormsModule } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlanVenta } from '../../interfaces/planes.interface';
import { BehaviorSubject, of } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService, TranslateStore } from '@ngx-translate/core';
import { HighlightTextPipe } from '../../../../shared/pipes/highlight-text.pipe';
import { Vendedor } from '../../../vendedores/interfaces/vendedores.interface';

// Mock del servicio de búsqueda dinámica
class MockDinamicSearchService {
  dynamicSearch(items: Vendedor[], searchTerm: string) {
    return items.filter(item =>
      item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
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
  setDefaultLang(lang: string) { }
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

describe('VendedoresPlanComponent', () => {
  let component: VendedoresPlanComponent;
  let fixture: ComponentFixture<VendedoresPlanComponent>;
  let dinamicSearchService: DinamicSearchService;

  // Datos de prueba
  const mockPlanVenta: PlanVenta = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    product_id: "prod-001",
    start_date: new Date("2025-01-01"),
    end_date: new Date("2025-12-31"),
    goal: "10000",
    sellers: [
      {
        id: "seller-001",
        full_name: "Juan Pérez",
        email: "juan@example.com",
        id_type: "CC",
        identification: "123456789",
        phone: "3001234567",
        username: "jperez"
      },
      {
        id: "seller-002",
        full_name: "Ana Gómez",
        email: "ana@example.com",
        id_type: "CC",
        identification: "987654321",
        phone: "3007654321",
        username: "agomez"
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        VendedoresPlanComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: MockTranslateLoader }
        })
      ],
      providers: [
        { provide: DinamicSearchService, useClass: MockDinamicSearchService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: HighlightTextPipe, useClass: class { transform(text: string, search: string) { return text; } } },
        TranslateStore
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendedoresPlanComponent);
    component = fixture.componentInstance;
    dinamicSearchService = TestBed.inject(DinamicSearchService);

    // Establecer el Input requerido antes de detectChanges
    component.planVenta = mockPlanVenta;

    // Espiar métodos para verificar llamadas
    spyOn(component, 'filterVendedores').and.callThrough();
    spyOn(dinamicSearchService, 'dynamicSearch').and.callThrough();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar filterVendedores$ correctamente', () => {
    // Verificar que se llamó al método filterVendedores en OnInit
    expect(component.filterVendedores).toHaveBeenCalled();

    // Verificar que filterVendedores$ está definido
    expect(component.filterVendedores$).toBeDefined();
  });

  it('debería retornar todos los vendedores si el término de búsqueda está vacío', () => {
    const result = component.buscar('');
    expect(result.length).toBe(2);
    expect(result).toEqual(component.planVenta.sellers);
  });

  it('debería filtrar vendedores correctamente por nombre', () => {
    // Espiar método buscar
    spyOn(component, 'buscar').and.callThrough();

    // Establecer un valor en el control de búsqueda
    component.formBusquedaVendedores.setValue('Juan');

    // Comprobar que se llama al método buscar con el valor correcto
    expect(component.buscar).toHaveBeenCalledWith('Juan');

    // Verificar el resultado de la búsqueda
    const result = component.buscar('Juan');
    expect(result.length).toBe(1);
    expect(result[0].full_name).toBe('Juan Pérez');

    // Comprobar que se llama al servicio de búsqueda dinámica
    expect(dinamicSearchService.dynamicSearch).toHaveBeenCalled();
  });

  it('debería filtrar vendedores correctamente por email', () => {
    // Realizar búsqueda por email
    const result = component.buscar('ana@example');
    expect(result.length).toBe(1);
    expect(result[0].email).toBe('ana@example.com');
  });

  it('debería manejar correctamente búsquedas sin resultados', () => {
    // Realizar búsqueda que no debe encontrar resultados
    const result = component.buscar('vendedor inexistente');
    expect(result.length).toBe(0);
  });

  it('debería manejar correctamente vendedores vacíos', () => {
    // Crear un plan sin vendedores
    const planSinVendedores: PlanVenta = {
      ...mockPlanVenta,
      sellers: []
    };

    // Asignar el nuevo plan
    component.planVenta = planSinVendedores;

    // Realizar búsqueda
    const result = component.buscar('cualquier cosa');
    expect(result.length).toBe(0);
  });
});
