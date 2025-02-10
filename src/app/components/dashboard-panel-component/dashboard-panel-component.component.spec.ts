import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardPanelComponentComponent } from './dashboard-panel-component.component';

describe('DashboardPanelComponentComponent', () => {
  let component: DashboardPanelComponentComponent;
  let fixture: ComponentFixture<DashboardPanelComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPanelComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardPanelComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
