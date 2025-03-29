import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarBodegaComponent } from './agregar-bodega.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('AgregarBodegaComponent', () => {
  let component: AgregarBodegaComponent;
  let fixture: ComponentFixture<AgregarBodegaComponent>;

  beforeEach(async () => {
    const matDialogRefMock = {
      close: jasmine.createSpy('close')
    };


    await TestBed.configureTestingModule({
      imports: [AgregarBodegaComponent],
      providers: [
        { provide: MatDialogRef, useValue: matDialogRefMock },
      ],
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
