import {
  Component,
  Injectable,
  OnDestroy,
  OnInit,
  forwardRef,
  Input,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import {
  NgbDatepickerConfig,
  NgbDatepickerI18n,
  NgbDatepickerModule,
  NgbDateStruct,
  NgbDateParserFormatter,
  NgbInputDatepicker,
} from '@ng-bootstrap/ng-bootstrap';
import { LocalizationService } from '../../servicios/localization.service';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { sharedImports } from '../../otros/shared-imports';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

// Formateador personalizado para las fechas según el idioma
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  private readonly DELIMITER = {
    es: '/',
    en: '/',
  };

  private currentLang: 'es' | 'en' = 'es';

  constructor(private localizationService: LocalizationService) {
    super();
    this.localizationService.currentLang$.subscribe(lang => {
      if (lang === 'es' || lang === 'en') {
        this.currentLang = lang;
      }
    });
  }

  parse(value: string | null): NgbDateStruct | null {
    // Verificar que value sea un string
    if (!value || typeof value !== 'string') return null;

    // Ahora podemos usar trim() con seguridad
    const trimmedValue = value.trim();
    if (trimmedValue === '') return null;

    const delimiter = this.DELIMITER[this.currentLang];
    const parts = trimmedValue.split(delimiter);

    if (parts.length !== 3) return null;

    let day: number;
    let month: number;
    let year: number;

    if (this.currentLang === 'es') {
      // Para español: DD/MM/YYYY
      day = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    } else {
      // Para inglés: MM/DD/YYYY
      month = parseInt(parts[0], 10);
      day = parseInt(parts[1], 10);
      year = parseInt(parts[2], 10);
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null;
    }

    // Validar que sea una fecha válida
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }

    return { day, month, year };
  }

  format(date: NgbDateStruct | null): string {
    if (!date) return '';

    const delimiter = this.DELIMITER[this.currentLang];

    if (this.currentLang === 'es') {
      // Para español: DD/MM/YYYY
      return `${date.day.toString().padStart(2, '0')}${delimiter}${date.month.toString().padStart(2, '0')}${delimiter}${date.year}`;
    } else {
      // Para inglés: MM/DD/YYYY
      return `${date.month.toString().padStart(2, '0')}${delimiter}${date.day.toString().padStart(2, '0')}${delimiter}${date.year}`;
    }
  }
}
@Injectable()
export class CustomDatepickerI18n extends NgbDatepickerI18n {
  private WEEKDAYS: Record<string, string[]> = {
    es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'],
    en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  };
  private MONTHS: Record<string, string[]> = {
    es: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };

  constructor(private localizationService: LocalizationService) {
    super();
  }

  getWeekdayLabel(weekday: number): string {
    const currentLang = this.localizationService.getCurrentLanguage();
    return this.WEEKDAYS[currentLang][weekday - 1];
  }

  getMonthShortName(month: number): string {
    const currentLang = this.localizationService.getCurrentLanguage();
    return this.MONTHS[currentLang][month - 1].substring(0, 3);
  }

  getMonthFullName(month: number): string {
    const currentLang = this.localizationService.getCurrentLanguage();
    return this.MONTHS[currentLang][month - 1];
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    const currentLang = this.localizationService.getCurrentLanguage();
    return `${date.day} ${this.getMonthFullName(date.month)} ${date.year}`;
  }
}

@Component({
  selector: 'app-calendar',
  imports: [sharedImports, NgbDatepickerModule, ReactiveFormsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
})
export class CalendarComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  // Propiedad para el modelo interno
  _model: NgbDateStruct | null = null;
  // Valor de visualización para el input
  displayValue = '';
  // Estado deshabilitado
  disabled = false;
  // Para cancelar suscripciones
  private destroy$ = new Subject<void>();
  // Referencia al datepicker
  @ViewChild('d') private datepicker!: NgbInputDatepicker;
  @ViewChild('dateInput') private dateInput: any;

  // Propiedades para fechas mínima y máxima
  private _minDate: NgbDateStruct | null = null;
  private _maxDate: NgbDateStruct | null = null;

  @Input() set minDate(date: string | Date | NgbDateStruct | null | undefined) {
    this._minDate = this.processDateInput(date ?? null);
  }
  get minDate(): NgbDateStruct | null {
    return this._minDate;
  }

  @Input() set maxDate(date: string | Date | NgbDateStruct | null | undefined) {
    this._maxDate = this.processDateInput(date ?? null);
  }
  get maxDate(): NgbDateStruct | null {
    return this._maxDate;
  }

  // Funciones de ControlValueAccessor
  onChange: any = (_: any) => {
    // Función vacía por defecto, se sobrescribirá en el padre
  };
  onTouched: any = () => {
    // Función vacía por defecto, se sobrescribirá en el padre
  };

  constructor(
    private localizationService: LocalizationService,
    private translateService: TranslateService,
    private config: NgbDatepickerConfig,
    private formatter: NgbDateParserFormatter,
    private cdr: ChangeDetectorRef,
  ) {
    config.firstDayOfWeek = 1; // Lunes por defecto
  }

  ngOnInit(): void {
    // Suscribirse a cambios de idioma
    this.localizationService.currentLang$.pipe(takeUntil(this.destroy$)).subscribe(lang => {
      // Actualizar primer día de la semana
      this.config.firstDayOfWeek = lang === 'es' ? 1 : 0;

      // Actualizar visualización si hay modelo
      if (this._model) {
        this.displayValue = this.formatter.format(this._model);
        this.cdr.markForCheck();
      }
    });
  }

  ngAfterViewInit(): void {
    // Configurar datepicker
    setTimeout(() => {
      if (this.datepicker) {
        if (this._minDate) this.datepicker.minDate = this._minDate;
        if (this._maxDate) this.datepicker.maxDate = this._maxDate;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Procesar diferentes formatos de fecha de entrada
  private processDateInput(date: string | Date | NgbDateStruct | null): NgbDateStruct | null {
    if (!date) return null;

    if (typeof date === 'string') {
      // Formato ISO (YYYY-MM-DD)
      if (date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) {
          return {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2]),
          };
        }
      }
      return this.formatter.parse(date);
    } else if (date instanceof Date) {
      return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
      };
    } else if (typeof date === 'object' && 'year' in date && 'month' in date && 'day' in date) {
      return date;
    }
    return null;
  }

  // Verificar validez de fecha
  isDateValid(date: NgbDateStruct): boolean {
    if (!date) return false;

    // Función para comparar fechas
    const compareDate = (
      d1: NgbDateStruct | null,
      d2: NgbDateStruct | null,
      operator: 'lt' | 'gt',
    ): boolean => {
      if (!d1 || !d2) return true;

      if (d1.year !== d2.year) {
        return operator === 'lt' ? d1.year < d2.year : d1.year > d2.year;
      }
      if (d1.month !== d2.month) {
        return operator === 'lt' ? d1.month < d2.month : d1.month > d2.month;
      }
      return operator === 'lt' ? d1.day < d2.day : d1.day > d2.day;
    };

    const isAfterMinDate = !this._minDate || compareDate(date, this._minDate, 'gt');
    const isBeforeMaxDate = !this._maxDate || compareDate(date, this._maxDate, 'lt');

    return isAfterMinDate && isBeforeMaxDate;
  }

  // Convertir fecha a ISO
  private dateToIso(date: NgbDateStruct): string {
    return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
  }

  // ControlValueAccessor Methods
  writeValue(value: any): void {
    if (value) {
      const date = this.processDateInput(value);
      if (date) {
        this._model = date;
        this.displayValue = this.formatter.format(date);
      } else {
        this._model = null;
        this.displayValue = '';
      }
    } else {
      this._model = null;
      this.displayValue = '';
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  // Manejar selección de fecha desde el calendario
  onDateSelect(date: NgbDateStruct): void {
    if (!this.isDateValid(date)) return;

    this._model = date;
    this.displayValue = this.formatter.format(date);

    // IMPORTANTE: Notificar cambio al formulario padre en ISO
    const isoDate = this.dateToIso(date);
    this.onChange(isoDate);
    this.onTouched();
    this.cdr.markForCheck();
  }

  // Manejar cambios en el input
  onInputChange(value: any): void {
    // CLAVE: Siempre actualizar visualización
    this.displayValue = value;

    // IMPORTANTE: Solo emitir cuando es un objeto fecha completo
    if (
      value &&
      typeof value === 'object' &&
      'year' in value &&
      'month' in value &&
      'day' in value
    ) {
      if (this.isDateValid(value)) {
        this._model = value;
        const isoDate = this.dateToIso(value);
        this.onChange(isoDate);
      }
    } else if (value === null || value === '') {
      // Caso especial: campo vacío
      this._model = null;
      this.onChange(null);
    }
    // No hacer nada con strings parciales

    this.onTouched();
  }
}
