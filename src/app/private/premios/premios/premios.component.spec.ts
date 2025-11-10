import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiosComponent } from './premios.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { of } from 'rxjs';
import { PremioService } from '../premio.service';
import { RuletaPremiosAdminService } from '../ruleta-premios-admin.service';
import { Premio, RuletaDTO, SegmentoRuletaDTO } from '../models';

describe('PremiosComponent', () => {
  let component: PremiosComponent;
  let fixture: ComponentFixture<PremiosComponent>;

  const premioServiceMock: Partial<PremioService> = {
    listPremios: () => of([] as Premio[]),
    deletePremio: (_id: number) => of({} as Object)
  };

  const ruletaServiceMock: Partial<RuletaPremiosAdminService> = {
    listRuletas: () => of([] as RuletaDTO[]),
    listSegmentos: (_id: number) => of([] as SegmentoRuletaDTO[]),
    deleteSegmento: (_ruletaId: number, _segId: number) => of({} as Object)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PremiosComponent],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: PremioService, useValue: premioServiceMock },
        { provide: RuletaPremiosAdminService, useValue: ruletaServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PremiosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
