import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ToastService } from 'angular-toastify';
import { RuletaService } from '../ruleta.service';
import { RuletaFormComponent } from './ruleta-form.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RuletaFormComponent', () => {
  let component: RuletaFormComponent;
  let fixture: ComponentFixture<RuletaFormComponent>;
  let serviceSpy: jasmine.SpyObj<RuletaService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let dialogSpy: jasmine.SpyObj<MatDialogRef<RuletaFormComponent>>;

  const file = new File([''], 'test.jpg', { type: 'image/jpeg' });

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('RuletaService', ['create']);
    toastSpy = jasmine.createSpyObj('ToastService', ['error', 'success']);
    dialogSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    serviceSpy.create.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MatDialogModule],
      declarations: [RuletaFormComponent],
      providers: [
        { provide: RuletaService, useValue: serviceSpy },
        { provide: ToastService, useValue: toastSpy },
        { provide: MatDialogRef, useValue: dialogSpy },
        { provide: MAT_DIALOG_DATA, useValue: null }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RuletaFormComponent);
    component = fixture.componentInstance;
  });

  it('debe crear ruleta con ambas imágenes', () => {
    component.files['imagen_ruleta'] = file;
    component.files['imagen_background'] = file;

    component.guardar();

    expect(serviceSpy.create).toHaveBeenCalledWith(jasmine.any(FormData));
    expect(toastSpy.success).toHaveBeenCalledWith('Ruleta creada correctamente');
    expect(dialogSpy.close).toHaveBeenCalledWith(true);
  });
});