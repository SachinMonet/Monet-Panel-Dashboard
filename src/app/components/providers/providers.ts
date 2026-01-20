import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { Login } from '../login';

@Component({
  selector: 'app-providers',
  imports: [CommonModule, LucideModule, LucideAngularModule,FormsModule],
  templateUrl: './providers.html',
  styleUrl: './providers.scss',
})
export class Providers {
  searchFilterBykey: any;
  addButton = {
    icon: 'plus',
    label: 'Add Provider'
  };

  filters = {
    searchPlaceholder: 'Search providers...',
    statusOptions: ['All Status', 'Active', 'Pending', 'Inactive']
  };

  providers: ProviderRow[] = [
    {
      name: 'Provider A',
      code: 'PVDR_A',
      status: 'Active',
      statusIcon: 'circle-check-big',
      activeCampaigns: 8,
      totalCompletes: '12,450',
      quality: '94%',
      qualityDot: true,
      avgCpi: '$3.50'
    },
    {
      name: 'Provider B',
      code: 'PVDR_B',
      status: 'Active',
      statusIcon: 'circle-check-big',
      activeCampaigns: 6,
      totalCompletes: '8,920',
      quality: '89%',
      qualityDot: false,
      avgCpi: '$2.80'
    },
    {
      name: 'Provider C',
      code: 'PVDR_C',
      status: 'Pending',
      statusIcon: 'clock',
      activeCampaigns: 0,
      totalCompletes: '0',
      quality: '0%',
      qualityDot: false,
      avgCpi: '$0.00'
    },
    {
      name: 'Provider D',
      code: 'PVDR_D',
      status: 'Active',
      statusIcon: 'circle-check-big',
      activeCampaigns: 5,
      totalCompletes: '6,780',
      quality: '91%',
      qualityDot: true,
      avgCpi: '$3.10'
    },
    {
      name: 'Provider E',
      code: 'PVDR_E',
      status: 'Inactive',
      statusIcon: 'circle-x',
      activeCampaigns: 0,
      totalCompletes: '4,560',
      quality: '85%',
      qualityDot: false,
      avgCpi: '$2.90'
    }
  ];

  actionIcons = ['square-pen', 'EllipsisVertical'] as const;
filteredRows: any
  constructor(private login: Login) {
    this.filteredRows = this.providers
  }

filterByStatus(status: any) {
  status= status.value
  if (status === 'All Status') {
    this.filteredRows = this.providers;
    return;
  }

  this.filteredRows = this.providers.filter(p => p.status === status);
}

  getStatusBadgeClass(status: ProviderRow['status']): string {
    if (status === 'Active') return 'badge badge--green';
    if (status === 'Pending') return 'badge badge--yellow';
    return 'badge badge--gray';
  }

  getStatusIconClass(status: ProviderRow['status']): string {
    if (status === 'Active') return 'icon-status icon-status--green';
    if (status === 'Pending') return 'icon-status icon-status--yellow';
    return 'icon-status icon-status--gray';
  }

  searchFilter(event: any) {
 //console.log(this.searchFilterBykey);
  this.filteredRows = this.login.filterBySearch(this.providers, this.searchFilterBykey);
}



}



interface ProviderRow {
  name: string;
  code: string;
  status: 'Active' | 'Pending' | 'Inactive';
  statusIcon: string;
  activeCampaigns: number;
  totalCompletes: string;
  quality: string;
  qualityDot: boolean;
  avgCpi: string;
}
