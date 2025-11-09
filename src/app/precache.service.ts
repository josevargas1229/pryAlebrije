import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

interface ProductoLista {
  id: number;
  nombre: string;
}

export interface DetalleProductoCache {
  id: number;
  tipoProducto: string;
  marca: string;
  categoria: string;
  talla: string;
  color: string;
  precio: number;
  imagen: string;
  stock: number;
  talla_id: number | null;
  color_id: number | null;
}

@Injectable({ providedIn: 'root' })
export class PrecacheService {
  private http = inject(HttpClient);

  private readonly API_BASE = 'https://alebrije.onrender.com';

  preloadCriticalData() {
    //LISTA DE PRODUCTOS
    const productosTop10$ = this.http
      .get<ProductoLista[]>(`${this.API_BASE}/menu-catalogo/productos`)
      .pipe(
        map(items => items.slice(0, 10)),
        tap(items => {
          localStorage.setItem(
            'pwa.cache.productosTop10',
            JSON.stringify(items)
          );
        }),
        catchError(err => {
          console.error('Error precargando lista de productos', err);
          return of([] as ProductoLista[]);
        })
      );

    //PRECARGAR DETALLES
    const detallesTop10$ = productosTop10$.pipe(
      switchMap(productos => {
        if (!productos.length) return of([] as DetalleProductoCache[]);

        const detailRequests = productos.map(p =>
          this.http
            .get<any>(
              `${this.API_BASE}/menu-catalogo/productos/producto-detalle/${p.id}`
            )
            .pipe(
              map(prod => this.mapDetalleProducto(prod)),
              catchError(err => {
                console.error(
                  'Error precargando detalle de producto',
                  p.id,
                  err
                );
                return of(null as DetalleProductoCache | null);
              })
            )
        );

        return forkJoin(detailRequests).pipe(
          map(detalles =>
            detalles.filter(
              (d): d is DetalleProductoCache => d !== null
            )
          ),
          tap(detalles => {
            localStorage.setItem(
              'pwa.cache.productosDetallesTop10',
              JSON.stringify(detalles)
            );
          })
        );
      })
    );

    const terminos$ = this.http
      .get(`${this.API_BASE}/terminos-condiciones`, { responseType: 'text' })
      .pipe(
        tap(html => {
          localStorage.setItem('pwa.cache.terminos', html);
        }),
        catchError(err => {
          console.error('Error precargando términos', err);
          return of(null);
        })
      );

    const aviso$ = this.http
      .get(`${this.API_BASE}/aviso-privacidad`, { responseType: 'text' })
      .pipe(
        tap(html => {
          localStorage.setItem('pwa.cache.aviso', html);
        }),
        catchError(err => {
          console.error('Error precargando aviso', err);
          return of(null);
        })
      );

    const deslinde$ = this.http
      .get(`${this.API_BASE}/deslinde-legal`, { responseType: 'text' })
      .pipe(
        tap(html => {
          localStorage.setItem('pwa.cache.deslinde', html);
        }),
        catchError(err => {
          console.error('Error precargando deslinde', err);
          return of(null);
        })
      );

    const contacto$ = this.http
      .get(`${this.API_BASE}/contacto`, { responseType: 'text' })
      .pipe(
        tap(html => {
          localStorage.setItem('pwa.cache.contacto', html);
        }),
        catchError(err => {
          console.error('Error precargando contacto', err);
          return of(null);
        })
      );

    return forkJoin({
      productosTop10: productosTop10$,
      detallesTop10: detallesTop10$,
      terminos: terminos$,
      aviso: aviso$,
      deslinde: deslinde$,
      contacto: contacto$
    });
  }


  private mapDetalleProducto(producto: any): DetalleProductoCache {


    const variantes = producto.variantes || producto.variantesProducto || [];
    const varianteConStock =
      variantes.find((v: any) => v.stock > 0) ||
      variantes[0] ||
      {};

    const talla =
      varianteConStock.talla?.nombre ||
      varianteConStock.tallaNombre ||
      'Sin talla';

    const color =
      varianteConStock.color?.nombre ||
      varianteConStock.colorNombre ||
      'Color desconocido';

    const talla_id =
      varianteConStock.talla_id ??
      varianteConStock.tallaId ??
      null;

    const color_id =
      varianteConStock.color_id ??
      varianteConStock.colorId ??
      null;

    return {
      id: producto.id,
      tipoProducto: producto.tipo?.nombre || 'Tipo desconocido',
      marca: producto.marca?.nombre || 'Marca desconocida',
      categoria: producto.categoria?.nombre || 'Categoría desconocida',
      talla,
      color,
      precio: producto.precio,
      imagen: producto.imagenPrincipal || 'assets/images/ropa.jpg',
      stock: varianteConStock.stock ?? 0,
      talla_id,
      color_id
    };
  }


  getCachedProductosTop10(): ProductoLista[] {
    const raw = localStorage.getItem('pwa.cache.productosTop10');
    return raw ? JSON.parse(raw) : [];
  }

  getCachedDetallesTop10(): DetalleProductoCache[] {
    const raw = localStorage.getItem('pwa.cache.productosDetallesTop10');
    return raw ? JSON.parse(raw) : [];
  }

  getCachedTerminos(): string | null {
    return localStorage.getItem('pwa.cache.terminos');
  }

  getCachedAviso(): string | null {
    return localStorage.getItem('pwa.cache.aviso');
  }

  getCachedDeslinde(): string | null {
    return localStorage.getItem('pwa.cache.deslinde');
  }

  getCachedContacto(): string | null {
    return localStorage.getItem('pwa.cache.contacto');
  }

  getCachedDetalleById(id: number): DetalleProductoCache | undefined {
    const all = this.getCachedDetallesTop10();
    return all.find(d => d.id === id);
  }
}
