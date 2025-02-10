import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTypesComponent } from './email-types.component';

describe('EmailTypesComponent', () => {
  let component: EmailTypesComponent;
  let fixture: ComponentFixture<EmailTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
