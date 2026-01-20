import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './components/sidebar/sidebar';


@Component({
  standalone: true,
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, Sidebar],
  template: `
    <div class="app-container">
      <app-sidebar></app-sidebar>

      <div class="app-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
})
export class LayoutComponent {}
