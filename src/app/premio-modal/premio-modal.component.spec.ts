import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremioModalComponent } from './premio-modal.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('PremioModalComponent', () => {
  let component: PremioModalComponent;
  let fixture: ComponentFixture<PremioModalComponent>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: jasmine.createSpy('close'),
    };

    const dialogDataMock = {
      tipo: 'info',
      premio: '',
      cupon: '',
      mensaje: ''
    };

    await TestBed.configureTestingModule({
      imports: [
        PremioModalComponent,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PremioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });
});