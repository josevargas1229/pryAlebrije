import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  productsConfigOptions = [
    { 
      icon: 'inventory_2', 
      title: 'Lista de Productos', 
      description: 'Administra todos los productos disponibles.', 
      route: '/admin/productos/list' 
    },
    { 
      icon: 'add_box', 
      title: 'Agregar producto', 
      description: 'Registra nuevos productos en el sistema.', 
      route: '/admin/productos/add' 
    },
    { 
      icon: 'delete', 
      title: 'Productos eliminados', 
      description: 'Elimina productos del inventario.', 
      route: '/admin/productos/eliminated' 
    },
    { 
      icon: 'category', 
      title: 'Categorías de Productos', 
      description: 'Organiza los productos en diferentes categorías.', 
      route: '/admin/productos/categorias' 
    },
    { 
      icon: 'assessment', 
      title: 'Reportes de Inventario', 
      description: 'Consulta el estado del inventario y stock.', 
      route: '/admin/productos/reportes' 
    },
    { 
      icon: 'qr_code', 
      title: 'Códigos de Barras', 
      description: 'Genera y gestiona códigos de barras para los productos.', 
      route: '/admin/productos/codigos' 
    }
  ];
}
