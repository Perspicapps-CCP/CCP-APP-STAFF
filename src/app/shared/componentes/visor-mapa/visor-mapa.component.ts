import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatDialogRef } from '@angular/material/dialog';
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
  coordinates = [
    {
      latitude: 4.74930910765156,
      longitude: -74.0582970143239,
      title: 'Punto de inicio',
      description: 'Inicio del recorrido',
    },
    {
      latitude: 4.7230972958661175,
      longitude: -74.06218528747559,
      title: 'Parada 1',
      description: 'Primera parada del recorrido',
    },
    {
      latitude: 4.685886914787581,
      longitude: -74.05663870062597,
      title: 'Parada 2',
      description: 'Segunda parada del recorrido',
    },
    {
      latitude: 4.663475884510695,
      longitude: -74.07607819642413,
      title: 'Parada 3',
      description: 'Tercera parada del recorrido',
    },
    {
      latitude: 4.645707804636481,
      longitude: -74.10965904880698,
      title: 'Parada 4',
      description: 'Cuarta parada del recorrido',
    },
    {
      latitude: 4.661203248163977,
      longitude: -74.11774332808432,
      title: 'Parada 5',
      description: 'Quinta parada del recorrido',
    },
    {
      latitude: 4.679797329289391,
      longitude: -74.13722851403492,
      title: 'Parada 6',
      description: 'Sexta parada del recorrido',
    },
    {
      latitude: 4.699630471327888,
      longitude: -74.14013056300627,
      title: 'Parada 7',
      description: 'Séptima parada del recorrido',
    },
    {
      latitude: 4.683170713690966,
      longitude: -74.11655902862549,
      title: 'Destino final',
      description: 'Fin del recorrido',
    },
  ];

  apiLoaded = false;
  center: google.maps.LatLngLiteral = { lat: 0, lng: 0 };
  zoom = 2;
  markers: any[] = [];
  infoWindows: google.maps.InfoWindow[] = [];
  map!: google.maps.Map;
  directionsResults: google.maps.DirectionsResult | null = null;
  // Almacenar las coordenadas actualizadas según la ruta calculada
  routeCoordinates: { latitude: number; longitude: number; title: string; description: string }[] =
    [];

  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'roadmap',
    disableDefaultUI: false,
    zoomControl: true,
    scrollwheel: true,
    fullscreenControl: true,
  };

  directionsOptions: google.maps.DirectionsRendererOptions = {
    suppressMarkers: true, // Suprimimos los marcadores predeterminados para usar los nuestros
    polylineOptions: {
      strokeColor: '#0f53ff',
      strokeOpacity: 1.0,
      strokeWeight: 7,
    },
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

  // Almacenar la biblioteca de marcadores
  markerLibrary: any = null;

  loadGoogleMapsApi(): Promise<void> {
    return new Promise(resolve => {
      if (typeof google === 'object' && typeof google.maps === 'object') {
        // Si ya está cargado, inmediatamente resolvemos
        google.maps.importLibrary('marker').then(lib => {
          this.markerLibrary = lib;
          resolve();
        });
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Cuando se carga el script, importamos la biblioteca de marcadores
        google.maps.importLibrary('marker').then(lib => {
          this.markerLibrary = lib;
          resolve();
        });
      };
      document.head.appendChild(script);
    });
  }

  onMapInitialized(map: google.maps.Map) {
    this.map = map;
    // No creamos los marcadores aquí, esperamos a que la ruta se calcule

    // Asegurarse de que tenemos la biblioteca de marcadores cargada
    if (!this.markerLibrary) {
      google.maps.importLibrary('marker').then(lib => {
        this.markerLibrary = lib;
      });
    }
  }

  createCustomMarkers() {
    if (!this.map) return;

    // Asegurarse de que tenemos la biblioteca de marcadores
    if (!this.markerLibrary) {
      // Si aún no está cargada, lo intentamos más tarde
      google.maps.importLibrary('marker').then(lib => {
        this.markerLibrary = lib;
        this.createCustomMarkers(); // Volver a intentar
      });
      return;
    }

    // Limpiar marcadores anteriores
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
    this.infoWindows = [];

    // Usamos las coordenadas ajustadas a la ruta en lugar de las originales
    const coordsToUse = this.routeCoordinates.length > 0 ? this.routeCoordinates : this.coordinates;

    // Crear nuevos marcadores
    coordsToUse.forEach((coord, index) => {
      const isFirst = index === 0;
      const isLast = index === coordsToUse.length - 1;

      // Crear marcador usando el nuevo método recomendado
      const marker = new this.markerLibrary.Marker({
        position: { lat: coord.latitude, lng: coord.longitude },
        map: this.map,
        title: coord.title || `Parada ${index + 1}`,
        icon: {
          path: 'M480-360q56 0 101-27.5t71-72.5q-35-29-79-44.5T480-520q-49 0-93 15.5T308-460q26 45 71 72.5T480-360Zm0-200q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0 374q122-112 181-203.5T720-552q0-109-69.5-178.5T480-800q-101 0-170.5 69.5T240-552q0 71 59 162.5T480-186Zm0 106Q319-217 239.5-334.5T160-552q0-150 96.5-239T480-880q127 0 223.5 89T800-552q0 100-79.5 217.5T480-80Zm0-480Z',
          fillColor: isFirst ? '#4CAF50' : isLast ? '#FF5722' : '#4285F4', // Color diferente según el tipo de punto
          fillOpacity: 1,
          strokeWeight: 0,
          scale: 0.05,
          anchor: new google.maps.Point(500, 20),
        },
      });

      // Crear contenido HTML personalizado para el InfoWindow
      const contentString = `
        <div class="custom-info-window">
          <h3>${coord.title || `Parada ${index + 1}`}</h3>
          <p>${coord.description || 'Sin descripción'}</p>
          <p>Coordenadas: ${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}</p>
          <div class="info-actions">
            <button class="info-btn info-btn-primary">Más información</button>
            <button class="info-btn">Cerrar</button>
          </div>
        </div>
      `;

      // Crear InfoWindow personalizado
      const infoWindow = new google.maps.InfoWindow({
        content: contentString,
        maxWidth: 300,
        ariaLabel: coord.title,
        headerDisabled: true,
      });

      // Evento para abrir InfoWindow al hacer clic en el marcador
      marker.addListener('click', () => {
        // Cerrar todos los InfoWindows abiertos
        this.infoWindows.forEach(window => window.close());
        // Abrir el InfoWindow actual
        infoWindow.open({
          anchor: marker,
          map: this.map,
        });
      });

      // Evento para los botones dentro del InfoWindow
      google.maps.event.addListener(infoWindow, 'domready', () => {
        // Botón cerrar
        const closeButton = document.querySelector('.info-btn:not(.info-btn-primary)');
        if (closeButton) {
          closeButton.addEventListener('click', () => {
            infoWindow.close();
          });
        }

        // Botón más información
        const moreInfoButton = document.querySelector('.info-btn-primary');
        if (moreInfoButton) {
          moreInfoButton.addEventListener('click', () => {
            console.log(`Mostrar más información de: ${coord.title}`);
            // Implementación de acción adicional
            alert(`Más información sobre: ${coord.title}`);
          });
        }
      });

      // Guardar referencias
      this.markers.push(marker);
      this.infoWindows.push(infoWindow);
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

      // Calcular la ruta real utilizando el servicio de direcciones
      this.calculateRoute();

      // Ajustar el zoom automáticamente para ver todas las coordenadas
      this.fitBounds();
    } catch (error) {
      console.error('Error al configurar el mapa:', error);
    }
  }

  calculateRoute() {
    if (this.coordinates.length < 2) {
      console.warn('Se necesitan al menos 2 puntos para calcular una ruta');
      return;
    }

    const directionsService = new google.maps.DirectionsService();

    // Preparar el origen, destino y waypoints (puntos intermedios)
    const origin = {
      lat: this.coordinates[0].latitude,
      lng: this.coordinates[0].longitude,
    };

    const destination = {
      lat: this.coordinates[this.coordinates.length - 1].latitude,
      lng: this.coordinates[this.coordinates.length - 1].longitude,
    };

    // Los waypoints son todos los puntos intermedios (entre el origen y el destino)
    const waypoints = this.coordinates.slice(1, this.coordinates.length - 1).map(coord => ({
      location: new google.maps.LatLng(coord.latitude, coord.longitude),
      stopover: true,
    }));

    // Configurar la solicitud de ruta
    const request: google.maps.DirectionsRequest = {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: false, // mantener el orden exacto de los puntos
      travelMode: google.maps.TravelMode.DRIVING, // podría ser WALKING, BICYCLING, TRANSIT
    };

    // Realizar la solicitud de ruta
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsResults = result;
        console.log('Ruta calculada con éxito', result);

        // Extraer las coordenadas de la ruta calculada
        if (result) {
          this.extractRouteCoordinates(result);
        }

        // Crear marcadores con las coordenadas actualizadas
        this.createCustomMarkers();

        // Ajustar el centro y zoom basado en el bounds de la ruta
        if (result?.routes?.[0]?.bounds) {
          const bounds = result.routes[0].bounds;
          const center = bounds.getCenter();
          this.center = { lat: center.lat(), lng: center.lng() };
        }
      } else {
        console.error('Error al calcular la ruta:', status);
        // Si falla el cálculo de ruta, caemos de nuevo a mostrar los marcadores originales
        alert(
          'No se pudo calcular la ruta por carreteras. Se mostrarán los marcadores en las posiciones originales.',
        );
        this.createCustomMarkers(); // Usará las coordenadas originales
      }
    });
  }

  // Método para extraer las coordenadas de la ruta calculada
  extractRouteCoordinates(result: google.maps.DirectionsResult) {
    // Reiniciamos el array
    this.routeCoordinates = [];

    if (!result.routes || result.routes.length === 0) {
      return;
    }

    const route = result.routes[0];

    // El origen siempre es el primer punto
    const startLeg = route.legs[0];
    this.routeCoordinates.push({
      latitude: startLeg.start_location.lat(),
      longitude: startLeg.start_location.lng(),
      title: this.coordinates[0].title,
      description: this.coordinates[0].description,
    });

    // Recorremos todas las legs para obtener los waypoints
    route.legs.forEach((leg, index) => {
      // Si no es la última leg, agregamos el punto final como waypoint
      if (index < route.legs.length - 1) {
        this.routeCoordinates.push({
          latitude: leg.end_location.lat(),
          longitude: leg.end_location.lng(),
          title: this.coordinates[index + 1].title,
          description: this.coordinates[index + 1].description,
        });
      }
    });

    // El destino es el último punto de la última leg
    const lastLeg = route.legs[route.legs.length - 1];
    this.routeCoordinates.push({
      latitude: lastLeg.end_location.lat(),
      longitude: lastLeg.end_location.lng(),
      title: this.coordinates[this.coordinates.length - 1].title,
      description: this.coordinates[this.coordinates.length - 1].description,
    });

    console.log('Coordenadas extraídas de la ruta:', this.routeCoordinates);
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

      // Calculamos la distancia aproximada
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

      console.log('Zoom calculado:', this.zoom);
    } catch (error) {
      console.error('Error al ajustar los límites del mapa:', error);
      // En caso de error, establecer un zoom seguro por defecto
      this.zoom = 5;
    }
  }
}
