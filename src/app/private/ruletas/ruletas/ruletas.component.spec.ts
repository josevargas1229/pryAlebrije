import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RuletaService } from '../ruleta.service';
import { RuletasComponent } from './ruletas.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RuletasComponent', () => {
  let component: RuletasComponent;
  let fixture: ComponentFixture<RuletasComponent>;
  let serviceSpy: jasmine.SpyObj<RuletaService>;

  const mockRuletas = [{ id: 1, activo: true }];

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('RuletaService', ['getAll']);
    serviceSpy.getAll.and.returnValue(of(mockRuletas));

    await TestBed.configureTestingModule({
      declarations: [RuletasComponent],
      providers: [{ provide: RuletaService, useValue: serviceSpy }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RuletasComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar ruletas al iniciar', () => {
    fixture.detectChanges();
    expect(serviceSpy.getAll).toHaveBeenCalled();
    expect(component.ruletas).toEqual(mockRuletas);
  });
});