import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarianteFormComponent } from './variante-form.component';

describe('VarianteFormComponent', () => {
  let component: VarianteFormComponent;
  let fixture: ComponentFixture<VarianteFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VarianteFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VarianteFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
