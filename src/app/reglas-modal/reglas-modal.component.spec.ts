import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglasModalComponent } from './reglas-modal.component';

describe('ReglasModalComponent', () => {
  let component: ReglasModalComponent;
  let fixture: ComponentFixture<ReglasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglasModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
