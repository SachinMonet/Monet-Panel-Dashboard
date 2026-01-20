import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { LucideModule } from '../../lucide/lucide-module';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, LucideModule, LucideAngularModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  availableReports: AvailableReport[] = [
    {
      id: 'campaign-performance',
      title: 'Campaign Performance Report',
      description:
        'Comprehensive analysis of campaign metrics, provider performance, and ROI',
      frequency: 'On-demand',
      lastGenerated: '2024-03-05',
      type: 'campaign',
    },
    {
      id: 'provider-performance',
      title: 'Provider Performance Report',
      description:
        'Quality scores, completion rates, and efficiency metrics by provider',
      frequency: 'Weekly',
      lastGenerated: '2024-03-04',
      type: 'provider',
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description:
        'Spend analysis, CPI trends, and budget tracking across campaigns',
      frequency: 'Monthly',
      lastGenerated: '2024-03-01',
      type: 'financial',
    },
    {
      id: 'quality-compliance',
      title: 'Quality & Compliance Report',
      description:
        'Quality failures, termination rates, and respondent validation metrics',
      frequency: 'Weekly',
      lastGenerated: '2024-03-04',
      type: 'quality',
    },
  ];

  // Report types for custom builder select
  reportTypes = [
    { value: 'campaign', label: 'Campaign Performance' },
    { value: 'provider', label: 'Provider Analysis' },
    { value: 'financial', label: 'Financial Summary' },
    { value: 'quality', label: 'Quality Metrics' },
  ];

  // Formats for custom builder select
  reportFormats: string[] = ['PDF', 'Excel (XLSX)', 'CSV'];

  // Custom report form model
  customReport: CustomReportForm = {
    type: 'campaign',
    startDate: null,
    endDate: null,
    format: 'PDF',
  };

  // Recent reports table data
  recentReports: RecentReport[] = [
    {
      id: 'r1',
      fileName: 'Campaign_Performance_Q1_2024.pdf',
      type: 'Campaign Performance',
      generated: '2024-03-05',
      size: '2.4 MB',
      downloadUrl: '/api/reports/download/r1',
    },
    {
      id: 'r2',
      fileName: 'Provider_Performance_Week_9.xlsx',
      type: 'Provider Performance',
      generated: '2024-03-04',
      size: '1.8 MB',
      downloadUrl: '/api/reports/download/r2',
    },
    {
      id: 'r3',
      fileName: 'Financial_Summary_February_2024.pdf',
      type: 'Financial Summary',
      generated: '2024-03-01',
      size: '1.2 MB',
      downloadUrl: '/api/reports/download/r3',
    },
    {
      id: 'r4',
      fileName: 'Quality_Report_Week_8.pdf',
      type: 'Quality & Compliance',
      generated: '2024-02-26',
      size: '890 KB',
      downloadUrl: '/api/reports/download/r4',
    },
    {
      id: 'r5',
      fileName: 'Campaign_Performance_C-2024-089.pdf',
      type: 'Campaign Performance',
      generated: '2024-02-20',
      size: '1.5 MB',
      downloadUrl: '/api/reports/download/r5',
    },
  ];

  constructor() { }

  // ===== Handlers =====

  onGenerateReport(report: AvailableReport): void {
    // call API to trigger generation by type / id
    // example:
    // this.reportsService.generate(report.id).subscribe(...)
    console.log('Generate report clicked', report);
  }

  onGenerateCustomReport(): void {
    const payload = {
      type: this.customReport.type,
      startDate: this.customReport.startDate,
      endDate: this.customReport.endDate,
      format: this.customReport.format,
      // add advanced filters here
    };

    // call API with payload
    // this.reportsService.generateCustom(payload).subscribe(...)
    console.log('Generate custom report', payload);
  }

  onOpenAdvancedFilters(): void {
    // open modal / side sheet for advanced filters
    console.log('Open advanced filters');
  }

  onDownload(report: RecentReport): void {
    if (!report.downloadUrl) {
      return;
    }
    // simplest: navigate to URL so browser handles download
    window.location.href = report.downloadUrl;

    // or use HttpClient + blob if you need auth headers, etc.
    console.log('Download report', report);
  }


}



interface AvailableReport {
  id: string;
  title: string;
  description: string;
  frequency: string;
  lastGenerated: string;
  type: 'campaign' | 'provider' | 'financial' | 'quality';
}

interface RecentReport {
  id: string;
  fileName: string;
  type: string;
  generated: string;
  size: string;
  downloadUrl?: string;
}

interface CustomReportForm {
  type: string;
  startDate: string | null;
  endDate: string | null;
  format: string;
  // extend with advanced filters fields if required
}
