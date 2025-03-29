import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearPlanVentaComponent } from './crear-plan-venta.component';

describe('CrearPlanVentaComponent', () => {
  let component: CrearPlanVentaComponent;
  let fixture: ComponentFixture<CrearPlanVentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPlanVentaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearPlanVentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
