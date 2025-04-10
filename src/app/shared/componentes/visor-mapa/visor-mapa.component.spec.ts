import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorMapaComponent } from './visor-mapa.component';

describe('VisorMapaComponent', () => {
  let component: VisorMapaComponent;
  let fixture: ComponentFixture<VisorMapaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorMapaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisorMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
