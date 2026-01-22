import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { ApiService } from '../../core/services/api';
import { AddPanel } from '../add-panel/add-panel';



@Component({
  selector: 'app-create-campaigns',
  imports: [CommonModule, LucideModule, LucideAngularModule, FormsModule, ReactiveFormsModule, RouterLink, AddPanel],
  templateUrl: './create-campaigns.html',
  styleUrl: './create-campaigns.scss',
})
export class CreateCampaigns {

  currentStep = 1;
  totalSteps = 4;
  allocationMode: 'manual' | 'auto' = 'manual';
  form!: FormGroup;
  isLoading = false;



  steps: StepData[] = [
    {
      stepNumber: 1,
      stepName: 'Basics',
      title: 'Campaign Basics',
      controls: [
        {
          type: 'input',
          inputType: 'text',
          label: 'Campaign Name',
          placeholder: 'Enter campaign name',
          required: true,
          name: 'campaignName',
          colSpan: 2,
          validators: [
            { type: 'minLength', value: 3 },
            { type: 'maxLength', value: 100 },
          ],
        },
        {
          type: 'dropdown',
          label: 'Country',
          placeholder: 'Select country',
          required: true,
          name: 'country',
          colSpan: 1,
        },
        {
          type: 'dropdown',
          label: 'Language',
          placeholder: 'Select language',
          required: true,
          name: 'language',
          colSpan: 1,
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'LOI (minutes)',
          placeholder: '15',
          required: true,
          name: 'loi',
          colSpan: 1,
          validators: [
            { type: 'min', value: 1 },
            // { type: 'max', value: 15 },
          ],
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'IR (%)',
          placeholder: '40',
          required: true,
          name: 'ir',
          colSpan: 1,
          validators: [
            { type: 'min', value: 1 },
            { type: 'max', value: 100 },
          ],
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'Total Target Completes',
          placeholder: '1000',
          required: true,
          name: 'targetCompletes',
          colSpan: 2,
          validators: [
            { type: 'min', value: 1 },
          ],
        },
      ],
    },
    {
      stepNumber: 2,
      stepName: 'Panels',
      title: 'Select Panels',
      controls: [
        {
          type: 'input',
          inputType: 'text',
          label: 'Panel 1 Target Completes',
          placeholder: '500',
          defaultValue: 500,
          required: true,
          name: 'panel1Target',
          colSpan: 1,
          validators: [
            // { type: 'min', value: 0 },
          ],
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'Panel 1 CPI ($)',
          placeholder: '2.50',
          defaultValue: 2.50,
          required: true,
          name: 'panel1Cpi',
          colSpan: 1,
          validators: [
            { type: 'min', value: 0 },
          ],
        },
        {
          type: 'input',
          inputType: 'text',
          label: 'Panel 2 Target Completes',
          placeholder: '300',
          defaultValue: 300,
          required: true,
          name: 'panel2Target',
          colSpan: 1,
          validators: [
            // { type: 'min', value: 0 },
          ],
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'Panel 2 CPI ($)',
          placeholder: '2.80',
          defaultValue: 2.80,
          required: true,
          name: 'panel2Cpi',
          colSpan: 1,
          validators: [
            { type: 'min', value: 0 },
          ],
        },
        {
          type: 'input',
          inputType: 'text',
          label: 'Panel 3 Target Completes',
          placeholder: '200',
          defaultValue: 200,
          required: true,
          name: 'panel3Target',
          colSpan: 1,
          validators: [
            // { type: 'min', value: 0 },
          ],
        },
        {
          type: 'input',
          inputType: 'number',
          label: 'Panel 3 CPI ($)',
          placeholder: '3.00',
          defaultValue: 3.00,
          required: true,
          name: 'panel3Cpi',
          colSpan: 1,
          validators: [
            { type: 'min', value: 0 },
          ],
        },
      ],
    },
    {
      stepNumber: 3,
      stepName: 'Redirects',
      title: 'Redirect URLs',
      controls: [
        {
          type: 'input',
          inputType: 'text',
          label: 'Success URL ',
          placeholder: 'https://panel.example.com/success?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectComplete',
          colSpan: 2,
          defaultValue: 'https://panel.example.com/success?pid=[PID]&sid=[SID]',
          validators: [
            { type: 'pattern', value: '^https?://.*$' },
          ],
        },
        {
          type: 'input',
          inputType: 'text',
          label: 'Termination URL ',
          placeholder: 'https://panel.example.com/terminate?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectTerminate',
          colSpan: 2,
          defaultValue: 'https://panel.example.com/terminate?pid=[PID]&sid=[SID]',
          validators: [
            { type: 'pattern', value: '^https?://.*$' },
          ],
        },
        {
          type: 'input',
          inputType: 'text',
          label: 'Overquota URL ',
          placeholder: 'https://panel.example.com/overquota?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectOverquota',
          colSpan: 2,
          defaultValue: 'https://panel.example.com/overquota?pid=[PID]&sid=[SID]',
          validators: [
            { type: 'pattern', value: '^https?://.*$' },
          ],
        },
      ],
    },

    {
      stepNumber: 4,
      stepName: 'Review',
      title: 'Review & Launch',
      controls: [],
    },
  ];



  languages: any[] = [];
  countries: any[] = [];
  campaignId: any;

  constructor(private fb: FormBuilder, private _api: ApiService, private cdr: ChangeDetectorRef) { }


  private languagesLoaded = false;
  private countriesLoaded = false;

  ngOnInit() {
    this.buildForm();
    this.isLoading = true;

    this._api.get('languages').subscribe({
      next: (res: any) => {
        this.languages = res.data;
        this.languagesLoaded = true;
        this.checkAllLoaded();
      },
      error: () => {
        // this.languagesLoaded = true;
        this.checkAllLoaded();
      },
    });

    this._api.get('countries').subscribe({
      next: (res: any) => {
        this.countries = res.data;
        this.countriesLoaded = true;
        this.checkAllLoaded();
      },
      error: () => {
        //this.countriesLoaded = true;
        this.checkAllLoaded();
      },
    });
  }

  private checkAllLoaded() {
    this.isLoading = !(this.languagesLoaded && this.countriesLoaded);
    this.cdr.markForCheck(); // or this.cdr.detectChanges();
  }


  getControl(name: string | undefined) {
    return this.form.get(name!) as any;
  }

  buildForm() {
    const formGroup: { [key: string]: any } = {};

    this.steps.forEach(step => {
      step.controls.forEach(control => {
        if (!control.name) return;

        const validators = [];

        if (control.required) {
          validators.push(Validators.required);
        }

        if (control.validators) {
          control.validators.forEach(v => {
            switch (v.type) {
              case 'min':
                validators.push(Validators.min(v.value as number));
                break;
              case 'max':
                validators.push(Validators.max(v.value as number));
                break;
              case 'minLength':
                validators.push(Validators.minLength(v.value as number));
                break;
              case 'maxLength':
                validators.push(Validators.maxLength(v.value as number));
                break;
              case 'pattern':
                validators.push(Validators.pattern(v.value as string));
                break;
            }
          });
        }

        const initialValue = control.defaultValue ?? '';

        formGroup[control.name] = [initialValue, validators];
      });
    });

    this.form = this.fb.group(formGroup);
  }



  get currentStepData(): StepData {
    return this.steps[this.currentStep - 1];
  }

  isStepCompleted(step: number): boolean {
    return step < this.currentStep;
  }

  isStepActive(step: number): boolean {
    return step === this.currentStep;
  }

  isCurrentStepValid(): boolean {
    const controls = this.currentStepData.controls;
    return controls.every(control =>
      !control.required || this.form.get(control.name!)?.valid
    );
  }

  nextStep(number: number) {
    if (this.currentStep < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep++;
    }
    // if(number === 1){
    //    console.log(number);
    // let param = {
    //   campaignName: this.form.value.campaignName,
    //   country_id: this.form.value.country,
    //   language_id: this.form.value.language,
    //   loi: this.form.value.loi,
    //   ir: this.form.value.ir,
    //   total_completes: this.form.value.targetCompletes,
    // }
    // console.log(this.form.value);
    // console.log("param", param);
    // this._api.post('survey/campaigns', param).subscribe((res: any) => {
    //   this.campaignId = res.campaign_id
    //   console.log(res);
    // })
    // }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number) {
    if (step >= 1 && step <= this.totalSteps && step <= this.currentStep + 1) {
      this.currentStep = step;
    }
  }

  submitForm() {
    console.log('Form Data:', this.form.value); // this.form.value
    if (this.form.valid) {
      console.log('Form Data:', this.form.value);
    }
  }

  cancelForm() {
    console.log('Form cancelled');
  }

  setAllocationMode(mode: 'manual' | 'auto') {
    console.log('Setting allocation mode to:', mode);
    this.allocationMode = mode;
    if (mode === 'manual') {
      this.form.get('panel1Target')?.enable();
      this.form.get('panel2Target')?.enable();
      this.form.get('panel3Target')?.enable();
    } else {
      this.form.get('panel1Target')?.disable();
      this.form.get('panel2Target')?.disable();
      this.form.get('panel3Target')?.disable();
    }
  }

  get allocatedTotal(): number {
    return (
      (this.form.get('panel1Target')?.value || 0) +
      (this.form.get('panel2Target')?.value || 0) +
      (this.form.get('panel3Target')?.value || 0)
    );
  }

  get targetTotal(): number {
    return this.form.get('targetCompletes')?.value || 0;
  }

  get allocationDiff(): number {
    return this.allocatedTotal - this.targetTotal;
  }


  isAddPanelOpen = false;

  addPanel() {
    this.isAddPanelOpen = true;
    console.log('Adding panel...');
  }

  closeAddPanel() {
    this.isAddPanelOpen = false;
  }

  handlePanelSaved(panelData: any) {
    // Use the data (push to panels list, etc.)
    console.log('Saved panel', panelData);
    this.isAddPanelOpen = false;
  }

}

type ValidatorType =
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern';

interface ValidatorConfig {
  type: ValidatorType;
  value: number | string;
}

interface FormControl {
  type: 'input' | 'dropdown' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  name?: string;
  colSpan?: number;
  inputType?: 'text' | 'number' | 'email' | 'password';
  validators?: ValidatorConfig[];
  defaultValue?: any;
}

interface StepData {
  stepNumber: number;
  stepName: string;
  title: string;
  controls: FormControl[];
}
