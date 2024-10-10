import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditdeslindeComponent } from './editdeslinde.component';

describe('EditdeslindeComponent', () => {
  let component: EditdeslindeComponent;
  let fixture: ComponentFixture<EditdeslindeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditdeslindeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditdeslindeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
