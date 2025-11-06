import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RuletaService } from './ruleta.service';
import { environment } from '../../../environments/environment.development';

describe('RuletaService', () => {
  let service: RuletaService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.API_URL}/ruletas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RuletaService]
    });
    service = TestBed.inject(RuletaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getAll() debe hacer GET a /ruletas', () => {
    const mock = [{ id: 1, activo: true }];
    service.getAll().subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mock);
  });

  it('get(id) debe hacer GET a /ruletas/:id', () => {
    const id = 5;
    const mock = { id, activo: false };
    service.get(id).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mock);
  });

  it('create(data) debe hacer POST multipart a /ruletas', () => {
    const data = new FormData();
    data.append('activo', 'true');
    const mock = { id: 1 };
    service.create(data).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mock);
  });

  it('update(id, data) debe hacer PUT multipart a /ruletas/:id', () => {
    const id = 3;
    const data = new FormData();
    data.append('activo', 'false');
    const mock = { id, activo: false };
    service.update(id, data).subscribe(res => expect(res).toEqual(mock));

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.withCredentials).toBe(true);
    req.flush(mock);
  });

  it('delete(id) debe hacer DELETE a /ruletas/:id', () => {
    const id = 7;
    service.delete(id).subscribe(res => expect(res).toBeTruthy());

    const req = httpMock.expectOne(`${apiUrl}/${id}`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});