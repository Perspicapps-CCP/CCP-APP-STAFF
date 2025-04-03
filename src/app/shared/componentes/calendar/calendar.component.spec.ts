import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  CalendarComponent,
  CustomDateParserFormatter,
  CustomDatepickerI18n,
} from './calendar.component';
import { LocalizationService } from '../../servicios/localization.service';
import {
  NgbDatepickerConfig,
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import {
  TranslateModule,
  TranslateService,
  TranslateLoader,
  TranslateFakeLoader,
} from '@ngx-translate/core';

describe('CalendarComponent', () => {
  let component: CalendarComponent;
  let fixture: ComponentFixture<CalendarComponent>;
  let translateService: TranslateService;

  // Mock para el LocalizationService
  const localizationServiceMock = {
    currentLang$: new BehaviorSubject<string>('es'),
    getCurrentLanguage: () => 'es',
  };

  // Mock para el TranslateService
  const translateServiceMock = {
    get: jasmine.createSpy('get').and.returnValue(of('mensaje traducido')),
    instant: jasmine.createSpy('instant').and.returnValue('mensaje traducido'),
    onLangChange: of({}),
    onTranslationChange: of({}),
    onDefaultLangChange: of({}),
    getBrowserLang: () => 'es',
    currentLang: 'es',
    stream: jasmine.createSpy('stream').and.returnValue(of('mensaje traducido')),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CalendarComponent,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader },
        }),
      ],
      providers: [
        { provide: LocalizationService, useValue: localizationServiceMock },
        { provide: TranslateService, useValue: translateServiceMock },
        NgbDatepickerConfig,
        NgbDateParserFormatter,
      ],
      schemas: [NO_ERRORS_SCHEMA], // Ignora errores de elementos y propiedades desconocidas
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarComponent);
    component = fixture.componentInstance;
    translateService = TestBed.inject(TranslateService);

    // Resetear los spies antes de cada prueba
    translateServiceMock.get.calls.reset();
    translateServiceMock.instant.calls.reset();
    translateServiceMock.stream.calls.reset();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Prueba para verificar la inicialización del componente
  it('should initialize with null model', () => {
    expect(component._model).toBeNull();
    expect(component.displayValue).toBe('');
  });

  // Prueba para método writeValue
  it('should update model when writeValue is called with valid date', () => {
    const testDate = { year: 2023, month: 5, day: 15 };
    component.writeValue(testDate);

    expect(component._model).toEqual(testDate);
    expect(component.displayValue).not.toBe('');
  });

  // Prueba para método writeValue con null
  it('should clear model when writeValue is called with null', () => {
    // Primero establecemos un valor
    component.writeValue({ year: 2023, month: 5, day: 15 });

    // Luego lo limpiamos con null
    component.writeValue(null);

    expect(component._model).toBeNull();
    expect(component.displayValue).toBe('');
  });

  // Prueba para setDisabledState
  it('should update disabled state when setDisabledState is called', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.disabled).toBe(false);
  });

  // Prueba para onDateSelect
  it('should update model and notify on date select', () => {
    // Espiar la función onChange
    spyOn(component, 'onChange');
    spyOn(component, 'onTouched');

    const testDate = { year: 2023, month: 5, day: 15 };
    component.onDateSelect(testDate);

    expect(component._model).toEqual(testDate);
    expect(component.onChange).toHaveBeenCalled();
    expect(component.onTouched).toHaveBeenCalled();
  });

  // Prueba para verificar el procesamiento de diferentes formatos de fecha
  it('should process date input correctly', () => {
    // ISO string
    const isoDate = '2023-05-15';
    component.writeValue(isoDate);
    expect(component._model).toEqual({ year: 2023, month: 5, day: 15 });

    // Date object
    const dateObj = new Date(2023, 4, 15); // Mayo es 4 en JavaScript Date
    component.writeValue(dateObj);
    expect(component._model).toEqual({ year: 2023, month: 5, day: 15 });
  });

  // Prueba para verificar la validación de fecha
  it('should validate date correctly', () => {
    // Configurar fechas mínima y máxima
    component.minDate = { year: 2023, month: 1, day: 1 };
    component.maxDate = { year: 2023, month: 12, day: 31 };

    // Fecha dentro del rango
    const validDate = { year: 2023, month: 6, day: 15 };
    expect(component.isDateValid(validDate)).toBe(true);

    // Fecha antes del mínimo
    const beforeMinDate = { year: 2022, month: 12, day: 31 };
    expect(component.isDateValid(beforeMinDate)).toBe(false);

    // Fecha después del máximo
    const afterMaxDate = { year: 2024, month: 1, day: 1 };
    expect(component.isDateValid(afterMaxDate)).toBe(false);
  });

  // Pruebas para onInputChange
  describe('onInputChange', () => {
    beforeEach(() => {
      spyOn(component, 'onChange');
      spyOn(component, 'onTouched');
    });

    it('should update displayValue for any input', () => {
      const testInput = '15/05/2023';
      component.onInputChange(testInput);
      expect(component.displayValue).toBe(testInput);
      expect(component.onTouched).toHaveBeenCalled();
    });

    it('should update model and call onChange when input is a valid date object', () => {
      const testDate = { year: 2023, month: 5, day: 15 };
      component.onInputChange(testDate);

      expect(component._model).toEqual(testDate);
      expect(component.onChange).toHaveBeenCalled();
      expect(component.onTouched).toHaveBeenCalled();
    });

    it('should set model to null when input is null or empty string', () => {
      // Primero establecemos un valor
      component.writeValue({ year: 2023, month: 5, day: 15 });
      expect(component._model).not.toBeNull();

      // Probamos con null
      component.onInputChange(null);
      expect(component._model).toBeNull();
      expect(component.onChange).toHaveBeenCalledWith(null);

      // Restablecemos un valor y probamos con string vacío
      component.writeValue({ year: 2023, month: 5, day: 15 });
      component.onChange.calls.reset();

      component.onInputChange('');
      expect(component._model).toBeNull();
      expect(component.onChange).toHaveBeenCalledWith(null);
    });

    it('should not update model for invalid date inputs', () => {
      // Establecemos un valor inicial
      const initialDate = { year: 2023, month: 5, day: 15 };
      component.writeValue(initialDate);
      component.onChange.calls.reset();

      // Cadena de texto que no es un objeto de fecha
      component.onInputChange('texto inválido');

      // El modelo no debe actualizarse
      expect(component._model).toEqual(initialDate);
      expect(component.onChange).not.toHaveBeenCalled();
      expect(component.onTouched).toHaveBeenCalled();
    });

    it('should validate date against min/max constraints', () => {
      // Configurar fechas mínima y máxima
      component.minDate = { year: 2023, month: 1, day: 1 };
      component.maxDate = { year: 2023, month: 12, day: 31 };
      component.onChange.calls.reset();

      // Fecha fuera de rango
      const invalidDate = { year: 2022, month: 5, day: 15 };
      component.onInputChange(invalidDate);

      // Como displayValue puede ser diferente al objeto original (debido al formateo),
      // solo verificamos que se ha actualizado a algún valor
      expect(component._model).not.toEqual(invalidDate);
      expect(component.onChange).not.toHaveBeenCalled();
    });
  });
});

describe('CustomDateParserFormatter', () => {
  let formatter: CustomDateParserFormatter;
  let localizationServiceMock: jasmine.SpyObj<LocalizationService> & {
    currentLang$: BehaviorSubject<string>;
  };

  beforeEach(() => {
    // Crear un spy para LocalizationService con currentLang$
    const spy = jasmine.createSpyObj('LocalizationService', ['getCurrentLanguage']);
    spy.currentLang$ = new BehaviorSubject<string>('es');
    localizationServiceMock = spy;

    // Crear la instancia de CustomDateParserFormatter
    formatter = new CustomDateParserFormatter(localizationServiceMock);
  });

  it('should create an instance', () => {
    expect(formatter).toBeTruthy();
  });

  describe('parse', () => {
    it('should return null for null or empty input', () => {
      expect(formatter.parse(null)).toBeNull();
      expect(formatter.parse('')).toBeNull();
      expect(formatter.parse('  ')).toBeNull();
    });

    it('should parse date in Spanish format (DD/MM/YYYY)', () => {
      localizationServiceMock.currentLang$.next('es');

      const result = formatter.parse('15/05/2023');

      const expected: NgbDateStruct = { day: 15, month: 5, year: 2023 };
      expect(result).toEqual(expected);
    });

    it('should parse date in English format (MM/DD/YYYY)', () => {
      localizationServiceMock.currentLang$.next('en');

      const result = formatter.parse('05/15/2023');

      const expected: NgbDateStruct = { day: 15, month: 5, year: 2023 };
      expect(result).toEqual(expected);
    });

    it('should return null for invalid date format', () => {
      expect(formatter.parse('not-a-date')).toBeNull();
      expect(formatter.parse('2023-05-15')).toBeNull(); // No soporta formato ISO
      expect(formatter.parse('15-05-2023')).toBeNull(); // Usa delimitador incorrecto
    });

    it('should return null for dates with invalid numbers', () => {
      expect(formatter.parse('aa/bb/cccc')).toBeNull();
      expect(formatter.parse('15/05/abcd')).toBeNull();
    });

    it('should return null for dates with invalid month or day values', () => {
      expect(formatter.parse('32/05/2023')).toBeNull(); // Día inválido
      expect(formatter.parse('15/13/2023')).toBeNull(); // Mes inválido
    });
  });

  describe('format', () => {
    it('should return empty string for null input', () => {
      expect(formatter.format(null)).toBe('');
    });

    it('should format date in Spanish format (DD/MM/YYYY)', () => {
      localizationServiceMock.currentLang$.next('es');

      const date: NgbDateStruct = { day: 15, month: 5, year: 2023 };
      const result = formatter.format(date);

      expect(result).toBe('15/05/2023');
    });

    it('should format date in English format (MM/DD/YYYY)', () => {
      localizationServiceMock.currentLang$.next('en');

      const date: NgbDateStruct = { day: 15, month: 5, year: 2023 };
      const result = formatter.format(date);

      expect(result).toBe('05/15/2023');
    });

    it('should pad single digit day and month with zeros', () => {
      localizationServiceMock.currentLang$.next('es');

      const date: NgbDateStruct = { day: 5, month: 6, year: 2023 };
      const result = formatter.format(date);

      expect(result).toBe('05/06/2023');
    });
  });
});

describe('CustomDatepickerI18n', () => {
  let i18n: CustomDatepickerI18n;
  let localizationServiceMock: any;

  beforeEach(() => {
    // Crear mock del servicio de localización
    localizationServiceMock = {
      getCurrentLanguage: jasmine.createSpy('getCurrentLanguage').and.returnValue('es'),
    };

    // Crear la instancia a probar
    i18n = new CustomDatepickerI18n(localizationServiceMock);
  });

  it('should create an instance', () => {
    expect(i18n).toBeTruthy();
  });

  describe('getWeekdayLabel', () => {
    it('should return correct weekday label in Spanish', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('es');
      expect(i18n.getWeekdayLabel(1)).toBe('Lu');
      expect(i18n.getWeekdayLabel(7)).toBe('Do');
    });

    it('should return correct weekday label in English', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('en');
      expect(i18n.getWeekdayLabel(1)).toBe('Mo');
      expect(i18n.getWeekdayLabel(7)).toBe('Su');
    });
  });

  describe('getMonthShortName', () => {
    it('should return correct short month name in Spanish', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('es');
      expect(i18n.getMonthShortName(1)).toBe('Ene');
      expect(i18n.getMonthShortName(12)).toBe('Dic');
    });

    it('should return correct short month name in English', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('en');
      expect(i18n.getMonthShortName(1)).toBe('Jan');
      expect(i18n.getMonthShortName(12)).toBe('Dec');
    });
  });

  describe('getMonthFullName', () => {
    it('should return correct full month name in Spanish', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('es');
      expect(i18n.getMonthFullName(1)).toBe('Enero');
      expect(i18n.getMonthFullName(12)).toBe('Diciembre');
    });

    it('should return correct full month name in English', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('en');
      expect(i18n.getMonthFullName(1)).toBe('January');
      expect(i18n.getMonthFullName(12)).toBe('December');
    });
  });

  describe('getDayAriaLabel', () => {
    it('should format date correctly for aria label in Spanish', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('es');
      const date: NgbDateStruct = { year: 2023, month: 5, day: 15 };
      expect(i18n.getDayAriaLabel(date)).toBe('15 Mayo 2023');
    });

    it('should format date correctly for aria label in English', () => {
      localizationServiceMock.getCurrentLanguage.and.returnValue('en');
      const date: NgbDateStruct = { year: 2023, month: 5, day: 15 };
      expect(i18n.getDayAriaLabel(date)).toBe('15 May 2023');
    });
  });
});
