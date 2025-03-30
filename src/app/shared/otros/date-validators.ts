import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador para verificar que una fecha no sea menor a la fecha actual
export function noMenorAFechaActual(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si no hay valor, no validamos
    }

    const fechaSeleccionada = new Date(control.value);
    // Resetear la hora a 00:00:00 para comparar solo fechas
    fechaSeleccionada.setHours(0, 0, 0, 0);

    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < fechaActual) {
      return { 'fechaPasada': true };
    }

    return null;
  };
}

// Validador para verificar que end_date no sea menor a start_date
export function fechaFinMayorAInicio(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const group = formGroup as FormGroup;
    const fechaInicio = group.get('start_date')?.value;
    const fechaFin = group.get('end_date')?.value;

    if (!fechaInicio || !fechaFin) {
      return null; // Si falta alguna fecha, no validamos
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin < inicio) {
      // Marcamos específicamente el campo end_date como inválido
      group.get('end_date')?.setErrors({ 'fechaFinMenor': true });
      return { 'fechaFinMenor': true };
    }

    // Si la validación es exitosa, aseguramos que no mantenga este error específico
    // (aunque podría tener otros errores)
    const erroresActuales = group.get('end_date')?.errors;
    if (erroresActuales) {
      const { fechaFinMenor, ...otrosErrores } = erroresActuales;
      if (Object.keys(otrosErrores).length > 0) {
        group.get('end_date')?.setErrors(otrosErrores);
      } else {
        group.get('end_date')?.setErrors(null);
      }
    }

    return null;
  };
}
