import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Login } from '../login';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api';

@Component({
  selector: 'app-providers',
  imports: [CommonModule, LucideModule, LucideAngularModule,FormsModule,RouterLink,FormsModule],
  templateUrl: './providers.html',
  styleUrl: './providers.scss',
})
export class Providers implements OnInit {
 
  _api = inject(ApiService);
  showWizard = false;
  providers: any[] = [
    { name: 'Lucid',         panelId: 'LUC1', region: 'Global',         status: 'active' },
    { name: 'Cint',          panelId: 'CNT1', region: 'Global',         status: 'active' },
    { name: 'Dynata',        panelId: 'DYN1', region: 'North America',  status: 'active' },
    { name: 'PureSpectrum',  panelId: 'PS01', region: 'Global',         status: 'degraded' },
    { name: 'Toluna',        panelId: 'TOL1', region: 'Europe',         status: 'inactive' },
  ];

  statusLabel(status: any): any {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'degraded': return 'Degraded';
    }
  }

  statusClass(status: any): any {
    switch (status) {
      case 'active':
        return 'inline-block px-3 py-1 text-sm bg-neutral-700 text-white';
      case 'inactive':
        return 'inline-block px-3 py-1 text-sm bg-neutral-300 text-neutral-700';
      case 'degraded':
        return 'inline-block px-3 py-1 text-sm bg-neutral-700 text-white';
    }
  }

  apiIcon(status: any): any {
    switch (status) {
      case 'active':   return 'circle-check-big';
      case 'degraded': return 'circle-x';
      case 'inactive': return ''; // plain dot
    }
  }

  apiText(status: any): any {
    switch (status) {
      case 'active':   return 'Healthy';
      case 'degraded': return 'Degraded';
      case 'inactive': return 'Unknown';
    }
  }
  steps = [
  { step: 1, label: 'Basic Info', active: true },
  { step: 2, label: 'API Credentials', active: false },
  { step: 3, label: 'Parameters', active: false },
  { step: 4, label: 'Redirects', active: false },
  { step: 5, label: 'Test', active: false },
];

regions = ['Global', 'North America', 'Europe', 'APAC'];
region:any = '';
selectedRegion = '';
currentStep = 1;

 ngOnInit(): void {
   this.getRegions(); 
  }

addPanel() {
  this.showWizard = true;
}

onFinish() {
  if(this.currentStep == 5){
    console.log("this.currentStep == 5");
 
  }
  // final submit or switch to table, etc.
  this.showWizard = false;
  this.currentStep = 1;


}
getRegions() {
  this._api.get('regions').subscribe((res: any) => {
    this.region = res.data;
    console.log("resoin",this.region);
    
  })
}

}



