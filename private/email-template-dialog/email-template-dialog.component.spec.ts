import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTemplateDialogComponent } from './email-template-dialog.component';

describe('EmailTemplateDialogComponent', () => {
  let component: EmailTemplateDialogComponent;
  let fixture: ComponentFixture<EmailTemplateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTemplateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
