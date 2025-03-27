import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisorImagenesDialogComponent } from './visor-imagenes-dialog.component';

describe('VisorImagenesDialogComponent', () => {
  let component: VisorImagenesDialogComponent;
  let fixture: ComponentFixture<VisorImagenesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisorImagenesDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisorImagenesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
