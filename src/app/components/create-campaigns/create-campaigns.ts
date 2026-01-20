import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LucideModule } from '../../lucide/lucide-module';
import { LucideAngularModule } from 'lucide-angular';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { ApiService } from '../../core/services/api';



@Component({
  selector: 'app-create-campaigns',
  imports: [CommonModule, LucideModule, LucideAngularModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-campaigns.html',
  styleUrl: './create-campaigns.scss',
})
export class CreateCampaigns {

  currentStep = 1;
  totalSteps = 4;
  allocationMode: 'manual' | 'auto' = 'manual';
  form!: FormGroup;


  steps: StepData[] = [
    {
      stepNumber: 1,
      stepName: 'Basics',
      title: 'Campaign Basics',
      controls: [
        {
          type: 'input',
          label: 'Campaign Name',
          placeholder: 'Enter campaign name',
          required: true,
          name: 'campaignName',
          colSpan: 2,
        },
        {
          type: 'dropdown',
          label: 'Country',
          placeholder: 'Select country',
          required: true,
          name: 'country',
          options: ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France'],
          colSpan: 1,
        },
        {
          type: 'dropdown',
          label: 'Language',
          placeholder: 'Select language',
          required: true,
          name: 'language',
          options: ['English', 'Spanish', 'French', 'German', 'Italian'],
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'LOI (minutes)',
          placeholder: '15',
          required: true,
          name: 'loi',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'IR (%)',
          placeholder: '40',
          required: true,
          name: 'ir',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Total Target Completes',
          placeholder: '1000',
          required: true,
          name: 'targetCompletes',
          colSpan: 2,
        },
      ],
    },
    {
      stepNumber: 2,
      stepName: 'Panels',
      title: 'Select Panels',
      // keep minimal controls for validation / form integration
      controls: [
        // {
        //   type: 'dropdown',
        //   label: 'Panel 1',
        //   placeholder: 'Select panel',
        //   required: true,
        //   name: 'panel1',
        //   options: ['Lucid', 'Cint', 'Dynata'],
        //   colSpan: 2,
        // },
        {
          type: 'input',
          label: 'Panel 1 Target Completes',
          placeholder: '500',
          required: true,
          name: 'panel1Target',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Panel 1 CPI ($)',
          placeholder: '2.50',
          required: true,
          name: 'panel1Cpi',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Panel 2 Target Completes',
          placeholder: '300',
          required: true,
          name: 'panel2Target',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Panel 2 CPI ($)',
          placeholder: '2.80',
          required: true,
          name: 'panel2Cpi',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Panel 3 Target Completes',
          placeholder: '200',
          required: true,
          name: 'panel3Target',
          colSpan: 1,
        },
        {
          type: 'input',
          label: 'Panel 3 CPI ($)',
          placeholder: '3.00',
          required: true,
          name: 'panel3Cpi',
          colSpan: 1,
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
          label: 'Success URL ',
          placeholder: 'https://panel.example.com/success?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectComplete',
          colSpan: 2,
        },
        {
          type: 'input',
          label: 'Termination URL ',
          placeholder: 'https://panel.example.com/terminate?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectTerminate',
          colSpan: 2,
        },
        {
          type: 'input',
          label: 'Overquota URL ',
          placeholder: 'https://panel.example.com/overquota?pid=[PID]&sid=[SID]',
          required: false,
          name: 'redirectTerminate',
          colSpan: 2,
        },
      ],
    },
    {
      stepNumber: 4,
      stepName: 'Review',
      title: 'Review & Launch',
      controls: [
        // {
        //   type: 'checkbox',
        //   label: 'I confirm all campaign details are correct',
        //   required: true,
        //   name: 'confirmDetails',
        //   colSpan: 2,
        // },
      ],
    },
  ];

  constructor(private fb: FormBuilder, private _api: ApiService) { }

  ngOnInit() {
    this.buildForm();
  }

  getControl(name: string | undefined) {
    return this.form.get(name!) as any;
  }

  buildForm() {
    const formGroup: { [key: string]: any } = {};

    this.steps.forEach(step => {
      step.controls.forEach(control => {
        const validators = control.required ? [Validators.required] : [];
        formGroup[control.name!] = ['', validators];
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

  nextStep() {
    let param = {
      campaignName: this.form.value.campaignName,
      country_id: 1,
      language_id: 1,
      loi: this.form.value.loi,
      ir: this.form.value.ir,
      total_completes: this.form.value.targetCompletes,
    }
    console.log(this.form.value);
    console.log("param", param);
    this._api.post('survey/campaigns', param).subscribe((res: any) => {
      console.log(res);
    })

    if (this.currentStep < this.totalSteps && this.isCurrentStepValid()) {
      this.currentStep++;
    }
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

}

interface FormControl {
  type: 'input' | 'dropdown' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  name?: string;
  colSpan?: number;
}

interface StepData {
  stepNumber: number;
  stepName: string;
  title: string;
  controls: FormControl[];
}
