import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticasPrivacidadComponent } from './politicas-privacidad.component';

describe('PoliticasPrivacidadComponent', () => {
  let component: PoliticasPrivacidadComponent;
  let fixture: ComponentFixture<PoliticasPrivacidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticasPrivacidadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticasPrivacidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
