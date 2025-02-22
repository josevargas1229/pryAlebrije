import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesFormComponent } from './detalles-form.component';

describe('DetallesFormComponent', () => {
  let component: DetallesFormComponent;
  let fixture: ComponentFixture<DetallesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
