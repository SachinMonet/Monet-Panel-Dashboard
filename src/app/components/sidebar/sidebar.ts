import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, LucideAngularModule, LucideModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  navItems = [
    { label: 'Dashboard', icon: 'layout-dashboard', route: '/dashboard' },
    { label: 'Panel Providers', icon: 'users', route: '/providers' },
    { label: 'Campaigns', icon: 'folder-kanban', route: '/campaigns' },
    { label: 'Monitoring', icon: 'activity', route: '/monitoring' },
    { label: 'Reports', icon: 'file-text', route: '/reports' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  activeRoute = '/dashboard'; // set initial active route

  constructor(private router: Router) { }

  setActive(route: string) {
    this.activeRoute = route;
    //console.log(route);
    this.router.navigate([route]);

  }
}
