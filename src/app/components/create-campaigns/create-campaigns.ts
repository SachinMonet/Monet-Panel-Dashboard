import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, Signal, signal } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { ApiService } from '../../core/services/api';
import { AddPanel } from '../add-panel/add-panel';
import { ConfirmDialogComponent } from '../loader';

@Component({
  selector: 'app-create-campaigns',
  standalone: true,
  imports: [CommonModule, LucideModule, LucideAngularModule, FormsModule, ReactiveFormsModule, RouterLink, AddPanel, ConfirmDialogComponent],
  templateUrl: './create-campaigns.html',
  styleUrl: './create-campaigns.scss',
})


export class CreateCampaigns implements OnInit {

  currentStep: any = 1;
  totalSteps = 3;
  allocationMode: 'manual' | 'auto' = 'manual';
  form!: FormGroup;
  isLoading: any = signal(false);
  formChanged: any = signal(false);
  confirmDeleteOpen = false;
  itemToDeleteId: number | null = null;

  steps: any[] = [
    {
      stepNumber: 1,
      stepName: 'Basics',
      title: 'Campaign Basics',
      controls: [
        { type: 'input', inputType: 'text', label: 'Campaign Name', placeholder: 'Enter campaign name', required: true, name: 'campaignName', colSpan: 2, validators: [{ type: 'minLength', value: 3 }, { type: 'maxLength', value: 100 }] },
        { type: 'dropdown', label: 'Country', placeholder: 'Select country', required: true, name: 'country', colSpan: 1 },
        { type: 'dropdown', label: 'Language', placeholder: 'Select language', required: true, name: 'language', colSpan: 1 },
        { type: 'input', inputType: 'number', label: 'LOI (minutes)', placeholder: '15', required: true, name: 'loi', colSpan: 1, validators: [{ type: 'min', value: 1 }] },
        { type: 'input', inputType: 'number', label: 'IR (%)', placeholder: '40', required: true, name: 'ir', colSpan: 1, validators: [{ type: 'min', value: 1 }, { type: 'max', value: 100 }] },
        { type: 'input', inputType: 'number', label: 'Total Target Completes', placeholder: '1000', required: true, name: 'targetCompletes', colSpan: 2, validators: [{ type: 'min', value: 1 }] },
      ],
    },
    {
      stepNumber: 2,
      stepName: 'Panels',
      title: 'Panel Configuration',
      controls: [],
      array: true
    },
    {
      stepNumber: 3,
      stepName: 'Review',
      title: 'Review & Launch',
      controls: [],
    },
  ];

  languages: any[] = [];
  countries: any[] = [];
  campaignId: any;
  isAddPanelOpen = false;
  reviewData = signal<any>({});

  private languagesLoaded = false;
  private countriesLoaded = false;

  constructor(private fb: FormBuilder, private _api: ApiService, private cdr: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {

    this.createForm();
    this.isLoading.set(true);
    this._api.get('languages').subscribe({
      next: (res: any) => { this.languages = res.data; this.languagesLoaded = true; this.checkAllLoaded(); },
      error: () => { this.languagesLoaded = true; this.checkAllLoaded(); },
    });

    this._api.get('countries').subscribe({
      next: (res: any) => { this.countries = res.data; this.countriesLoaded = true; this.checkAllLoaded(); },
      error: () => { this.countriesLoaded = true; this.checkAllLoaded(); },
    });
    if (localStorage.getItem('currentStep')) {
      this.currentStep = JSON.parse(localStorage.getItem('currentStep'));
      this.campaignId = JSON.parse(localStorage.getItem('campaignId'));
    }
    if (this.currentStep > 1) {
      this.getData();
      this.loadDataRows()
      this.getReviewData();
    }
    this.form.get('Basics')?.valueChanges.subscribe((val: any) => {
      this.formChanged.set(true);
    })
  }

  getData() {
    this._api.get(`survey/campaigns/basic/${this.campaignId}`).subscribe((res: any) => {
      if (res && !res.error) {
        this.form.get(this.steps[0].stepName)?.patchValue({
          targetCompletes: res.data.total_completes,
          country: res.data.country_id,
          language: res.data.language_id,
          loi: res.data.loi,
          ir: res.data.ir,
          campaignName: res.data.campaignName
        });

        this.formChanged.set(false);
      }
    });
  }

  getReviewData() {
    this.isLoading.set(true);
    this._api.get(`campaigns/${this.campaignId}/review`).subscribe((res: any) => {
      if (res && !res.error) {
        this.isLoading.set(false);
        this.reviewData.set(res);
        this.formChanged.set(false);
      }
    });
  }

  private checkAllLoaded() {
    this.isLoading.set(!(this.languagesLoaded && this.countriesLoaded));
  }




  createForm() {
    this.form = this.fb.group({});
    for (let item of this.steps) {
      if (item.array) {
        this.form.addControl(item.stepName, new FormArray([]));
      }
      else {
        this.form.addControl(item.stepName, new FormGroup({}));
      }
      for (let control of item.controls) {
        this.addControl(this.form.get(item.stepName), control.name);
      }
    }
  }

  addControl(formGroup: any, formControl: any) {
    formGroup.addControl(formControl, new FormControl('', Validators.required))
  }

  get panels(): FormArray {
    return this.form.get("Panels") as FormArray;   // stepName = 'Panels'
  }




  addPanel() {
    this.isAddPanelOpen = true;
  }

  closeAddPanel() {
    this.isAddPanelOpen = false;
  }

  handlePanelSaved(panelData: any) {

    this.addPanelToForm(panelData);
    this.isAddPanelOpen = false;
  }


  addPanelToForm(data: any = null) {
    const panelsArray = this.form.get('Panels') as FormArray;
    if (!panelsArray) return;

    const dummyProvider = ['Lucid', 'Cint', 'Dynata', 'Spectra'][panelsArray.length % 4];

    const panelGroup = this.fb.group({
      providerName: [data ? data.name : dummyProvider, Validators.required],
      target: [data ? data.target : 0, [Validators.required]],
      cpi: [data ? data.cpi : 2.50, [Validators.required, Validators.min(0)]],
      status: [data?.status ?? 'active']
    });

    panelsArray.push(panelGroup);
  }



  removePanel(index: number) {
    this.openDeleteDialog(index);
    //this.panels.removeAt(index);
  }



  loadDataRows() {
    this.isLoading.set(true);
    const panelsArray = this.form.get('Panels') as FormArray;
    if (!panelsArray) return;

    this._api.get(`campaigns/${this.campaignId}/panels`).subscribe((res: any) => {
      this.isLoading.set(false);

      const panelList = res?.data || [];
      panelList.forEach((row: any) => {
        const panelGroup = this.fb.group({
          providerName: [row.provider?.name, Validators.required],
          target: [row.max_completes, [Validators.required, Validators.min(1)]],
          cpi: [row.cpi, [Validators.required, Validators.min(0.1)]],
          status: [row.status ?? 'active']   // optional
        });

        panelsArray.push(panelGroup);
      });
    });
  }



  setAllocationMode(mode: 'manual' | 'auto') {

    this.allocationMode = mode;
    const panelControls = this.panels.controls;

    if (mode === 'manual') {
      panelControls.forEach(group => group.get('target')?.enable());
      panelControls.forEach(group => group.get('target')?.patchValue(0));
    } else {
      panelControls.forEach(group => group.get('target')?.disable());
      panelControls.forEach(group => group.get('target')?.patchValue('Auto'));
    }
  }

  get allocatedTotal(): number {
    return this.panels.controls.reduce((acc, control) => {
      const val = control.get('target')?.value;
      return acc + (Number(val) || 0);
    }, 0);
  }

  get targetTotal(): number {
    return this.form.get('Basics')?.get('targetCompletes')?.value || 0;
  }

  get allocationDiff(): number {
    return this.allocatedTotal - this.targetTotal;
  }


  get currentStepData(): any {
    return this.steps[this.currentStep - 1];
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }

  isStepActive(step: number): boolean {
    return step === this.currentStep;
  }

  isCurrentStepValid(): boolean {
    if (this.currentStep === 2) {
      return true;
    }
    return true;
  }

  nextStep(number: number) {
    if (this.currentStep < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep++;
    }
    localStorage.setItem('currentStep', JSON.stringify(this.currentStep));
    if (number === 1) {
      let param = {
        campaignName: this.form.value[this.steps[0].stepName].campaignName,
        country_id: this.form.value[this.steps[0].stepName].country,
        language_id: this.form.value[this.steps[0].stepName].language,
        loi: this.form.value[this.steps[0].stepName].loi,
        ir: this.form.value[this.steps[0].stepName].ir,
        total_completes: this.form.value[this.steps[0].stepName].targetCompletes,
      }

      if (this.campaignId) {
        param['id'] = this.campaignId;
      }
      localStorage.setItem('basicData', JSON.stringify(this.form.value[this.steps[0].stepName]));
      this._api.post('survey/campaigns', param).subscribe((res: any) => {
        this.campaignId = res.data.id;
        localStorage.setItem('campaignId', this.campaignId);
      })
    }

  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      localStorage.setItem('currentStep', JSON.stringify(this.currentStep));
      //this.formChanged.set(false);
    }

  }

  submitForm() {
    this._api.post(`campaigns/${this.campaignId}/launch`, '').subscribe((res: any) => {
      if (res && !res.error) {
        this.isLoading.set(false);
        this.formChanged.set(false);
        this.router.navigate(['dashboard']);
        localStorage.removeItem('currentStep');
        localStorage.removeItem('basicData');
        localStorage.removeItem('campaignId');

      }
    })
    if (this.form.valid) {
    }
  }

  openDeleteDialog(id: number) {
    this.itemToDeleteId = id;
    this.confirmDeleteOpen = true;
  }

  closeDeleteDialog() {
    this.confirmDeleteOpen = false;
    this.itemToDeleteId = null;
  }

  confirmDelete() {
    if (this.itemToDeleteId == null) return;
    this.panels.removeAt(this.itemToDeleteId);
    this.closeDeleteDialog();
    const id = this.itemToDeleteId;
    // this._api.delete(`survey-panel-providers/${id}`).subscribe({
    //   next: () => {
    //     this.getPanelProvider(); 
    //     this.closeDeleteDialog();
    //   },
    //   error: () => {
    //     this.closeDeleteDialog();
    //   },
    // });
  }

}


