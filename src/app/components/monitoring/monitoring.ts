import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-monitoring',
  imports: [LucideModule, LucideAngularModule, CommonModule, FormsModule],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.scss',
})
export class Monitoring {

  header = {
    title: 'Live Monitoring',
    subtitle: 'Real-time campaign and provider performance',
    refreshLabel: 'Refresh',
    refreshIcon: 'refresh-cw'
  };

  campaigns = [
    { value: 'C-2024-089', label: 'Consumer Behavior Study Q1' },
    { value: 'C-2024-090', label: 'Product Satisfaction Survey' },
    { value: 'C-2024-092', label: 'Market Segmentation Analysis' }
  ];

  selectedCampaign = this.campaigns[0].value;

  metricCards: MetricCard[] = [
    {
      label: 'Active Sessions',
      value: '127',
      icon: 'activity',
      deltaIcon: 'trending-up',
      deltaText: '+12',
      deltaColor: 'green',
      deltaSuffix: 'vs last hour'
    },
    {
      label: 'Completes (Today)',
      value: '45',
      icon: 'activity',
      deltaIcon: 'trending-up',
      deltaText: '+8',
      deltaColor: 'green',
      deltaSuffix: 'vs last hour'
    },
    {
      label: 'Quality Score',
      value: '92%',
      icon: 'activity',
      deltaIcon: 'trending-down',
      deltaText: '-2%',
      deltaColor: 'red',
      deltaSuffix: 'vs last hour'
    },
    {
      label: 'Avg Response Time',
      value: '4.2m',
      icon: 'activity',
      deltaIcon: 'trending-up',
      deltaText: '-0.3m',
      deltaColor: 'green',
      deltaSuffix: 'vs last hour'
    }
  ];

  providers: ProviderStatus[] = [
    {
      name: 'Provider A',
      sessions: '48 sessions',
      badgeLabel: 'Healthy',
      badgeIcon: 'circle-check-big',
      badgeColor: 'green',
      completes: '18',
      quality: '94%',
      issueRate: '2%'
    },
    {
      name: 'Provider B',
      sessions: '42 sessions',
      badgeLabel: 'Healthy',
      badgeIcon: 'circle-check-big',
      badgeColor: 'green',
      completes: '15',
      quality: '91%',
      issueRate: '3%'
    },
    {
      name: 'Provider C',
      sessions: '37 sessions',
      badgeLabel: 'Warning',
      badgeIcon: 'triangle-alert',
      badgeColor: 'yellow',
      completes: '12',
      quality: '85%',
      issueRate: '8%'
    }
  ];

  events: EventItem[] = [
    {
      dotColor: 'green',
      text: 'Provider A: 10 new completes in the last hour',
      time: '2 minutes ago'
    },
    {
      dotColor: 'yellow',
      text: 'Provider C: Quality score dropped below 90%',
      time: '15 minutes ago'
    },
    {
      dotColor: 'green',
      text: 'Campaign reached 75% completion',
      time: '1 hour ago'
    },
    {
      dotColor: 'blue',
      text: 'Provider B: API response time increased to 250ms',
      time: '2 hours ago'
    },
    {
      dotColor: 'green',
      text: 'Provider A: Successfully processed 50 completes',
      time: '3 hours ago'
    }
  ];

  flowSteps: FlowStep[] = [
    { label: 'Started', value: '152', colorClass: 'flow-text-started' },
    { label: 'Completed', value: '45', colorClass: 'flow-text-completed' },
    { label: 'Terminated', value: '38', colorClass: 'flow-text-terminated' },
    { label: 'Overquota', value: '25', colorClass: 'flow-text-overquota' },
    { label: 'Quality Fail', value: '12', colorClass: 'flow-text-quality' },
    { label: 'Active', value: '32', colorClass: 'flow-text-active' }
  ];

  completionRate = '29.6%';
  qualityRate = '78.9%';

  metricDeltaClass(card: MetricCard): string {
    return card.deltaColor === 'green' ? 'metric-delta metric-delta--green'
      : 'metric-delta metric-delta--red';
  }

  providerBadgeClass(p: ProviderStatus): string {
    return p.badgeColor === 'green'
      ? 'provider-badge provider-badge--green'
      : 'provider-badge provider-badge--yellow';
  }

  eventDotClass(e: EventItem): string {
    return `event-dot event-dot--${e.dotColor}`;
  }

}


interface MetricCard {
  label: string;
  value: string;
  icon: string;
  deltaIcon: 'trending-up' | 'trending-down';
  deltaText: string;
  deltaColor: 'green' | 'red';
  deltaSuffix: string;
}

interface ProviderStatus {
  name: string;
  sessions: string;
  badgeLabel: string;
  badgeIcon: string;
  badgeColor: 'green' | 'yellow';
  completes: string;
  quality: string;
  issueRate: string;
}

interface EventItem {
  dotColor: 'green' | 'yellow' | 'blue';
  text: string;
  time: string;
}

interface FlowStep {
  label: string;
  value: string;
  colorClass: string;
}