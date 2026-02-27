import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help-and-support',
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './help-and-support.html',
  styleUrl: './help-and-support.scss',
})
export class HelpAndSupport {
 isEditMode = signal(false);

  helpFields: any[] = [
    { key: 'name', label: 'Your Name', placeholder: 'e.g. Sachin Sharma', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'e.g. sachin@example.com', type: 'email' },
    { key: 'subject', label: 'Subject', placeholder: 'e.g. Issue with panel settings', type: 'text' },
    { key: 'message', label: 'Message', placeholder: 'Describe your issue or question', type: 'textarea' },
  ];

  helpForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.helpForm = this.fb.group({
      name: ['Sachin Sharma', Validators.required],
      email: ['sachin@example.com', [Validators.required, Validators.email]],
      subject: [''],
      message: [''],
    });

    // default view mode (disabled)
    this.helpForm.disable();
  }

  toggleEdit(): void {
    const next = !this.isEditMode();
    this.isEditMode.set(next);

    if (next) {
      this.helpForm.enable();
    } else {
      this.helpForm.disable();
    }
  }

  onSubmit(): void {
    if (this.helpForm.invalid) {
      this.helpForm.markAllAsTouched();
      return;
    }

    const value = this.helpForm.getRawValue();
    console.log('HELP & SUPPORT FORM =>', value);
    alert(JSON.stringify(value, null, 2));

    // after submit, keep it simple: back to view mode
    this.isEditMode.set(false);
    this.helpForm.disable();
  }
}
