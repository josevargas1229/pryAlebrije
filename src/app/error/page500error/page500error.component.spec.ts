import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page500errorComponent } from './page500error.component';

describe('Page500errorComponent', () => {
  let component: Page500errorComponent;
  let fixture: ComponentFixture<Page500errorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page500errorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page500errorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
