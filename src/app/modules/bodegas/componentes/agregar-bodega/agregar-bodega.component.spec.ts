import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarBodegaComponent } from './agregar-bodega.component';

describe('AgregarBodegaComponent', () => {
  let component: AgregarBodegaComponent;
  let fixture: ComponentFixture<AgregarBodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarBodegaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
