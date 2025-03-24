import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosFabricanteComponent } from './productos-fabricante.component';

describe('ProductosFabricanteComponent', () => {
  let component: ProductosFabricanteComponent;
  let fixture: ComponentFixture<ProductosFabricanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosFabricanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
