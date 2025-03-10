import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Page429errorComponent } from './page429error.component';

describe('Page429errorComponent', () => {
  let component: Page429errorComponent;
  let fixture: ComponentFixture<Page429errorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page429errorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Page429errorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
