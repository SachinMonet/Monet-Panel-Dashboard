import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCampaigns } from './create-campaigns';

describe('CreateCampaigns', () => {
  let component: CreateCampaigns;
  let fixture: ComponentFixture<CreateCampaigns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCampaigns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCampaigns);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
