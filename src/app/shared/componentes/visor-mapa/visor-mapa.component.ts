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
  readonly coordinates =
    inject<{ latitude: number; longitude: number; title: string; description: string }[]>(
      MAT_DIALOG_DATA,
    );

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
      strokeOpacity: 0.5,
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

    // Definir las rutas a los SVG en los assets (una para cada color)
    const baseSvgPath = 'assets/markers/marcador-client.svg';
    const startSvgPath = 'assets/markers/marcador-warehouse.svg';

    // Función para obtener la ruta del SVG según la posición del marcador
    const getSvgPath = (isFirst: boolean, isLast: boolean) => {
      if (isFirst) return startSvgPath;
      return baseSvgPath;
    };

    // Crear nuevos marcadores
    coordsToUse.forEach((coord, index) => {
      const isFirst = index === 0;
      const isLast = index === coordsToUse.length - 1;

      // Determinar el color basado en la posición del marcador
      const markerColor = isFirst ? '#4CAF50' : isLast ? '#FF5722' : '#4285F4';

      // Obtener la ruta del SVG apropiada según la posición
      const svgPath = getSvgPath(isFirst, isLast);

      // Crear marcador usando el nuevo método recomendado
      const marker = new this.markerLibrary.Marker({
        position: { lat: coord.latitude, lng: coord.longitude },
        map: this.map,
        title: coord.title || `Parada ${index + 1}`,
        icon: {
          url: svgPath,
          scaledSize: new google.maps.Size(32, 38), // Ajusta el tamaño según sea necesario
          anchor: new google.maps.Point(16, 19), // El punto de anclaje (la punta inferior del pin)
        },
      });

      // Crear contenido HTML personalizado para el InfoWindow
      const contentString = `
        <div class="custom-info-window">
          <h3>${coord.title || `Parada ${index + 1}`}</h3>
          <p>phone: ${coord.description || 'Sin descripción'}</p>
          <p>${coord.latitude.toFixed(6)}, ${coord.longitude.toFixed(6)}</p>
          <div class="info-actions">
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

        //   // Botón más información
        //   const moreInfoButton = document.querySelector('.info-btn-primary');
        //   if (moreInfoButton) {
        //     moreInfoButton.addEventListener('click', () => {
        //       console.log(`Mostrar más información de: ${coord.title}`);
        //       // Implementación de acción adicional
        //       alert(`Más información sobre: ${coord.title}`);
        //     });
        //   }
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
