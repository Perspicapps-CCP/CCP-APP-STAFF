import { Injectable } from '@angular/core';
import { Venta, VentaQuery, VentaTabla } from '../interfaces/ventas.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { map, tap } from 'rxjs';
import { LocalizationService } from '../../../shared/servicios/localization.service';
import { LocalDatePipe } from '../../../shared/pipes/local-date.pipe';

@Injectable({
  providedIn: 'root',
})
export class VentasService {
  private readonly apiUrl = environment.apiUrlCCP;
  private localDatePipe: LocalDatePipe;
  private totalVentas = 0;

  constructor(
    private readonly http: HttpClient,
    private localizationService: LocalizationService,
  ) {
    this.localDatePipe = new LocalDatePipe(this.localizationService);
  }

  obtenerVentas(ventaQuery: VentaQuery) {
    const params = Object.entries(ventaQuery)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');

    return this.http.get<VentaTabla[]>(`${this.apiUrl}/api/v1/sales/sales/?${params}`).pipe(
      map<any, VentaTabla[]>((res: any) => {
        const ventas: VentaTabla[] = res.map((venta: any) => ({
          id: venta.id,
          order_number: venta.order_number + '',
          seller_name: venta.seller.full_name,
          created_at: this.localDatePipe.transform(venta.created_at, undefined, true),
          total_value: venta.total_value,
        }));
        return ventas;
      }),
      tap(ventas => {
        this.totalVentas = ventas.reduce(
          (sum, venta) => sum + (parseInt(venta.total_value, 10) || 0),
          0,
        );
      }),
    );
  }

  obtenerUrlDescarga(ventaQuery: VentaQuery): string {
    const params = Object.entries(ventaQuery)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    return `${this.apiUrl}/api/v1/sales/sales/export/?${params}`;
  }

  getTotalVentas(): number {
    return this.totalVentas;
  }
}
