import { CanActivateChildFn } from '@angular/router';

export const validateTokenGuard: CanActivateChildFn = (childRoute, state) => {
  return true;
};
