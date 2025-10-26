import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RuletaModalComponent } from './ruleta-modal.component';
import { MatDialogModule, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { RuletaService } from '../services/ruleta/ruleta.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { ToastService } from 'angular-toastify';
import { RuletaComponent } from '../components/ruleta/ruleta.component';
import { of } from 'rxjs';

describe('RuletaModalComponent', () => {
  let component: RuletaModalComponent;
  let fixture: ComponentFixture<RuletaModalComponent>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: jasmine.createSpy('close'),
    };

    const ruletaServiceMock = {
      getIntentosDisponibles: jasmine.createSpy('getIntentosDisponibles').and.returnValue(of({ disponibles: 1 })),
      getSegmentos: jasmine.createSpy('getSegmentos').and.returnValue(of([
        { premio: { id: 1, nombre: 'Descuento 10%' }, probabilidad_pct: 30 },
        { premio: { id: 2, nombre: 'Descuento 5%' }, probabilidad_pct: 40 },
        { premio_id: null, probabilidad_pct: 30 }
      ])),
      spin: jasmine.createSpy('spin').and.returnValue(of({ resultado: 'gano_premio', premio: { id: 1, nombre: 'Descuento 10%' }, cupon: { codigo: 'CUPON123' } })),
    };

    const authServiceMock = {
      checkAuthStatus: jasmine.createSpy('checkAuthStatus').and.returnValue(Promise.resolve({ isValid: true })),
    };

    const routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    const toastServiceMock = {
      success: jasmine.createSpy('success'),
      info: jasmine.createSpy('info'),
      error: jasmine.createSpy('error'),
    };

    const dialogMock = {
      open: jasmine.createSpy('open').and.returnValue({ afterClosed: () => of(true) }),
    };

    const ruletaComponentMock = {
      spinning: jasmine.createSpy('spinning').and.returnValue(false),
      spinToSegment: jasmine.createSpy('spinToSegment'),
      spinDemo: jasmine.createSpy('spinDemo'),
    };

    await TestBed.configureTestingModule({
      imports: [
        RuletaModalComponent,
        MatDialogModule,
        RuletaComponent // Importa el componente hijo
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: RuletaService, useValue: ruletaServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        // No proveas RuletaComponent como servicio, ya que es un componente
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RuletaModalComponent);
    component = fixture.componentInstance;

    // Simula el ViewChild para RuletaComponent
    component.wheel = ruletaComponentMock as any;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });
});