import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from '../../../../shared/componentes/menu/menu.component';
import { HeaderComponent } from '../../../../shared/componentes/header/header.component';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, CommonModule, MenuComponent, HeaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {

}
