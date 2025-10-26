import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CheckoutComponent } from './checkout.component';
import { CartService } from '../services/cart/cart.service';
import { VentaService } from '../services/ventas/venta.service';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('CheckoutComponent', () => {
  let component: CheckoutComponent;
  let fixture: ComponentFixture<CheckoutComponent>;
  let cartServiceMock: any;
  let ventaServiceMock: any;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
  const cartSubject = new BehaviorSubject<any[]>([]);
  cartServiceMock = {
    cart$: cartSubject.asObservable(),
    cartSubject,
    clearCart: jasmine.createSpy('clearCart'),
  };

  ventaServiceMock = {
    crearOrdenPaypal: jasmine.createSpy('crearOrdenPaypal').and.returnValue(of({ id: 'paypal-order-id' })),
    capturarOrdenPaypal: jasmine.createSpy('capturarOrdenPaypal').and.returnValue(of({})),
    createVenta: jasmine.createSpy('createVenta').and.returnValue(of({ id: 'venta-id' })),
    crearPreferenciaMercadoPago: jasmine.createSpy('crearPreferenciaMercadoPago').and.returnValue(of({ id: 'mp-preference-id', init_point: 'https://sandbox.mercadopago.com' })),
  };

  authServiceMock = {
    checkAuthStatus: jasmine.createSpy('checkAuthStatus').and.returnValue(Promise.resolve({ userId: 1, tipo: 1, direccion_id: 1 })),
  };

  await TestBed.configureTestingModule({
    imports: [
      CheckoutComponent,
      RouterTestingModule,
      BrowserAnimationsModule
    ],
    providers: [
      { provide: CartService, useValue: cartServiceMock },
      { provide: VentaService, useValue: ventaServiceMock },
      { provide: AuthService, useValue: authServiceMock },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CheckoutComponent);
  component = fixture.componentInstance;
  routerMock = TestBed.inject(Router); // Obtén el Router real
  spyOn(routerMock, 'navigate'); // Espía el método navigate
  fixture.detectChanges();
});

afterEach(() => {
  cartServiceMock.cartSubject.complete();
});

it('debe crear el componente', () => {
  expect(component).toBeTruthy();
});

});