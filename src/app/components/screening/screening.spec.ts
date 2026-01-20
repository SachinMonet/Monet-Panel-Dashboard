import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Screening } from './screening';

describe('Screening', () => {
  let component: Screening;
  let fixture: ComponentFixture<Screening>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Screening]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Screening);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
