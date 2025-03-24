import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { map } from 'rxjs';
import { Fabricante } from '../interfaces/fabricantes.interface';

@Injectable({
  providedIn: 'root'
})
export class FabricantesService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
  ) { }

  obtenerFabricantes() {
    return this.http.get<Fabricante[]>(`${this.apiUrl}/fabricantes`).pipe(
      map<any, Fabricante[]>((res: any) => {
        return res.data.fabricantes;
      })
    );
  }
}
