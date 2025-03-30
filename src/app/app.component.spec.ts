import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { TranslateLoader } from '@ngx-translate/core';
import { LocalizationService } from './shared/servicios/localization.service';

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

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: LocalizationService, useClass: MockLocalizationService },
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
