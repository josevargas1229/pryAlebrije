import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalSettingsComponent } from './legal-settings.component';

describe('LegalSettingsComponent', () => {
  let component: LegalSettingsComponent;
  let fixture: ComponentFixture<LegalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
