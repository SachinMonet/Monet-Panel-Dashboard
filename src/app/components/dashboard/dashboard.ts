import { Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule, } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [LucideModule, LucideAngularModule, CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  tabs: any[] = ['LIVE', 'UPCOMING', 'COMPLETED'];
  activeTab: any = 'LIVE';
  showProfileMenu = false;

  headerUser = {
    initials: 'JD',
    name: 'Campaign Dashboard',
  };

  alertActions: any[] = [
    { label: 'Boost', icon: 'zap' },
    { label: 'Reconfigure', icon: 'settings' },
    { label: 'Close', icon: 'x' },
  ];

  campaigns: any[] = [
    {
      id: 1,
      name: 'US Consumer Electronics Q1',
      progress: 45,
      velocity: 'Slow',
      velocityColor: 'neutral-500',
      activePanels: 3,
      status: 'LIVE',
      isAlert: true,
      badge: 'Low IR',
      complete: 45,
      actions: this.alertActions,
    },
    {
      id: 2,
      name: 'UK Financial Services Survey',
      progress: 32,
      velocity: 'Slow',
      velocityColor: 'neutral-500',
      activePanels: 2,
      status: 'LIVE',
      isAlert: true,
      badge: 'Panel Stalled',
      complete: 32,
      actions: this.alertActions,
    },
    {
      id: 3,
      name: 'Germany Healthcare Study',
      progress: 78,
      velocity: 'Fast',
      velocityColor: 'natural-700',
      activePanels: 5,
      status: 'LIVE',
      isAlert: false,
      actions: this.alertActions,
    },
    {
      id: 4,
      name: 'France Retail Behavior',
      progress: 58,
      velocity: 'Normal',
      velocityColor: 'neutral-600',
      activePanels: 4,
      status: 'LIVE',
      isAlert: false,
      actions: this.alertActions,
    },
    {
      id: 5,
      name: 'Spain Tech Adoption',
      progress: 0,
      velocity: 'Normal',
      velocityColor: 'neutral-600',
      activePanels: 0,
      status: 'UPCOMING',
      isAlert: false,
      actions: this.alertActions,
    },
    {
      id: 6,
      name: 'Italy Food Preferences',
      progress: 100,
      velocity: 'fast',
      velocityColor: 'neutral-700',
      activePanels: 0,
      status: 'COMPLETED',
      isAlert: false,
      actions: this.alertActions,
    },
  ];


  isLoading = false;
  error: string | null = null;

  constructor(private router: Router) { }

  ngOnInit() {
    setTimeout(() => {

      this.fetchCampaignData();
    }, 1000);
    console.log(this.activeTab)
  }


  // Getter to check if there are any alert campaigns


  // Getter to get only alert campaigns
  get alertCampaigns(): any[] {
    return this.campaigns.filter(campaign => campaign.isAlert);
  }

  closeProfileMenu() {
    this.showProfileMenu = false;
  }

  // ✅ Logout action
  logout() {
    console.log('Logging out...');
    // Add your logout logic here
    this.router.navigate(['/login']);
    this.closeProfileMenu();
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  fetchCampaignData() {
    this.isLoading = true;
    this.error = null;

    // Simulate API call
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  }

  setTab(tab: any) {
    console.log(`Switching to tab: ${tab}`);
    this.activeTab = tab;
  }

  createNewCampaign() {
    this.router.navigate(['/create-campaigns']);
    console.log('Creating new campaign...');
  }

  onTableActionClick(action: any, campaign: any) {
    console.log(`Action: ${action.id}`, {
      actionLabel: action.label,
      campaignName: campaign.name,
      campaignId: campaign.id,
    });







    switch (action.id) {
      case 'boost':
        console.log('Boosting campaign:', campaign.name);
        break;
      case 'clone':
        console.log('Cloning campaign:', campaign.name);
        break;
      case 'pause':
        console.log('Pausing campaign:', campaign.name);
        break;
      case 'close':
        console.log('Closing campaign:', campaign.name);
        break;
      case 'view':
        console.log('Viewing campaign:', campaign.name);
        break;
      case 'edit':
        console.log('Editing campaign:', campaign.name);
        break;
      case 'delete':
        console.log('Deleting campaign:', campaign.name);
        break;
      default:
        console.log('Unknown action:', action.id);
    }
  }


  getVelocityColor(colorClass: string): string {
    const colors: { [key: string]: string } = {
      'neutral-500': '#737373',
      'neutral-600': '#525252',
      'neutral-700': '#404040',
    };
    return colors[colorClass] || '#737373';
  }

  hasAlertCampaigns(): boolean {
    return this.campaigns.some(c => c.status === this.activeTab && c.isAlert);
  }

  // Get velocity class for styling
  getVelocityClass(velocity: string): string {
    switch (velocity) {
      case 'Slow':
        return 'chip--slow';
      case 'Normal':
        return 'chip--normal';
      case 'Fast':
        return 'chip--fast';
      default:
        return 'chip--normal';
    }
  }


  onAlertActionClick(action: any, campaign: any) {
    console.log(`Alert Action: ${action.id}`, {
      actionLabel: action.label,
      campaignName: campaign.name,
      campaignId: campaign.id,
    });
  }

}



