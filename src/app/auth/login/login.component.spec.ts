import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../../services/auth/auth.service';
import { ToastService } from 'angular-toastify';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { RecaptchaModule, RecaptchaFormsModule, RecaptchaComponent } from 'ng-recaptcha-2';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
  const authServiceMock = {
    login: jasmine.createSpy('login').and.returnValue(of({ verified: true, tipo: 'user' })),
    getRememberMe: jasmine.createSpy('getRememberMe').and.returnValue(null),
    setUserRole: jasmine.createSpy('setUserRole'),
  };

  const toastServiceMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  const routerMock = {
    navigate: jasmine.createSpy('navigate').and.returnValue(Promise.resolve(true)),
  };

  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: jasmine.createSpy('get').and.callFake((key: string) => {
          const params: { [key: string]: string | null } = {
            client_id: null,
            redirect_uri: null,
            state: null,
          };
          return params[key];
        }),
      },
    },
  };

  const recaptchaComponentMock = {
    reset: jasmine.createSpy('reset'),
  };

  await TestBed.configureTestingModule({
    imports: [
      LoginComponent,
      HttpClientTestingModule,
      FormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatIconModule,
      MatCheckboxModule,
      MatButtonModule,
      MatProgressSpinnerModule,
      MatCardModule,
      RecaptchaModule,
      RecaptchaFormsModule,
      BrowserAnimationsModule // Agrega este módulo para habilitar animaciones
    ],
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: ToastService, useValue: toastServiceMock },
      { provide: Router, useValue: routerMock },
      { provide: ActivatedRoute, useValue: activatedRouteMock },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(LoginComponent);
  component = fixture.componentInstance;
  component.captchaRef = recaptchaComponentMock as any; // Simula ViewChild
  fixture.detectChanges();
});

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});