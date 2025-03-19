import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart = new BehaviorSubject<{ id: number, cantidad: number, nombre: string, talla: string, precio: number, imagen: string, stock: number }[]>([]);
  cart$ = this.cart.asObservable();

  addToCart(producto: { id: number, nombre: string, talla: string, precio: number, imagen: string, stock: number }) {
    let currentCart = this.cart.value;
    let index = currentCart.findIndex(item => item.id === producto.id && item.talla === producto.talla);

    if (index > -1) {
      if (currentCart[index].cantidad < producto.stock) {
        currentCart[index].cantidad += 1;
      } else {
        alert(`❌ No puedes agregar más de ${producto.stock} unidades de ${producto.nombre}.`);
        return; // Salimos sin actualizar el carrito
      }
    } else {
      currentCart.push({
        id: producto.id,
        cantidad: 1,
        nombre: producto.nombre,
        talla: producto.talla,
        precio: producto.precio,
        imagen: producto.imagen,
        stock: producto.stock
      });
    }

    this.cart.next([...currentCart]);
    this.saveCartToStorage();
  }

  updateQuantity(productoId: number, talla: string, cantidad: number): boolean {
    let currentCart = this.cart.value.map(item => {
      if (item.id === productoId && item.talla === talla) {
        // Verifica si la cantidad supera el stock disponible
        if (cantidad > item.stock) {
          return { ...item, cantidad: item.stock }; // No permite pasar del stock
        }
        return { ...item, cantidad };
      }
      return item;
    });

    this.cart.next([...currentCart]);
    this.saveCartToStorage();

    // Retorna `true` si se sobrepasó el stock, para que el componente muestre alerta
    return cantidad > this.cart.value.find(i => i.id === productoId && i.talla === talla)?.stock!;
  }



  removeFromCart(productoId: number, talla: string) {
    let currentCart = this.cart.value.filter(item => !(item.id === productoId && item.talla === talla));
    this.cart.next([...currentCart]);
    this.saveCartToStorage();
  }

  clearCart() {
    this.cart.next([]);
    localStorage.removeItem('cart');
  }

  getCartItems() {
    return this.cart.asObservable();
  }

  private saveCartToStorage() {
    localStorage.setItem('cart', JSON.stringify(this.cart.value));
  }

  private loadCartFromStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      this.cart.next(JSON.parse(storedCart));
    }
  }

  constructor() {
    this.loadCartFromStorage();
  }

}
