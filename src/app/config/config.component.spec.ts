import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ConfigComponent } from './config.component';
import { UserService } from '../services/user/user.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ToastService } from 'angular-toastify';
import { of } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordDialogComponent } from '../change-password-dialog-component/change-password-dialog-component.component';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let userServiceMock: any;
  let dialogMock: any;
  let toastServiceMock: any;

  beforeEach(async () => {
    userServiceMock = {
      getUserInfo: jasmine.createSpy('getUserInfo').and.returnValue(of({ id: 1, nombre: 'Test User', email: 'test@example.com' })),
      changePassword: jasmine.createSpy('changePassword').and.returnValue(of({ success: true })),
    };

    dialogMock = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of({ currentPassword: 'oldPass', newPassword: 'newPass' }),
      }),
    };

    toastServiceMock = {
      success: jasmine.createSpy('success'),
      error: jasmine.createSpy('error'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ConfigComponent,
        BrowserAnimationsModule,
        MatDialogModule,
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        ReactiveFormsModule,
      ],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

});