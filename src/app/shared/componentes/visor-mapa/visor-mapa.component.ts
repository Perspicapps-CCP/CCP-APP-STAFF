import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-visor-mapa',
  standalone: true,
  imports: [GoogleMapsModule, CommonModule, TranslateModule],
  templateUrl: './visor-mapa.component.html',
  styleUrl: './visor-mapa.component.scss',
})
export class VisorMapaComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<VisorMapaComponent>);
  // readonly coordinates = inject<{ latitude: number; longitude: number }[]>(MAT_DIALOG_DATA);
  coordinates = [
    {
      latitude: 4.74930910765156,
      longitude: -74.0582970143239,
    },
    {
      latitude: 4.7230972958661175,
      longitude: -74.06218528747559,
    },
    {
      latitude: 4.685886914787581,
      longitude: -74.05663870062597,
    },
    {
      latitude: 4.663475884510695,
      longitude: -74.07607819642413,
    },
    {
      latitude: 4.645707804636481,
      longitude: -74.10965904880698,
    },
    {
      latitude: 4.661203248163977,
      longitude: -74.11774332808432,
    },
    {
      latitude: 4.679797329289391,
      longitude: -74.13722851403492,
    },
    {
      latitude: 4.699630471327888,
      longitude: -74.14013056300627,
    },
    {
      latitude: 4.683170713690966,
      longitude: -74.11655902862549,
    },
  ];

  apiLoaded = false;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 2;
  markers: any[] = [];
  routePath: google.maps.LatLngLiteral[] = [];
  polylineOptions: google.maps.PolylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
  };
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    fullscreenControl: true,
  };

  constructor() {
    console.log('data', this.coordinates);
  }

  ngOnInit() {
    this.loadGoogleMapsApi().then(() => {
      this.apiLoaded = true;
      this.setupMap();
    });
  }

  loadGoogleMapsApi(): Promise<void> {
    return new Promise(resolve => {
      if (typeof google === 'object' && typeof google.maps === 'object') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  setupMap() {
    if (!this.coordinates || this.coordinates.length === 0) {
      console.warn('No hay coordenadas para mostrar');
      return;
    }

    try {
      // Validar coordenadas
      this.coordinates.forEach((coord, index) => {
        if (
          coord.latitude === undefined ||
          coord.longitude === undefined ||
          isNaN(coord.latitude) ||
          isNaN(coord.longitude)
        ) {
          console.error(`Coordenada inválida en el índice ${index}`, coord);
          return;
        }
      });

      // Calcular el centro del mapa (promedio de coordenadas)
      const sumLat = this.coordinates.reduce((sum, coord) => sum + coord.latitude, 0);
      const sumLng = this.coordinates.reduce((sum, coord) => sum + coord.longitude, 0);
      this.center = {
        lat: sumLat / this.coordinates.length,
        lng: sumLng / this.coordinates.length,
      };

      // Crear marcadores para cada parada
      this.markers = this.coordinates.map((coord, index) => {
        return {
          position: {
            lat: coord.latitude,
            lng: coord.longitude,
          },
          label: `${index + 1}`,
          title: `Parada ${index + 1}`,
        };
      });

      // Crear ruta (polyline) - solo conecta los puntos en el orden proporcionado
      // sin conectar el último con el primero
      this.routePath = this.coordinates.map(coord => ({
        lat: coord.latitude,
        lng: coord.longitude,
      }));

      // Ajustar el zoom automáticamente para ver todas las coordenadas
      this.fitBounds();
    } catch (error) {
      console.error('Error al configurar el mapa:', error);
    }
  }

  fitBounds() {
    if (typeof google === 'undefined' || !this.coordinates || this.coordinates.length === 0) return;

    try {
      const bounds = new google.maps.LatLngBounds();

      // Añadir todas las coordenadas al bounds
      for (const coord of this.coordinates) {
        bounds.extend({ lat: coord.latitude, lng: coord.longitude });
      }

      // Obtener el centro desde los límites
      const center = bounds.getCenter();
      this.center = { lat: center.lat(), lng: center.lng() };

      // Establecer un zoom fijo y seguro en lugar de calcularlo
      this.zoom = 5;

      // Si solo hay un punto, usar un zoom más cercano
      if (this.coordinates.length === 1) {
        this.zoom = 10;
      }
      // Si hay más puntos, podemos intentar un cálculo más sencillo
      else if (this.coordinates.length > 1) {
        // Un enfoque más simple que es menos propenso a errores
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Calculamos la distancia aproximada
        const latDiff = Math.abs(ne.lat() - sw.lat());
        const lngDiff = Math.abs(ne.lng() - sw.lng());

        // Usamos el máximo de las diferencias para determinar un zoom apropiado
        const maxDiff = Math.max(latDiff, lngDiff);

        if (maxDiff > 100) this.zoom = 2;
        else if (maxDiff > 50) this.zoom = 3;
        else if (maxDiff > 25) this.zoom = 4;
        else if (maxDiff > 10) this.zoom = 5;
        else if (maxDiff > 5) this.zoom = 6;
        else if (maxDiff > 2) this.zoom = 7;
        else if (maxDiff > 1) this.zoom = 8;
        else if (maxDiff > 0.5) this.zoom = 9;
        else if (maxDiff > 0.2) this.zoom = 10;
        else this.zoom = 11;
      }

      console.log('Zoom calculado:', this.zoom);
    } catch (error) {
      console.error('Error al ajustar los límites del mapa:', error);
      // En caso de error, establecer un zoom seguro por defecto
      this.zoom = 5;
    }
  }
}
