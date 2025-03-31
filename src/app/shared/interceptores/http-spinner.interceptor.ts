import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs';
import { SpinnerService } from '../servicios/spinner.service';
import { inject } from '@angular/core';

export const httpSpinnerInterceptor: HttpInterceptorFn = (req, next) => {
  const spinnerService = inject(SpinnerService);

  spinnerService.show();

  return next(req).pipe(
    finalize(() => {
      spinnerService.hide();
    }),
  );
};
