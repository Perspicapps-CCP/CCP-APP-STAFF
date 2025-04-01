import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validador para verificar que una fecha no sea menor a la fecha actual
export function noMenorAFechaActual(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // Si no hay valor, no validamos
    }

    // Convertir el valor a una fecha sin considerar la zona horaria
    const fechaSeleccionada = new Date(`${control.value}T00:00:00Z`);
    const fechaActual = new Date();
    fechaActual.setHours(0, 0, 0, 0);

    if (fechaSeleccionada.getTime() < fechaActual.getTime()) {
      return { fechaPasada: true };
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

    // Convertir las fechas a UTC para evitar problemas de zona horaria
    const inicio = new Date(`${fechaInicio}T00:00:00Z`);
    const fin = new Date(`${fechaFin}T00:00:00Z`);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      return { formatoInvalido: true }; // Validar que las fechas sean válidas
    }

    if (fin.getTime() < inicio.getTime()) {
      // Marcamos específicamente el campo end_date como inválido
      group.get('end_date')?.setErrors({ fechaFinMenor: true });
      return { fechaFinMenor: true };
    }

    // Si la validación es exitosa, aseguramos que no mantenga este error específico
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
