import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BloqueosComponent } from './bloqueos.component';

describe('BloqueosComponent', () => {
  let component: BloqueosComponent;
  let fixture: ComponentFixture<BloqueosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BloqueosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BloqueosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
