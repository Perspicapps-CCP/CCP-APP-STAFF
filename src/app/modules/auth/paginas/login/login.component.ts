import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { merge, Observable, OperatorFunction, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { LanguageConfig } from '../../../../shared/modelos/LanguajeConfig.interface';
import { sharedImports } from '../../../../shared/otros/shared-imports';
import { LocalizationService } from '../../../../shared/servicios/localization.service';
import { LocalDatePipe } from '../../../../shared/pipes/local-date.pipe';
import { LocalCurrencyPipe } from '../../../../shared/pipes/local-currency.pipe';
@Component({
  selector: 'app-login',
  imports: [
    ...sharedImports,
    LocalDatePipe,
    LocalCurrencyPipe,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  selectedConfig: LanguageConfig | null = null;
  availableLanguages: LanguageConfig[] = [];
  selectedLanguage?: string;
  selectedLocale?: string;
  // Suscripciones
  private langSubscription: Subscription | undefined;
  private localeSubscription: Subscription | undefined;

  currentDate = new Date();
  sampleAmount = 1234567.89;

  @ViewChild('instance', { static: true }) instance!: NgbTypeahead;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  constructor(public localizationService: LocalizationService) {
    this.availableLanguages = this.localizationService.getAllAvailableLanguages();
    this.selectedLanguage = this.localizationService.getCurrentLanguage();
    this.selectedConfig = this.localizationService.getCurrentLocalization();
  }

  search: OperatorFunction<string, readonly { name: any }[]> = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map((term) =>
        term === '' ? this.availableLanguages : this.availableLanguages.filter((v) => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
  }

  formatter = (x: { name: string }) => x.name;

  ngOnInit() {
    // Suscribirse a cambios de idioma
    this.langSubscription = this.localizationService.currentLang$.subscribe(lang => {
      this.selectedLanguage = lang;
      console.log('Idioma actualizado:', lang);
    });

    this.localeSubscription = this.localizationService.currentLocale$.subscribe(locale => {
      this.selectedLocale = locale;
      console.log('Locale actualizado:', locale);
    });
  }

  ngOnDestroy() {
    // Limpieza de suscripciones
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    if (this.localeSubscription) {
      this.localeSubscription.unsubscribe();
    }
  }

  // Método para cambiar el idioma/localización
  changeLanguage(config: LanguageConfig) {
    console.log("Configuración seleccionada:", config);
    if (config && config.localeCode) {
      // Aplicamos el cambio usando el localeCode
      this.localizationService.setLocale(config.localeCode);
    }
  }
}
