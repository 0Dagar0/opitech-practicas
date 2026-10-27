import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ContenidoService } from './contenido';

describe('ContenidoService', () => {
  let service: ContenidoService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ContenidoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debe crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debe pedir el archivo de contenido de los assets', () => {
    service.obtenerContenido().subscribe((data) => {
      expect(data.servicios.length).toBe(1);
    });

    const req = httpMock.expectOne('assets/data/content.json');
    expect(req.request.method).toBe('GET');
    req.flush({ servicios: [{ titulo: 'Prueba' }], equipo: [], clientes: [] });
  });
});
