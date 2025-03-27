import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProductoFabricanteComponent } from './agregar-producto-fabricante.component';

describe('AgregarProductoFabricanteComponent', () => {
  let component: AgregarProductoFabricanteComponent;
  let fixture: ComponentFixture<AgregarProductoFabricanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarProductoFabricanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarProductoFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
