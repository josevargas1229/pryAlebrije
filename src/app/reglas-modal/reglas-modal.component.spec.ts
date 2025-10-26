import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReglasModalComponent } from './reglas-modal.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ReglasModalComponent', () => {
  let component: ReglasModalComponent;
  let fixture: ComponentFixture<ReglasModalComponent>;

  beforeEach(async () => {
    const dialogRefMock = {
      close: jasmine.createSpy('close'),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReglasModalComponent,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReglasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });
});