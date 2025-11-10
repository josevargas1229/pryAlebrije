import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremiosFormComponent } from './premios-form.component';

describe('PremiosFormComponent', () => {
  let component: PremiosFormComponent;
  let fixture: ComponentFixture<PremiosFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiosFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremiosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
