import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: `root`
})
export class ProductoService {
  private apiUrl = `${environment.API_URL}`;

  constructor(private http: HttpClient) { }

  // Productos
  createProducto(producto: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto`, producto);
  }

  getAllProductos(params: any): Observable<any> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('pageSize', params.pageSize.toString());

    // Agregar filtros si están definidos
    if (params.estado !== '') httpParams = httpParams.set('estado', params.estado);
    if (params.temporada_id) httpParams = httpParams.set('temporada_id', params.temporada_id);
    if (params.categoria_id) httpParams = httpParams.set('categoria_id', params.categoria_id);
    if (params.tipo_id) httpParams = httpParams.set('tipo_id', params.tipo_id);
    if (params.marca_id) httpParams = httpParams.set('marca_id', params.marca_id);

    return this.http.get(`${this.apiUrl}/producto`, { params: httpParams });
  }
  getProductoById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/producto/${id}`);
  }

  updateProducto(id: number, producto: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/producto/${id}`, producto);
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

  createCategoria(nombre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categorias`, {nombre});
  }

  // Tipos de producto
  getTiposProducto(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tipoProducto`);
  }

  createTipoProducto(nombre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tipoProducto`, {nombre});
  }

  // Tallas
  getTallas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/talla`);
  }

  createTalla(talla: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/talla`, {talla});
  }

  // Colores
  getColores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/color`);
  }

  createColor(color: any,colorHex:any): Observable<any> {
    return this.http.post(`${this.apiUrl}/color`, {color,colorHex});
  }

  // Marcas
  getMarcas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/marca`);
  }

  createMarca(nombre: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/marca`, {nombre});
  }
  // Temporadas
  getTemporadas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/temporada`);
  }

  createTemporada(temporada: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/temporada`, {temporada});
  }
}
