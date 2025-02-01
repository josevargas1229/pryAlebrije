import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page400errorComponent } from './page400error.component';

describe('Page400errorComponent', () => {
  let component: Page400errorComponent;
  let fixture: ComponentFixture<Page400errorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page400errorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page400errorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
