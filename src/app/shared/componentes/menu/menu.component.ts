import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { sharedImports } from '../../otros/shared-imports';
import { MenuItem } from '../../modelos/menu-item.interface';
import { MatMenuModule } from '@angular/material/menu';
import { LocalizationService } from '../../servicios/localization.service';
import { LanguageConfig } from '../../modelos/LanguajeConfig.interface';
import { Router } from '@angular/router';
import { LoginService } from '../../../modules/auth/servicios/login.service';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, sharedImports, MatMenuModule,],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent {
  menuItems: MenuItem[] = [
    {
      nombre: 'MENU.RUTAS',
      icono: 'delivery_truck_speed',
      url: '/home/rutas',
    },
    {
      nombre: 'MENU.BODEGAS',
      icono: 'gite',
      url: '/home/bodegas'
    },
    {
      nombre: 'MENU.FABRICANTES',
      icono: 'factory',
      url: '/home/fabricantes'
    },
    {
      nombre: 'MENU.VENDEDORES',
      icono: 'person',
      url: '/home/vendedores'
    },
    {
      nombre: 'MENU.PLANES',
      icono: 'checklist',
      url: '/home/planes'
    },
    {
      nombre: 'MENU.PRODUCTOS',
      icono: 'shopping_cart',
      url: '/home/productos'
    },
    {
      nombre: 'MENU.VENTAS',
      icono: 'price_change',
      url: '/home/ventas'
    }
  ]

  lenguajesDisponibles: LanguageConfig[] = [];

  constructor(
    private localizationService: LocalizationService,
    private router: Router,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.lenguajesDisponibles = this.localizationService.availableLanguages;
  }

  cambiarIdioma(lenguaje: LanguageConfig) {
    if (lenguaje && lenguaje.localeCode) {
      this.localizationService.setLocale(lenguaje.localeCode);
      // window.location.reload();
    }
  }

  cerrarSesion() {
    this.loginService.cerrarSesion();
  }
}
