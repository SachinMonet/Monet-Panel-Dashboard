import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api';
import { toSignal } from '@angular/core/rxjs-interop';
const   data = {
  "status": true,
  "data": [
    {
      "qs_id": 1,
      "question": "Age",
      "type": "range",
      "options": [
        {
          "opt_id": 1,
          "option_value": "18-24"
        },
        {
          "opt_id": 2,
          "option_value": "25-34"
        },
        {
          "opt_id": 3,
          "option_value": "35-44"
        },
        {
          "opt_id": 4,
          "option_value": "45-54"
        },
        {
          "opt_id": 5,
          "option_value": "55+"
        }
      ]
    },
    {
      "qs_id": 2,
      "question": "Gender",
      "type": "single",
      "options": [
        {
          "opt_id": 6,
          "option_value": "Male"
        },
        {
          "opt_id": 7,
          "option_value": "Female"
        },
        {
          "opt_id": 8,
          "option_value": "Non-binary"
        },
        {
          "opt_id": 9,
          "option_value": "Prefer not to say"
        }
      ]
    },
    {
      "qs_id": 3,
      "question": "Employment Status",
      "type": "single",
      "options": [
        {
          "opt_id": 10,
          "option_value": "Employed Full-time"
        },
        {
          "opt_id": 11,
          "option_value": "Employed Part-time"
        },
        {
          "opt_id": 12,
          "option_value": "Self-employed"
        },
        {
          "opt_id": 13,
          "option_value": "Unemployed"
        },
        {
          "opt_id": 14,
          "option_value": "Retired"
        }
      ]
    },
    {
      "qs_id": 4,
      "question": "Household Income",
      "type": "range",
      "options": [
        {
          "opt_id": 15,
          "option_value": "\u003C$25k"
        },
        {
          "opt_id": 16,
          "option_value": "$25k-$50k"
        },
        {
          "opt_id": 17,
          "option_value": "$50k-$75k"
        },
        {
          "opt_id": 18,
          "option_value": "$75k-$100k"
        },
        {
          "opt_id": 19,
          "option_value": "\u003E$100k"
        }
      ]
    },
    {
      "qs_id": 5,
      "question": "Education Level",
      "type": "single",
      "options": [
        {
          "opt_id": 20,
          "option_value": "High School"
        },
        {
          "opt_id": 21,
          "option_value": "Some College"
        },
        {
          "opt_id": 22,
          "option_value": "Bachelor's"
        },
        {
          "opt_id": 23,
          "option_value": "Master's"
        },
        {
          "opt_id": 24,
          "option_value": "Doctorate"
        }
      ]
    }
  ]
}

interface PanelProvider {
  id: number | string;
  name: string;
}

interface QuestionOption {
  id: string;
  label: string;
}



interface ApiOption {
  opt_id: number;
  option_value: string;
}

interface ApiQuestion {
  qs_id: number;
  question: string;
  type: string;
  options: ApiOption[];
}

interface Question {
  id: number;
  label: string;
  type: string;
}

interface Option {
  id: number;
  label: string;
}

@Component({
  selector: 'app-add-panel',
  imports: [CommonModule,ReactiveFormsModule,FormsModule,],
  templateUrl: './add-panel.html',
  styleUrl: './add-panel.scss',
})
export class AddPanel {
  data = data

private fb = inject(FormBuilder);
  private api = inject(ApiService);

  // --- Outputs ---
  @Output() close = new EventEmitter<void>();
  @Output() savePanel = new EventEmitter<any>();

  // --- 2. State Management (Signals) ---
  currentStep = signal<number>(1);
  openQuestionId = signal<string | null>(null); // For accordion
  
  // Data Signals
  panelProviders = signal<PanelProvider[]>([]);
  
  // Selection State: Record<QuestionId, Set<OptionId>>
  selectedOptions = signal<Record<string, Set<string>>>({});

  // --- 3. Form Configuration ---
  form = this.fb.group({
    panelProvider: ['', Validators.required],
    maxComplete: [null, [Validators.required, Validators.min(1)]],
    cpi: [null, [Validators.required, Validators.min(0)]],
    entryUrl: ['', [Validators.required, Validators.pattern(/https?:\/\/.+/)]],
  });

  // Search Control
  searchControl = new FormControl('');
  // Convert RxJS stream to Signal for easy computing
  searchQuery = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  // --- 4. Static Data (Could also come from API) ---
  // Using readonly to prevent accidental mutation
  readonly ALL_QUESTIONS: any[] = [
    { id: 'age', label: 'Age', type: 'range' },
    { id: 'gender', label: 'Gender', type: 'single' },
    { id: 'employment_status', label: 'Employment Status', type: 'single' },
    { id: 'household_income', label: 'Household Income', type: 'range' },
    { id: 'education_level', label: 'Education Level', type: 'single' },
  ];

  readonly QUESTION_OPTIONS: Record<string, QuestionOption[]> = {
    gender: [
      { id: 'male', label: 'Male' },
      { id: 'female', label: 'Female' },
      { id: 'non_binary', label: 'Non-binary' },
      { id: 'prefer_not_say', label: 'Prefer not to say' },
    ],
    employment_status: [
      { id: 'employed', label: 'Employed' },
      { id: 'unemployed', label: 'Unemployed' },
      { id: 'self-employed', label: 'Self-employed' },
      { id: 'retired', label: 'Retired' },
    ],
    // Add others...
  };

  // Create a signal for options to use in template easily
  questionOptions = signal(this.QUESTION_OPTIONS);

  // --- 5. Computed Signals (The Magic) ---
  // Automatically updates when searchQuery changes
  filteredQuestions = computed(() => {
    const term = this.searchQuery()?.toLowerCase().trim();
    if (!term) return this.ALL_QUESTIONS;
    return this.ALL_QUESTIONS.filter(q => q.label.toLowerCase().includes(term));
  });

  constructor() {
    this.loadProviders();
  }

  private loadProviders() {
    this.api.get('panel-providers').subscribe({
      next: (res: any) => this.panelProviders.set(res.data),
      error: (err) => console.error('Failed to load providers', err)
    });
  }

  // --- 6. Event Handlers ---

  // Accordion Logic
  toggleQuestion(questionId: string) {
    this.openQuestionId.update(current => current === questionId ? null : questionId);
  }

  // Checkbox Logic
  toggleOption(questionId: string, optionId: string) {
    this.selectedOptions.update(currentMap => {
      // Create a shallow copy of the map to ensure immutability triggers change detection
      const newMap = { ...currentMap };
      
      if (!newMap[questionId]) {
        newMap[questionId] = new Set<string>();
      }

      const set = newMap[questionId];
      if (set.has(optionId)) {
        set.delete(optionId);
      } else {
        set.add(optionId);
      }
      
      return newMap;
    });
  }

  // Helper for Template to check checked state
  isOptionSelected(questionId: string, optionId: string): boolean {
    return this.selectedOptions()[questionId]?.has(optionId) ?? false;
  }

  // --- 7. Navigation Logic ---

  onNext() {
    const step = this.currentStep();

    // Step 1 Validation
    if (step === 1) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }
      this.currentStep.set(2);
      return;
    }

    // Step 2 Validation (Optional: Ensure at least one qualification is picked?)
    if (step === 2) {
      // Example: Log selections or validate
      // const selections = this.selectedOptions();
      this.currentStep.set(3);
      return;
    }
  }

  onBack() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onCancel() {
    this.close.emit();
  }

  onFinish() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.currentStep.set(1); // Return to step 1 to show errors
      return;
    }

    // Prepare final payload
    const payload = {
      ...this.form.getRawValue(),
      qualifications: this.serializeQualifications()
    };

    this.savePanel.emit(payload);
  }

  // Helper to convert Sets to Arrays for API
  private serializeQualifications() {
    const selections = this.selectedOptions();
    const result: any = {};
    
    Object.keys(selections).forEach(qId => {
      const selectedIds = Array.from(selections[qId]);
      if (selectedIds.length > 0) {
        result[qId] = selectedIds;
      }
    });
    
    return result;
  }



}
