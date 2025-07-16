import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = new BehaviorSubject<{
    id: number,
    cantidad: number,
    nombre: string,
    tipoProducto?: string,
    marca?: string,
    categoria?: string,
    color?: string,
    talla: string,
    precio: number,
    precioConDescuento?: number,
    imagen: string,
    stock: number,
    talla_id: number,
    color_id: number
  }[]>([]);
  cart$ = this.cart.asObservable();

  addToCart(producto: {
    id: number,
    nombre: string,
    tipoProducto?: string,
    marca?: string,
    categoria?: string,
    color?: string,
    talla_id: number,
    color_id: number,
    talla: string,
    precio: number,
    precioConDescuento?: number,
    imagen: string,
    stock: number,
    cantidad: number
  }) {
    let currentCart = this.cart.value;
    if (!producto.talla_id || producto.talla_id === 0) {
      producto.talla_id = 1; // Suponemos que la primera talla tiene ID 1
      producto.talla = producto.talla || 'Sin talla';
    }
    if (!producto.color_id || producto.color_id === 0) {
      producto.color_id = 1; // Suponemos que el primer color tiene ID 1
      producto.color = producto.color || 'Sin color';
    }
    let index = currentCart.findIndex(item =>
      item.id === producto.id &&
      item.talla_id === producto.talla_id &&
      item.color_id === producto.color_id
    );

    if (index > -1) {
      const nuevaCantidad = currentCart[index].cantidad + producto.cantidad;
      if (nuevaCantidad > producto.stock) {
        alert(`❌ No puedes agregar más de ${producto.stock} unidades de ${producto.nombre}.`);
        return;
      }
      currentCart[index].cantidad = nuevaCantidad;
    } else {
      if (producto.cantidad > producto.stock) {
        alert(`❌ No puedes agregar más de ${producto.stock} unidades de ${producto.nombre}.`);
        return;
      }

      currentCart.push({
        id: producto.id,
        cantidad: producto.cantidad,
        nombre: producto.nombre,
        tipoProducto: producto.tipoProducto,
        marca: producto.marca || 'Marca desconocida',
        categoria: producto.categoria || 'Categoría desconocida',
        color: producto.color || 'Color desconocido',
        talla: producto.talla,
        precio: producto.precio,
        precioConDescuento: producto.precioConDescuento,
        imagen: producto.imagen,
        stock: producto.stock,
        talla_id: producto.talla_id,
        color_id: producto.color_id
      });
    }

    this.cart.next([...currentCart]);
    this.saveCartToStorage();
  }

  updateQuantity(productoId: number, talla: string, cantidad: number): boolean {
    let currentCart = this.cart.value.map(item => {
      if (item.id === productoId && item.talla === talla) {
        if (cantidad > item.stock) {
          return { ...item, cantidad: item.stock };
        }
        return { ...item, cantidad };
      }
      return item;
    });

    this.cart.next([...currentCart]);
    this.saveCartToStorage();

    return cantidad > this.cart.value.find(i => i.id === productoId && i.talla === talla)?.stock!;
  }

  removeFromCart(productoId: number, talla: string) {
    let currentCart = this.cart.value.filter(item => !(item.id === productoId && item.talla === talla));
    this.cart.next([...currentCart]);
    this.saveCartToStorage();
  }

  clearCart() {
    this.cart.next([]);
    sessionStorage.removeItem('cart');
  }

  getCartItems() {
    return this.cart.asObservable();
  }

  private saveCartToStorage() {
    sessionStorage.setItem('cart', JSON.stringify(this.cart.value));
  }

  private loadCartFromStorage() {
    const storedCart = sessionStorage.getItem('cart');
    if (storedCart) {
      this.cart.next(JSON.parse(storedCart));
    }
  }

  constructor() {
    this.loadCartFromStorage();
  }
}
