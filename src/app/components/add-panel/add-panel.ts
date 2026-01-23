import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { toSignal } from '@angular/core/rxjs-interop';
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
  imports: [CommonModule, ReactiveFormsModule, FormsModule,],
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

  // Form Configuration
  form: FormGroup = this.fb.group({
    panelProvider: ['', Validators.required],
    maxComplete: ['', [Validators.required, Validators.min(1)]],
    cpi: ['', [Validators.required, Validators.min(0.01)]],
    entryUrl: ['', [Validators.required]],
    // ADD: Quotas FormArray
    quotas: this.fb.array([])
  });

  // --- State Signals ---
  currentStep = signal<number>(1);
  openQuestionId = signal<number | null>(null);

  // Data State
  private rawQuestions = signal<ApiQuestion[]>([]);
  panelProviders = signal<any[]>([]);
  isLoading = signal<boolean>(false);

  // Selection State
  addedQuestionIds = signal<Set<number>>(new Set());
  selectedOptions = signal<{ [questionId: number]: Set<number> }>({});

  // --- Computed Signals ---
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

  ngOnInit(): void {
    this.loadInitialData();
  }

  // --- QUOTA FORMARRAY METHODS ---

  /**
   * Get quotas FormArray
   */
  get quotas(): FormArray {
    return this.form.get('quotas') as FormArray;
  }

  /**
   * Get conditions FormArray for a specific quota
   */
  getConditions(quotaIndex: number): FormArray {
    return this.quotas.at(quotaIndex).get('conditions') as FormArray;
  }

  /**
   * Create a new quota FormGroup
   */
  createQuota(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      target: [0, [Validators.required, Validators.min(1)]],
      conditions: this.fb.array([])
    });
  }

  /**
   * Create a new condition FormGroup
   */
  createCondition(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      answer: ['', Validators.required]
    });
  }

  /**
   * Add new quota
   */
  addQuota(): void {
    this.quotas.push(this.createQuota());
  }

  /**
   * Remove quota
   */
  removeQuota(index: number): void {
    this.quotas.removeAt(index);
  }

  /**
   * Add condition to a specific quota
   */
  addCondition(quotaIndex: number): void {
    const conditions = this.getConditions(quotaIndex);
    conditions.push(this.createCondition());
  }

  /**
   * Remove condition from a specific quota
   */
  removeCondition(quotaIndex: number, conditionIndex: number): void {
    const conditions = this.getConditions(quotaIndex);
    conditions.removeAt(conditionIndex);
  }

  /**
   * Get available questions for dropdown (from selected qualifications)
   */
  getAvailableQuestionsForQuota() {
    return this.selectedSummary().map(item => ({
      value: item.id.toString(),
      label: item.title
    }));
  }

  /**
   * Get available options for a selected question in quota condition
   */
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

  // --- END QUOTA METHODS ---

  // --- Data Loading ---

  private loadInitialData(): void {
    this.isLoading.set(true);

    this.apiService.get('survey/question-options').subscribe({
      next: (data: any) => {
        this.rawQuestions.set(data.data);
        this.isLoading.set(false); // if this is the only call you care about
      },
      error: (err) => {
        console.error('Failed to load questions', err);
        this.isLoading.set(false);
      }
    });

    this.apiService.get('panel-providers').subscribe({
      next: (res: any) => {
        this.panelProviders.set(res.data);
        // optional: if you want loader to wait for both calls,
        // move isLoading.set(false) here and track both with a counter
      },
      error: (err) => {
        console.error('Failed to load providers', err);
        this.isLoading.set(false);
      }
    });
  }


  // --- Core Logic ---
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

  // --- Navigation & Submission ---
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
    // Clear quotas
    while (this.quotas.length > 0) {
      this.quotas.removeAt(0);
    }
    this.close.emit();
  }

 onFinish(skip?: boolean ): void {
  // 1. Validate quotas if on the final step
  if (this.currentStep() === 3 && this.quotas.invalid) {
    this.markFormGroupTouched(this.quotas);
    return;
  }

  // 2. Generate the dynamic payload
  //  const payload = {
  //    panel: {
  //      panel_provider_id: this.form.value.panelProvider,
  //      target_completes: this.form.value.maxComplete,
  //      cpi: this.form.value.cpi,
  //      entry_url: this.form.value.entryUrl,
  //    },
  //    qualifications: this.selectedSummary().map(item => ({
  //      qs_id: item.id,
  //      option_ids: item.options.map(o => o.id)
  //    })),
  //    quotas: this.form.value.quotas.map((q: any) => ({
  //      quota_name: q.name,
  //      target: q.target,
  //      conditions: q.conditions.map((cond: any) => ({
  //        qs_id: cond.question ? Number(cond.question) : null,
  //        opt_id: cond.answer ? Number(cond.answer) : null
  //      }))
  //    })),
  //    skip: skip
  //  };
  // 1. Prepare the common panel data
const panelData = {
  panel_provider_id: this.form.value.panelProvider,
  target_completes: this.form.value.maxComplete,
  cpi: this.form.value.cpi,
  entry_url: this.form.value.entryUrl,
};

let payload;

if (skip) {
  // 2. Simple payload if skip is true
  payload = {
    panel: panelData,
    skip: true
  };
} else {
  // 3. Full payload if skip is false
  payload = {
    panel: panelData,
    qualifications: this.selectedSummary().map(item => ({
      qs_id: item.id,
      option_ids: item.options.map(o => o.id)
    })),
    quotas: this.form.value.quotas.map((q: any) => ({
      quota_name: q.name,
      target: q.target,
      // Fixed: Now maps multiple conditions within one quota
      conditions: q.conditions.map((cond: any) => ({
        qs_id: cond.question ? Number(cond.question) : null,
        opt_id: cond.answer ? Number(cond.answer) : null
      }))
    })),
    skip: false
  };
}

  // 3. Log and process
  console.log('Dynamic Payload:', payload);

  // If you still need the full local submission object for other logic:
  const submission = {
    ...this.form.value,
    qualifications: this.getFinalQualifications(),
    timestamp: new Date().toISOString()
  };
  console.log('Submitting Meta:', submission);

  // Close/Reset
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

  /**
   * Helper method to mark all fields as touched for validation
   */
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

  // Inside AddPanel class

  /**
   * Helper to get the options available for a specific condition row.
   * It looks up the questionId currently selected in that row's dropdown.
   */
  getOptionsForCondition(quotaIndex: number, conditionIndex: number): UIOption[] {
    const conditionGroup = this.getConditions(quotaIndex).at(conditionIndex);
    const questionId = conditionGroup.get('question')?.value;

    if (!questionId) return [];

    // Find the question in our selected summary to get its specific options
    const selectedQuestion = this.selectedSummary().find(
      (q) => q.id.toString() === questionId.toString()
    );

    return selectedQuestion ? selectedQuestion.options : [];
  }

  /**
   * Update the createCondition to initialize answer with empty string
   */




}





