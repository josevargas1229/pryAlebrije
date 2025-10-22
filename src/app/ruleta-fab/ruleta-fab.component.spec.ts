import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuletaFabComponent } from './ruleta-fab.component';

describe('RuletaFabComponent', () => {
  let component: RuletaFabComponent;
  let fixture: ComponentFixture<RuletaFabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuletaFabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuletaFabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
