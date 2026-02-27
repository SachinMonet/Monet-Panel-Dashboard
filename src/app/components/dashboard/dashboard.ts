import { Component, signal } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

export interface Panel {
  id: number;
  name: string;
  completes: number;
  velocity: string;
  status: string;
  isAlert?: boolean;
  badge?: string;
}

export interface Campaign {
  id: number;
  name: string;
  progress: number;
  completes: number;
  target: number;
  status: string;
  panels: Panel[];
}

@Component({
  selector: 'app-dashboard',
  imports: [LucideModule, LucideAngularModule, CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  tabs: string[] = ['LIVE', 'UPCOMING', 'COMPLETED'];
  activeTab = 'LIVE';
  showProfileMenu = false;

  expandedIds = signal<Set<number>>(new Set());

  campaigns: Campaign[] = [
    {
      id: 1,
      name: 'US Consumer Electronics Q1',
      progress: 45,
      completes: 450,
      target: 1000,
      status: 'LIVE',
      panels: [
        { id: 11, name: 'Lucid', completes: 200, velocity: 'Normal', status: 'Active' },
        { id: 12, name: 'Cint', completes: 150, velocity: 'Slow', status: 'Active', isAlert: true, badge: 'Low IR' },
        { id: 13, name: 'Dynata', completes: 100, velocity: 'Slow', status: 'Active', isAlert: true, badge: 'Panel Stalled' },
      ]
    },
    {
      id: 2,
      name: 'UK Financial Services Survey',
      progress: 32,
      completes: 256,
      target: 800,
      status: 'LIVE',
      panels: [
        { id: 21, name: 'Cint', completes: 180, velocity: 'Normal', status: 'Active' },
        { id: 22, name: 'Toluna', completes: 76, velocity: 'Slow', status: 'Active', isAlert: true, badge: 'Low IR' },
      ]
    },
    {
      id: 3,
      name: 'Germany Healthcare Study',
      progress: 78,
      completes: 780,
      target: 1000,
      status: 'LIVE',
      panels: [
        { id: 31, name: 'Lucid', completes: 500, velocity: 'Fast', status: 'Active' },
        { id: 32, name: 'Cint', completes: 280, velocity: 'Normal', status: 'Active' },
      ]
    },
    {
      id: 4,
      name: 'Spain Tech Adoption',
      progress: 0,
      completes: 0,
      target: 500,
      status: 'UPCOMING',
      panels: []
    },
    {
      id: 5,
      name: 'Italy Food Preferences',
      progress: 100,
      completes: 600,
      target: 600,
      status: 'COMPLETED',
      panels: [
        { id: 51, name: 'Lucid', completes: 600, velocity: 'Fast', status: 'Completed' },
      ]
    },
  ];

  isLoading = false;
  error: string | null = null;

  constructor(private router: Router) {}

  ngOnInit() {
    // Expand first campaign by default
    const first = this.campaigns.find(c => c.status === this.activeTab);
    if (first) this.toggleExpand(first.id);
  }

  getFilteredCampaigns(): Campaign[] {
    return this.campaigns.filter(c => c.status === this.activeTab);
  }

  toggleExpand(id: number): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  isExpanded(id: number): boolean {
    return this.expandedIds().has(id);
  }

  // Alert panels across all live campaigns
  getAlertPanels(): { panelId: number; campaignName: string; panelName: string; completes: number; badge?: string }[] {
    const result: any[] = [];
    this.campaigns
      .filter(c => c.status === this.activeTab)
      .forEach(c => {
        c.panels
          .filter(p => p.isAlert)
          .forEach(p => {
            result.push({
              panelId: p.id,
              campaignName: c.name,
              panelName: p.name,
              completes: p.completes,
              badge: p.badge
            });
          });
      });
    return result;
  }

  hasAlertPanels(): boolean {
    return this.getAlertPanels().length > 0;
  }

  getVelocityClass(velocity: string): string {
    switch (velocity?.toLowerCase()) {
      case 'slow': return 'chip--slow';
      case 'normal': return 'chip--normal';
      case 'fast': return 'chip--fast';
      default: return 'chip--normal';
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.expandedIds.set(new Set());
    const first = this.campaigns.find(c => c.status === tab);
    if (first) this.toggleExpand(first.id);
  }

  createNewCampaign() {
    this.router.navigate(['/create-campaigns']);
  }

  toggleProfileMenu() { this.showProfileMenu = !this.showProfileMenu; }
  closeProfileMenu() { this.showProfileMenu = false; }
  logout() { this.router.navigate(['/login']); this.closeProfileMenu(); }

  // Campaign actions
  addPanel(campaign: Campaign, event: Event) { event.stopPropagation(); console.log('Add panel to:', campaign.name); }
  editCampaign(campaign: Campaign, event: Event) { event.stopPropagation(); console.log('Edit campaign:', campaign.name); }
  launchCampaign(campaign: Campaign, event: Event) { event.stopPropagation(); console.log('Launch campaign:', campaign.name); }
  closeCampaign(campaign: Campaign, event: Event) { event.stopPropagation(); console.log('Close campaign:', campaign.name); }

  // Panel actions
  boostPanelById(panel: Panel) { console.log('Boost panel:', panel.name); }
  clonePanel(panel: Panel) { console.log('Clone panel:', panel.name); }
  pausePanel(panel: Panel) { console.log('Pause panel:', panel.name); }
  removePanel(panel: Panel) { console.log('Remove panel:', panel.name); }

  // Alert actions
  boostPanel(alert: any) { console.log('Boost panel from alert:', alert.panelName); }
  reconfigurePanel(alert: any) { console.log('Reconfigure panel:', alert.panelName); }
  dismissAlert(alert: any) {
    //console.log('Dismiss alert for panel:', alert.panelName);
    const campaign = this.campaigns.find(c => c.name === alert.campaignName);
    if (campaign) {
      const panel = campaign.panels.find(p => p.id === alert.panelId);
      if (panel) panel.isAlert = false;
    }
  }
}