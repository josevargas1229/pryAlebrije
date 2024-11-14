import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePasswordDialogComponentComponent } from './change-password-dialog-component.component';

describe('ChangePasswordDialogComponentComponent', () => {
  let component: ChangePasswordDialogComponentComponent;
  let fixture: ComponentFixture<ChangePasswordDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePasswordDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangePasswordDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
