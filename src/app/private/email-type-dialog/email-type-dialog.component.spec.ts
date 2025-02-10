import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailTypeDialogComponent } from './email-type-dialog.component';

describe('EmailTypeDialogComponent', () => {
  let component: EmailTypeDialogComponent;
  let fixture: ComponentFixture<EmailTypeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailTypeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailTypeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
