import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
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

  getAllProductos(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto?page=${page}&pageSize=${pageSize}`);
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
