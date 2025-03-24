import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LocalizationService } from './shared/servicios/localization.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, NgxSpinnerModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(private localizationService: LocalizationService) { }
  title = 'ccp-project';
}
