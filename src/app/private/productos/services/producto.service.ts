import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly apiUrl = `${environment.API_URL}`;

  constructor(private readonly http: HttpClient) { }

  // Productos
  createProducto(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, formData);
  }

  getAllProductos(params: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    if (params.estado !== undefined && params.estado !== '') {
      httpParams = httpParams.set('estado', params.estado.toString());
    }
    if (params.search) httpParams = httpParams.set('search', params.search);

    // Manejar arreglos para filtros múltiples
    if (params.categoria_id && params.categoria_id.length > 0) {
      params.categoria_id.forEach((id: string) => {
        httpParams = httpParams.append('categoria_id', id);
      });
    }
    if (params.tipo_id && params.tipo_id.length > 0) {
      params.tipo_id.forEach((id: string) => {
        httpParams = httpParams.append('tipo_id', id);
      });
    }
    if (params.marca_id && params.marca_id.length > 0) {
      params.marca_id.forEach((id: string) => {
        httpParams = httpParams.append('marca_id', id);
      });
    }
    if (params.talla_id && params.talla_id.length > 0) {
      params.talla_id.forEach((id: string) => {
        httpParams = httpParams.append('talla_id', id);
      });
    }
    if (params.color_id && params.color_id.length > 0) {
      params.color_id.forEach((id: string) => {
        httpParams = httpParams.append('color_id', id);
      });
    }
    if (params.temporada_id && params.temporada_id.length > 0) {
      params.temporada_id.forEach((id: string) => {
        httpParams = httpParams.append('temporada_id', id);
      });
    }

    if (params.precio_min !== undefined) {
      httpParams = httpParams.set('precio_min', params.precio_min.toString());
    }
    if (params.precio_max !== undefined) {
      httpParams = httpParams.set('precio_max', params.precio_max.toString());
    }


    return this.http.get(`${this.apiUrl}/producto`, { params: httpParams });
  }

  updateStock(producto_id: number, talla_id: number, color_id: number, cantidad: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/producto/${producto_id}/actualizarStock`, { talla_id, color_id, cantidad });
  }


  getProductoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/producto/${id}`);
  }

  updateProducto(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}`, formData);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producto/${id}`);
  }

  getDeletedProductos(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto/eliminados?page=${page}&pageSize=${pageSize}`,
      { withCredentials: true });
  }

  restoreProducto(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/producto/${id}/restore`, {});
  }

  getAllFilters(): Observable<any> {
    return this.http.get(`${this.apiUrl}/producto/filters`);
  }

  // Categorías
  getCategorias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categorias`);
  }

  createCategoria(nombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, { nombre });
  }

  updateCategoria(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/categorias/${id}`, { nombre });
  }

  // Tipos de producto
  getTiposProducto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tipoProducto`);
  }

  createTipoProducto(nombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tipoProducto`, { nombre });
  }

  updateTipoProducto(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/tipoProducto/${id}`, { nombre });
  }

  // Tallas
  getTallas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/talla`);
  }

  createTalla(talla: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/talla`, { talla });
  }

  updateTalla(id: number, talla: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/talla/${id}`, { talla });
  }

  // Colores
  getColores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/color`);
  }

  createColor(color: string, colorHex: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/color`, { color, colorHex });
  }

  updateColor(id: number, color: string, colorHex: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/color/${id}`, { color, colorHex });
  }

  // Marcas
  getMarcas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/marca`);
  }

  createMarca(nombre: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/marca`, { nombre });
  }

  updateMarca(id: number, nombre: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/marca/${id}`, { nombre });
  }

  // Temporadas
  getTemporadas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/temporada`);
  }

  createTemporada(temporada: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporada`, { temporada });
  }

  updateTemporada(id: number, temporada: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/temporada/${id}`, { temporada });
  }
}
