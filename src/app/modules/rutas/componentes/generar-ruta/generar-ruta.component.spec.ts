import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarRutaComponent } from './generar-ruta.component';

describe('GenerarRutaComponent', () => {
  let component: GenerarRutaComponent;
  let fixture: ComponentFixture<GenerarRutaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarRutaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarRutaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
