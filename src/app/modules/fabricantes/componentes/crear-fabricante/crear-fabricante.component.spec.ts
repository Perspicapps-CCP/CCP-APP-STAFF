import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearFabricanteComponent } from './crear-fabricante.component';

describe('CrearFabricanteComponent', () => {
  let component: CrearFabricanteComponent;
  let fixture: ComponentFixture<CrearFabricanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearFabricanteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearFabricanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
