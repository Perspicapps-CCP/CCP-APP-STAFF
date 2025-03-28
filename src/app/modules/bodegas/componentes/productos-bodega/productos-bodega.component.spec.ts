import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosBodegaComponent } from './productos-bodega.component';

describe('ProductosBodegaComponent', () => {
  let component: ProductosBodegaComponent;
  let fixture: ComponentFixture<ProductosBodegaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosBodegaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductosBodegaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
