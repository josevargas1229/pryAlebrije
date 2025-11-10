import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiosFormComponent } from './premios-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { PremioService } from '../premio.service';
import { Premio } from '../models';

describe('PremiosFormComponent', () => {
  let component: PremiosFormComponent;
  let fixture: ComponentFixture<PremiosFormComponent>;

  const premioServiceMock: Partial<PremioService> = {
    getPremio: (_id: number) => of({} as Premio),
    createPremio: (_body: Partial<Premio>) =>
      of({ id: 1, ..._body } as Premio),

    updatePremio: (_id: number, _body: Partial<Premio>) =>
      of({ id: _id, ..._body } as Premio),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PremiosFormComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientTestingModule
      ],
      providers: [
        { provide: PremioService, useValue: premioServiceMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PremiosFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
