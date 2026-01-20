import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LucideModule } from '../../lucide/lucide-module';
import { Login } from '../login';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-campaigns',
  imports: [LucideModule, LucideAngularModule, CommonModule,FormsModule],
  templateUrl: './campaigns.html',
  styleUrl: './campaigns.scss',
})
export class Campaigns implements OnInit {
  filteredRows: any
  searchFilterBykey:any
  addButton = {
    icon: 'plus',
    label: 'Create Campaign'
  };

  filters = {
    searchPlaceholder: 'Search campaigns...',
    statusOptions: ['All Status', 'Active', 'Paused', 'Completed'],
    sortOptions: ['Sort by: Recent', 'Sort by: Name', 'Sort by: Progress']
  };


  campaigns: CampaignCard[] = [
    {
      title: 'Consumer Behavior Study Q1',
      code: 'C-2024-089',
      status: 'Active',
      progressLabel: '750 / 1000 completes',
      progressPercent: 75,
      providers: 3,
      avgCpi: '$3.25',
      totalSpend: '$2437.50'
    },
    {
      title: 'Product Satisfaction Survey',
      code: 'C-2024-090',
      status: 'Active',
      progressLabel: '225 / 500 completes',
      progressPercent: 45,
      providers: 2,
      avgCpi: '$2.80',
      totalSpend: '$630.00'
    },
    {
      title: 'Brand Awareness Research',
      code: 'C-2024-091',
      status: 'Paused',
      progressLabel: '240 / 800 completes',
      progressPercent: 30,
      providers: 2,
      avgCpi: '$4.10',
      totalSpend: '$984.00'
    },
    {
      title: 'Market Segmentation Analysis',
      code: 'C-2024-092',
      status: 'Active',
      progressLabel: '1080 / 1200 completes',
      progressPercent: 90,
      providers: 4,
      avgCpi: '$3.50',
      totalSpend: '$3780.00'
    },
    {
      title: 'Customer Experience Feedback',
      code: 'C-2024-093',
      status: 'Completed',
      progressLabel: '600 / 600 completes',
      progressPercent: 100,
      providers: 2,
      avgCpi: '$2.90',
      totalSpend: '$1740.00'
    }
  ];

  constructor(private login: Login) {

   }

   filterByStatus(status: any) {
  status= status.value
  if (status === 'All Status') {
    this.filteredRows = this.campaigns;
    return;
  }

  this.filteredRows = this.campaigns.filter(p => p.status === status);
}

sortChanged(option: any) {
  option = option.value
  switch (option) {
    case 'Sort by: Name':
      this.filteredRows = [...this.filteredRows].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      break;

    case 'Sort by: Progress':
      this.filteredRows = [...this.filteredRows].sort(
        (a, b) => a.progressPercent - b.progressPercent
      );
      break;

    case 'Sort by: Recent':
    default:
      // put your "recent" logic here; for demo just keep original order
      this.filteredRows = [...this.campaigns]; // or providers
      break;
  }
}


   ngOnInit() {
    this.filteredRows = this.campaigns;
  }

 searchFilter(event: any) {
  const term = (event.target?.value || '').trim();
  this.filteredRows = this.login.filterBySearch(this.campaigns, term);
}


  // actions per status
  primaryActionIcon(status: CampaignStatus): string {
    if (status === 'Paused') return 'play';
    return 'pause';
  }

  primaryActionLabel(status: CampaignStatus): string {
    if (status === 'Paused') return 'Resume';
    if (status === 'Completed') return 'View';
    return 'Pause';
  }

  showPrimary(status: CampaignStatus): boolean {
    return status !== 'Completed';
  }

  badgeClass(status: CampaignStatus): string {
    if (status === 'Active') return 'badge badge--green';
    if (status === 'Paused') return 'badge badge--yellow';
    return 'badge badge--blue';
  }

}

type CampaignStatus = 'Active' | 'Paused' | 'Completed';

interface CampaignCard {
  title: string;
  code: string;
  status: CampaignStatus;
  progressLabel: string;
  progressPercent: number;
  providers: number;
  avgCpi: string;
  totalSpend: string;
}

interface Row {
  id: number;
  name: string;
  status: string;
}


