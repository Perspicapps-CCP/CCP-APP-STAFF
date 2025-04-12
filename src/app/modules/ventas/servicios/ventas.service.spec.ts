/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VentasService } from './ventas.service';

describe('Service: Ventas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VentasService]
    });
  });

  it('should ...', inject([VentasService], (service: VentasService) => {
    expect(service).toBeTruthy();
  }));
});
