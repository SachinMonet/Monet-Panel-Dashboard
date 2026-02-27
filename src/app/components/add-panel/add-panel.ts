import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, Inject, inject, Input, Output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
export interface ApiOption {
  opt_id: number;
  option_value: string;
}

export interface ApiQuestion {
  qs_id: number;
  question: string;
  type: string;
  options: ApiOption[];
}

export interface UIQuestion {
  id: number;
  label: string;
  type: string;
}

export interface UIOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-add-panel',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatDialogModule],
  templateUrl: './add-panel.html',
  styleUrl: './add-panel.scss',
})
export class AddPanel {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  searchControl = new FormControl('');
  private searchTerm = toSignal(
    this.searchControl.valueChanges,
    { initialValue: '' }
  );
  @Output() close = new EventEmitter<void>();
  @Input() panelId: number | null = null;

  form: FormGroup = this.fb.group({
    panelProvider: ['', Validators.required],
    maxComplete: ['', [Validators.required,]],
    cpi: ['', [Validators.required, Validators.min(0.01)]],
    entryUrl: ['', [Validators.required]],
    quotas: this.fb.array([])
  });

  currentStep = signal<number>(1);
  openQuestionId = signal<number | null>(null);

  private rawQuestions = signal<ApiQuestion[]>([]);
  panelProviders = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  editPanelId = signal<number | null>(null);
  isEditMode = computed(() => this.data?.component === 'edit');

  addedQuestionIds = signal<Set<number>>(new Set());
  selectedOptions = signal<{ [questionId: number]: Set<number> }>({});

  questions = computed<UIQuestion[]>(() =>
    this.rawQuestions().map(q => ({
      id: q.qs_id,
      label: q.question,
      type: q.type
    }))
  );

  questionOptions = computed<{ [key: number]: UIOption[] }>(() => {
    const map: { [key: number]: UIOption[] } = {};
    this.rawQuestions().forEach(q => {
      map[q.qs_id] = q.options.map(opt => ({
        id: opt.opt_id,
        label: opt.option_value
      }));
    });
    return map;
  });

  filteredQuestions = computed(() => {
    const term = this.searchTerm()?.toLowerCase() || '';
    if (!term) return this.questions();
    return this.questions().filter(q =>
      q.label.toLowerCase().includes(term) || q.type.toLowerCase().includes(term)
    );
  });

  selectedSummary = computed(() => {
    const allQuestions = this.rawQuestions();
    const selections = this.selectedOptions();
    const addedIds = this.addedQuestionIds();

    const summary: { id: number; title: string; options: any[] }[] = [];

    addedIds.forEach(qId => {
      const optionSet = selections[qId];
      if (optionSet && optionSet.size > 0) {
        const question = allQuestions.find(q => q.qs_id === qId);
        if (question) {
          summary.push({
            id: qId,
            title: question.question,
            options: question.options
              .filter(opt => optionSet.has(opt.opt_id))
              .map(opt => ({
                id: opt.opt_id,
                label: opt.option_value
              }))
          });
        }
      }
    });
    return summary;
  });

  constructor(private dialogRef: MatDialogRef<AddPanel>, @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data && data.allocationMode =='auto') {
      this.form.patchValue({
        maxComplete: 'Auto',
      })
    }
    console.log('Received data:', data);
    if (data && data.component === 'edit') {
  let campaignId = localStorage.getItem('campaignId');
this.editPanelId.set(data.panelProviderId);
  this.apiService.get(`campaign/${campaignId}/panel/${data.panelProviderId}/final-get`).subscribe({
    next: (res: any) => {
      const panel = res.panel;
      console.log('Panel details:', panel);
      this.form.patchValue({
        panelProvider: panel.panel_provider_id,
        maxComplete: panel.target_completes,
        cpi: panel.cpi,
        entryUrl: panel.entry_url,
      });

      const qualifications = res.panel.qualifications;
      const optionsMap = qualifications.reduce((acc: any, qual: any) => {
        acc[qual.qs_id] = new Set(qual.option_ids);
        return acc;
      }, {});
      this.selectedOptions.set(optionsMap);

      const addedIds = new Set<number>(qualifications.map((q: any) => q.qs_id));
      this.addedQuestionIds.set(addedIds);

      const quotas = res.panel.quotas || [];
      while (this.quotas.length > 0) this.quotas.removeAt(0); // clear existing

      quotas.forEach((q: any) => {
        const quotaGroup = this.createQuota();
        quotaGroup.patchValue({
          name: q.quota_name,
          target: q.target
        });

        const conditionsArray = quotaGroup.get('conditions') as FormArray;
        (q.conditions || []).forEach((cond: any) => {
          const condGroup = this.createCondition();
          condGroup.patchValue({
            question: cond.qs_id?.toString(),
            answer: cond.opt_id?.toString()
          });
          conditionsArray.push(condGroup);
        });

        this.quotas.push(quotaGroup);
      });
    },
    error: (err) => {
      console.error('Error fetching panel details:', err);
    }
  });
}
  }
  Cancel(notChangeStep?: boolean) {
    this.dialogRef.close({ save: notChangeStep });
  }


  ngOnInit(): void {
    this.loadInitialData();
  }

  get quotas(): FormArray {
    return this.form.get('quotas') as FormArray;
  }

  getConditions(quotaIndex: number): FormArray {
    return this.quotas.at(quotaIndex).get('conditions') as FormArray;
  }


  createQuota(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      target: [0, [Validators.required, Validators.min(1)]],
      conditions: this.fb.array([])
    });
  }


  createCondition(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    });
  }


  addQuota(): void {
    this.quotas.push(this.createQuota());
  }


  removeQuota(index: number): void {
    this.quotas.removeAt(index);
  }


  addCondition(quotaIndex: number): void {
    const conditions = this.getConditions(quotaIndex);
    conditions.push(this.createCondition());
  }


  removeCondition(quotaIndex: number, conditionIndex: number): void {
    const conditions = this.getConditions(quotaIndex);
    conditions.removeAt(conditionIndex);
  }


  getAvailableQuestionsForQuota() {
    return this.selectedSummary().map(item => ({
      value: item.id.toString(),
      label: item.title
    }));
  }


  getOptionsForQuestion(questionId: string): string[] {
    const qId = parseInt(questionId);
    const question = this.rawQuestions().find(q => q.qs_id === qId);
    if (!question) return [];

    const selectedOpts = this.selectedOptions()[qId];
    if (!selectedOpts) return [];

    return question.options
      .filter(opt => selectedOpts.has(opt.opt_id))
      .map(opt => opt.option_value);
  }



  private loadInitialData(): void {
    this.isLoading.set(true);

    this.apiService.get('survey/question-options').subscribe({
      next: (data: any) => {
        this.rawQuestions.set(data.data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load questions', err);
        this.isLoading.set(false);
      }
    });
    this.isLoading.set(true);
    this.apiService.get('panel-providers').subscribe({

      next: (res: any) => {
        this.isLoading.set(false);
        this.panelProviders.set(res.data);
       // this.form.patchValue({ panelProvider: this.panelProviders()[0].id });
      },
      error: (err) => {
        console.error('Failed to load providers', err);
        this.isLoading.set(false);
      }
    });
  }


  toggleAddQuestion(questionId: number, event?: Event): void {
    event?.stopPropagation();

    const isAdded = this.addedQuestionIds().has(questionId);

    if (isAdded) {
      this.addedQuestionIds.update(ids => {
        const newIds = new Set(ids);
        newIds.delete(questionId);
        return newIds;
      });

      this.selectedOptions.update(opts => {
        const newOpts = { ...opts };
        delete newOpts[questionId];
        return newOpts;
      });
    } else {
      this.addedQuestionIds.update(ids => {
        const newIds = new Set(ids);
        newIds.add(questionId);
        return newIds;
      });

      this.selectAllOptions(questionId);
    }
  }

  toggleAccordion(questionId: number): void {
    this.openQuestionId.update(curr => curr === questionId ? null : questionId);
  }

  toggleOption(questionId: number, optionId: number): void {
    this.selectedOptions.update(curr => {
      const updated = { ...curr };
      if (!updated[questionId]) updated[questionId] = new Set();

      const set = updated[questionId];
      set.has(optionId) ? set.delete(optionId) : set.add(optionId);

      return updated;
    });
  }

  private selectAllOptions(questionId: number): void {
    const question = this.rawQuestions().find(q => q.qs_id === questionId);
    if (!question) return;

    this.selectedOptions.update(curr => {
      if (!curr[questionId] || curr[questionId].size === 0) {
        return {
          ...curr,
          [questionId]: new Set(question.options.map(o => o.opt_id))
        };
      }
      return curr;
    });
  }

  isQuestionAdded(id: number): boolean {
    return this.addedQuestionIds().has(id);
  }

  isOptionSelected(qId: number, optId: number): boolean {
    return this.selectedOptions()[qId]?.has(optId) ?? false;
  }

  onNext(): void {
    if (this.currentStep() === 1 && this.form.get('panelProvider')?.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.currentStep() < 3) {
      this.currentStep.update(s => s + 1);
      if (this.currentStep() === 3) this.searchControl.reset();
    }
  }

  onBack(): void {
    if (this.currentStep() > 1) this.currentStep.update(s => s - 1);
  }

  onCancel(): void {
    this.form.reset();
    this.selectedOptions.set({});
    this.addedQuestionIds.set(new Set());
    this.currentStep.set(1);
    this.openQuestionId.set(null);
    while (this.quotas.length > 0) {
      this.quotas.removeAt(0);
    }
    this.close.emit();
  }

  onFinish(skip?: boolean): void {
    if (this.currentStep() === 3 && this.quotas.invalid) {
      this.markFormGroupTouched(this.quotas);
      return;
    }

    const panelData = {
      panel_provider_id: this.form.value.panelProvider,
      target_completes: this.form.value.maxComplete,
      cpi: this.form.value.cpi,
      entry_url: this.form.value.entryUrl,
    };

    let payload;

    if (skip) {
      payload = {
        panel: panelData,
        skip: true
      };
    } else {
      payload = {
        panel: panelData,
        qualifications: this.selectedSummary().map(item => ({
          qs_id: item.id,
          option_ids: item.options.map(o => o.id)
        })),
        quotas: this.form.value.quotas.map((q: any) => ({
          quota_name: q.name,
          target: q.target,
          conditions: q.conditions.map((cond: any) => ({
            qs_id: cond.question ? Number(cond.question) : null,
            opt_id: cond.answer ? Number(cond.answer) : null
          }))
        })),
        skip: false
      };
    }

    let id = localStorage.getItem('campaignId');
    this.isLoading.set(true);
    this.apiService.post<any>('survey/campaigns/' + id + '/final-submit', payload).subscribe({
      next: (res: any) => {
        this.onCancel();
        this.Cancel(false);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to add panel', err);
        this.onCancel();
      }
    })

    const submission = {
      ...this.form.value,
      qualifications: this.getFinalQualifications(),
      timestamp: new Date().toISOString()
    };

    this.onCancel();

  }

  private getFinalQualifications() {
    return this.selectedSummary().map(item => ({
      questionId: item.id,
      questionLabel: item.title,
      selectedOptionIds: item.options.map(o => o.id),
      selectedOptionLabels: item.options.map(o => o.label)
    }));
  }


  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getOptionLabels(item: any): string {
    return item.options.map((o: any) => o.label).join(', ');
  }


  getOptionsForCondition(quotaIndex: number, conditionIndex: number): UIOption[] {
    const conditionGroup = this.getConditions(quotaIndex).at(conditionIndex);
    const questionId = conditionGroup.get('question')?.value;

    if (!questionId) return [];

    const selectedQuestion = this.selectedSummary().find(
      (q) => q.id.toString() === questionId.toString()
    );

    return selectedQuestion ? selectedQuestion.options : [];
  }

 onUpdate(): void {
  if (this.currentStep() === 3 && this.quotas.invalid) {
    this.markFormGroupTouched(this.quotas);
    return;
  }

  const panelData = {
    panel_provider_id: this.form.value.panelProvider,
    target_completes: this.form.value.maxComplete,
    cpi: this.form.value.cpi,
    entry_url: this.form.value.entryUrl,
  };

  const payload = {
    panel: panelData,
    qualifications: this.selectedSummary().map(item => ({
      qs_id: item.id,
      option_ids: item.options.map(o => o.id)
    })),
    quotas: this.form.value.quotas.map((q: any) => ({
      quota_name: q.name,
      target: q.target,
      conditions: q.conditions.map((cond: any) => ({
        qs_id: cond.question ? Number(cond.question) : null,
        opt_id: cond.answer ? Number(cond.answer) : null
      }))
    })),
    skip: false
  };

  let id = localStorage.getItem('campaignId');
  const url = `survey/campaigns/${id}/panels/${this.editPanelId()}/final-update`;

  this.isLoading.set(true);
  this.apiService.put<any>(url, payload).subscribe({
    next: (res: any) => {
      this.onCancel();
      this.Cancel(false);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Failed to update panel', err);
      this.onCancel();
    }
  });
}


}





