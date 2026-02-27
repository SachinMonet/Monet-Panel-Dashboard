import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-profile',
  imports: [ReactiveFormsModule,RouterLink ],
  templateUrl: './my-profile.html',
  styleUrl: './my-profile.scss',
  
})
export class MyProfile {

  isEditMode = signal(false);

  profileFields: any[] = [
    { key: 'firstName', label: 'First Name', placeholder: 'e.g. Sachin', type: 'text' },
    { key: 'lastName', label: 'Last Name', placeholder: 'e.g. Sharma', type: 'text' },
    { key: 'email', label: 'Email', placeholder: 'e.g. sachin@example.com', type: 'email' },
    { key: 'role', label: 'Role', placeholder: 'e.g. Frontend Engineer', type: 'text' },
    { key: 'location', label: 'Location', placeholder: 'e.g. Gurugram, Haryana', type: 'text' },
    { key: 'about', label: 'About Me', placeholder: 'Short description about you', type: 'textarea' },
  ];

  profileForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: ['Sachin', Validators.required],
      lastName: ['Sharma'],
      email: ['sachin@example.com', Validators.email],
      role: ['Frontend Engineer'],
      location: ['Gurugram, Haryana'],
      about: ['Software engineer who loves new tech.'],
    });

    // initial state: view only
    this.profileForm.disable();
  }

  toggleEdit(): void {
    const next = !this.isEditMode();
    this.isEditMode.set(next);

    if (next) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const value = this.profileForm.getRawValue();
    console.log('PROFILE FORM VALUE =>', value);
    alert(JSON.stringify(value, null, 2));

    // after successful save, switch back to view mode
    this.isEditMode.set(false);
    this.profileForm.disable();
  }
}
