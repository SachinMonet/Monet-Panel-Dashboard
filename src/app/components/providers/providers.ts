import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../core/services/api';
import { LucideModule } from '../../lucide/lucide-module';

type Provider = {
  quality_fail_url: string;
  overquota_url: string;
  terminate_url: string;
  success_url: string;
  id: number;
  provider_name: string;
  panel_id: string;
  region: string;
  status: 'Active' | 'Inactive' | 'Degraded';
  api_health: 'Healthy' | 'Issues' | string;
};

@Component({
  selector: 'app-providers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink, LucideModule],
  templateUrl: './providers.html',
  styleUrls: ['./providers.scss'],
})
export class Providers implements OnInit {
  private _fb = inject(FormBuilder);
  private _api = inject(ApiService);

  showWizard = signal<boolean>(false);
  currentStep = signal<number>(1);
  regions = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  providerForm = this._fb.group({
    basic: this._fb.group({
      name: ['', Validators.required],
      panelId: ['', Validators.required],
      region: ['', Validators.required],
    }),
    // credentials: this._fb.group({
    //   endpoint: ['', Validators.required],
    //   key: ['', Validators.required],
    //   secret: ['', Validators.required],
    // }),
    // params: this._fb.group({
    //   panelIdParam: ['pid'],
    //   sessionIdParam: ['sid'],
    //   customParams: [''],
    // }),
    redirects: this._fb.group({
      successUrl: [''],
      terminateUrl: [''],
      overquotaUrl: [''],
      qualityFailUrl: [''],
    })
  });

  providers = signal<Provider[]>([]);
  // providers = signal<any[]>([
  //   { name: 'Lucid', panelId: 'LUC1', region: 'Global', status: 'active' },
  //   { name: 'Cint', panelId: 'CNT1', region: 'Global', status: 'active' },
  //   { name: 'Dynata', panelId: 'DYN1', region: 'North America', status: 'inactive ' },
  // ]);

  steps = [
    { step: 1, label: 'Basic Info' },
    // { step: 2, label: 'Credentials' },
    // { step: 3, label: 'Parameters' },
    { step: 2, label: 'Redirects' },
    { step: 3, label: 'Test' },
  ];

  currentStepTitle = computed(() => {
    switch (this.currentStep()) {
      case 1: return 'Basic Information';
      // case 2: return 'API Credentials';
      // case 3: return 'Inbound Parameters';
      case 2: return 'Redirect URLs';
      case 3: return 'Test Connection';
      default: return '';
    }
  });

  ngOnInit() {
    this.getRegions();
    this.getPanelProvider();
  }

  addPanel() {
    this.providerForm.reset();
    this.showWizard.set(true);
    this.currentStep.set(1);
  }

  nextStep() {

    this.currentStep.update(v => Math.min(5, v + 1));
  }

  prevStep() {
    this.currentStep.update(v => Math.max(1, v - 1));
  }

  onFinish() {
    this.isLoading.set(true);
    this._api.post('panel-provider/save', this.providerForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        console.log('Provider created successfully:', res);
        this.getPanelProvider();
        this.showWizard.set(false);
        this.currentStep.set(1);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error creating provider:', err);
      }
    });
    console.log('Submitting:', this.providerForm.value);
    this.showWizard.set(false);
    this.currentStep.set(1);
  }

  getRegions() {
    this.isLoading.set(true);
    this._api.get('regions').subscribe((res: any) => {
      this.regions.set(res.data);
     // this.isLoading.set(false);
    });
  }


  getPanelProvider() {
    this.isLoading.set(true);
    this._api.get('panel-providers_all').subscribe({
      next: (res: any) => {
        this.providers.set(res.data);
        this.isLoading.set(false);
        console.log('Provider details:', res);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error fetching provider details:', err);
      }
    });
  }

  statusClass(status: Provider['status']): string {
    switch (status) {
      case 'Active':
        return 'inline-block px-3 py-1 text-sm bg-neutral-700 text-white';
      case 'Inactive':
        return 'inline-block px-3 py-1 text-sm bg-neutral-300 text-neutral-700';
      case 'Degraded':
        return 'inline-block px-3 py-1 text-sm bg-neutral-700 text-white';
    }
  }


  editPanel(id: number) {
    console.log('Editing provider with ID:', id);
 
    
  }

  confirmDeleteOpen = false;
providerToDeleteId: number | null = null;

openDeleteDialog(id: number) {
  this.providerToDeleteId = id;
  this.confirmDeleteOpen = true;
}

closeDeleteDialog() {
  this.confirmDeleteOpen = false;
  this.providerToDeleteId = null;
}

confirmDelete() {
  if (this.providerToDeleteId == null) return;

  const id = this.providerToDeleteId;
  console.log('Attempting to delete provider with ID:', id);
  this.isLoading.set(true);

  this._api.delete(`survey-panel-providers/${id}`).subscribe({
    next: (res) => {
      this.isLoading.set(false);
      console.log('Provider deleted successfully:', res);
      this.getPanelProvider();
      this.closeDeleteDialog();
    },
    error: (err) => {
      this.isLoading.set(false);
      console.error('Error deleting provider:', err);
      this.closeDeleteDialog();
    }
  });
}

}