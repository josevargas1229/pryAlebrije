import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremioModalComponent } from './premio-modal.component';

describe('PremioModalComponent', () => {
  let component: PremioModalComponent;
  let fixture: ComponentFixture<PremioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremioModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
