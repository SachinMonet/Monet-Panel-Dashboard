import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
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

  // Form Configuration
  form: FormGroup = this.fb.group({
    panelProvider: ['', Validators.required],
    maxComplete: ['', [Validators.required, Validators.min(1)]],
    cpi: ['', [Validators.required, Validators.min(0.01)]],
    entryUrl: ['', [Validators.required, Validators.pattern('https?://.+')]]
  });

 

  // --- State Signals ---
  currentStep = signal<number>(1);
  openQuestionId = signal<number | null>(null);

  // Data State
  private rawQuestions = signal<ApiQuestion[]>([]);
  panelProviders = signal<any[]>([]);

  // Selection State
  addedQuestionIds = signal<Set<number>>(new Set()); // The "Campaign" List
  selectedOptions = signal<{ [questionId: number]: Set<number> }>({}); // The Checkbox State

  // --- Computed Signals ---

  // 1. Transform Raw Data for UI
  questions = computed<UIQuestion[]>(() =>
    this.rawQuestions().map(q => ({
      id: q.qs_id,
      label: q.question,
      type: q.type
    }))
  );

  // 2. Map Options for easy access
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

  // 3. Filter for Search
  // filteredQuestions = computed(() => {
  //   const term = this.searchControl.value?.toLowerCase() || '';
  //   if (!term) return this.questions();

  //   return this.questions().filter(q =>
  //     q.label.toLowerCase().includes(term) || q.type.toLowerCase().includes(term)
  //   );
  // });

  // 4. Summary Footer Data
  selectedSummary = computed(() => {
    const allQuestions = this.rawQuestions();
    const selections = this.selectedOptions();
    const addedIds = this.addedQuestionIds();

    const summary: { id: number; title: string; options: string[] }[] = [];

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
              .map(opt => opt.option_value)
          });
        }
      }
    });
    return summary;
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  // --- Data Loading ---
  private loadInitialData(): void {
    // Mock Data (Replace with real API call)
    const mockData: ApiQuestion[] = [
      { qs_id: 1, question: "Age", type: "range", options: [{ opt_id: 1, option_value: "18-24" }, { opt_id: 2, option_value: "25-34" }, { opt_id: 3, option_value: "35-44" }, { opt_id: 4, option_value: "45-54" }, { opt_id: 5, option_value: "55+" }] },
      { qs_id: 2, question: "Gender", type: "single", options: [{ opt_id: 6, option_value: "Male" }, { opt_id: 7, option_value: "Female" }, { opt_id: 8, option_value: "Non-binary" }] },
      { qs_id: 3, question: "Employment", type: "single", options: [{ opt_id: 10, option_value: "Full-time" }, { opt_id: 11, option_value: "Part-time" }, { opt_id: 12, option_value: "Unemployed" }] },
      { qs_id: 4, question: "Education", type: "single", options: [{ opt_id: 13, option_value: "High school" }, { opt_id: 14, option_value: "College" }, { opt_id: 15, option_value: "Graduate" }] },
      { qs_id: 5, question: "Location", type: "single", options: [{ opt_id: 16, option_value: "Metro" }, { opt_id: 17, option_value: "Non-metro" }] }
    ];
    this.rawQuestions.set(mockData);

    // Load Providers
    this.apiService.get('panel-providers').subscribe({
      next: (res: any) => this.panelProviders.set(res.data),
      error: (err) => console.error('Failed to load providers', err)
    });
  }

  // --- Core Logic ---

  /**
   * Master Toggle: Adds or Removes a question from the campaign.
   * - Adding: Auto-selects ALL options if none were selected previously.
   * - Removing: Completely wipes selection data for that question.
   */
  toggleAddQuestion(questionId: number, event?: Event): void {
    event?.stopPropagation();

    const isAdded = this.addedQuestionIds().has(questionId);

    if (isAdded) {
      // Logic: Remove
      this.addedQuestionIds.update(ids => {
        const newIds = new Set(ids);
        newIds.delete(questionId);
        return newIds;
      });

      // Cleanup selections
      this.selectedOptions.update(opts => {
        const newOpts = { ...opts };
        delete newOpts[questionId];
        return newOpts;
      });

    } else {
      // Logic: Add
      this.addedQuestionIds.update(ids => {
        const newIds = new Set(ids);
        newIds.add(questionId);
        return newIds;
      });

      // Auto-Select All
      this.selectAllOptions(questionId);
    }
  }

  /**
   * Accordion Toggle
   */
  toggleAccordion(questionId: number): void {
    this.openQuestionId.update(curr => curr === questionId ? null : questionId);

    // UX: If opening an un-added question, maybe we want to prepopulate? 
    // Current logic: Only auto-selects if user clicks "+".
    // If you want opening accordion to auto-select, call this.selectAllOptions(questionId) here.
  }

  /**
   * Checkbox Toggle
   */
  toggleOption(questionId: number, optionId: number): void {
    this.selectedOptions.update(curr => {
      const updated = { ...curr };
      if (!updated[questionId]) updated[questionId] = new Set();

      const set = updated[questionId];
      set.has(optionId) ? set.delete(optionId) : set.add(optionId);

      return updated;
    });
  }

  // --- Helpers ---

  private selectAllOptions(questionId: number): void {
    const question = this.rawQuestions().find(q => q.qs_id === questionId);
    if (!question) return;

    this.selectedOptions.update(curr => {
      // Only select all if currently empty
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
    if (this.currentStep() === 1 && this.form.invalid) {
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
  }

  onFinish(): void {
    const submission = {
      ...this.form.value,
      qualifications: this.getFinalQualifications(),
      timestamp: new Date().toISOString()
    };
    console.log('Submitting:', submission);
    this.onCancel();
  }

  private getFinalQualifications() {
    // Only return data for questions currently in the "Added" list
    return this.selectedSummary().map(item => ({
      questionId: item.id,
      questionLabel: item.title,
      selectedOptionLabels: item.options
      // Add IDs if backend needs them
    }));
  }

  filteredQuestions = computed(() => {
    // FIX: Read from the signal (this.searchTerm()), NOT the control directly
    const term = this.searchTerm()?.toLowerCase() || '';
    
    if (!term) return this.questions();

    return this.questions().filter(q => 
      q.label.toLowerCase().includes(term) || q.type.toLowerCase().includes(term)
    );
  });


}
