import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LucideModule } from '../../lucide/lucide-module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, LucideModule, LucideAngularModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {

  apiConfig = {
    masterApiKeyMasked: '••••••••••••••••••••1',
    webhookUrl: '',
  };

  // Notifications
  notificationSettings: NotificationSetting[] = [
    {
      id: 'campaign-milestone',
      label: 'Campaign milestone alerts',
      description: 'Get notified when campaigns reach 25%, 50%, 75%, and 100%',
      enabled: true,
    },
    {
      id: 'quality-score',
      label: 'Quality score warnings',
      description: 'Alert when provider quality drops below threshold',
      enabled: true,
    },
    {
      id: 'budget-threshold',
      label: 'Budget threshold alerts',
      description: 'Notify when campaign spend reaches 80% of budget',
      enabled: true,
    },
    {
      id: 'provider-status',
      label: 'Provider status changes',
      description: 'Get notified when provider status changes',
      enabled: true,
    },
    {
      id: 'daily-summary',
      label: 'Daily summary reports',
      description: 'Receive daily email summary of all campaigns',
      enabled: true,
    },
  ];

  // Security
  security: SecuritySettings = {
    sessionTimeoutMinutes: 30,
    requireTwoFactor: true,
    ipWhitelistEnabled: false,
  };

  // Data management
  retentionOptions: string[] = [
    '30 days',
    '60 days',
    '90 days',
    '180 days',
    '365 days',
    'Indefinite',
  ];

  dataManagement: DataManagementSettings = {
    retentionPeriod: '90 days',
  };

  // Panel defaults
  panelDefaults: PanelDefaults = {
    qualityThreshold: 85,
    maxCpi: 5,
    redirectTimeoutSeconds: 30,
  };

  // ===== Handlers =====

  onSaveApiSettings(): void {
    console.log('Save API settings', this.apiConfig);
    // call API here
  }

  onToggleNotification(setting: NotificationSetting): void {
    setting.enabled = !setting.enabled;
    console.log('Notification toggled', setting);
  }

  onSaveSecurity(): void {
    console.log('Save security settings', this.security);
  }

  onExportAllData(): void {
    console.log('Export all data');
  }

  onResetDefaults(): void {
    this.panelDefaults = {
      qualityThreshold: 85,
      maxCpi: 5,
      redirectTimeoutSeconds: 30,
    };
    console.log('Panel defaults reset');
  }

  onSaveAllSettings(): void {
    console.log('Save all settings', {
      apiConfig: this.apiConfig,
      notifications: this.notificationSettings,
      security: this.security,
      dataManagement: this.dataManagement,
      panelDefaults: this.panelDefaults,
    });
  }

}

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SecuritySettings {
  sessionTimeoutMinutes: number;
  requireTwoFactor: boolean;
  ipWhitelistEnabled: boolean;
}

interface DataManagementSettings {
  retentionPeriod: string;
}

interface PanelDefaults {
  qualityThreshold: number;
  maxCpi: number;
  redirectTimeoutSeconds: number;
}
