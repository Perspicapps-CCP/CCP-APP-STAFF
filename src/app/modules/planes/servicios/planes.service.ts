import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { PlanVenta, PlanVentaPost } from '../interfaces/planes.interface';
import { LocalDatePipe } from '../../../shared/pipes/local-date.pipe';
import { LocalizationService } from '../../../shared/servicios/localization.service';

@Injectable({
  providedIn: 'root',
})
export class PlanesService {
  private apiUrl = environment.apiUrl;
  private localDatePipe: LocalDatePipe;

  constructor(
    private http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localDatePipe = new LocalDatePipe(this.localizationService);
  }

  obtenerPlanes() {
    return this.http.get<PlanVenta>(`${this.apiUrl}/api/v1/sales/plans/`).pipe(
      map<any, any>((res: any) => {
        res.data.planes.forEach((plan: any) => {
          plan.start_date = this.localDatePipe.transform(plan.start_date, undefined, true);
          plan.end_date = this.localDatePipe.transform(plan.end_date, undefined, true);
          plan.goal = plan.goal + '';
        });
        return res;
      }),
      map<any, PlanVenta[]>((res: any) => {
        return res.data.planes;
      }),
    );
  }

  crearPlan(plan: PlanVentaPost) {
    return this.http.post(`${this.apiUrl}/api/v1/sales/plans/`, plan);
  }
}
