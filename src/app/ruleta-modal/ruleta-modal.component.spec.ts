import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuletaModalComponent } from './ruleta-modal.component';

describe('RuletaModalComponent', () => {
  let component: RuletaModalComponent;
  let fixture: ComponentFixture<RuletaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuletaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuletaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
