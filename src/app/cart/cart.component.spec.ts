import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CartComponent } from './cart.component';
import { CartService } from '../services/cart/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, throwError, Subscription } from 'rxjs';
import { Renderer2 } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// 💡 No necesitas CommonModule ni BrowserAnimationsModule aquí
// porque el componente standalone ya los importa internamente.

describe('CartComponent', () => {
  let fixture: ComponentFixture<CartComponent>;
  let component: CartComponent;

  // ✅ Mocks inicializados ANTES del TestBed
  let cartSubject: BehaviorSubject<any[]>;
  let cartServiceMock: any;
  let snackBarMock: any;
  let dialogMock: any;
  let rendererMock: Partial<Renderer2>;

  beforeEach(async () => {
  cartSubject = new BehaviorSubject<any[]>([]);
  cartServiceMock = {
    cart$: cartSubject.asObservable(),
    updateQuantity: jasmine.createSpy('updateQuantity'),
    removeFromCart: jasmine.createSpy('removeFromCart'),
  };

  snackBarMock = {
    open: jasmine.createSpy('open'),
  };

  dialogMock = {
    open: jasmine.createSpy('open').and.returnValue({
      afterClosed: () => of(true),
    }),
  };

  rendererMock = {
    setStyle: jasmine.createSpy('setStyle'),
  };

  await TestBed.configureTestingModule({
    imports: [
      CartComponent,
      RouterTestingModule,
      BrowserAnimationsModule // Agrega este módulo
    ],
    providers: [
      { provide: CartService, useValue: cartServiceMock },
      { provide: MatSnackBar, useValue: snackBarMock },
      { provide: MatDialog, useValue: dialogMock },
      { provide: Renderer2, useValue: rendererMock },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CartComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});

  afterEach(() => {
    cartSubject.complete();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

});
