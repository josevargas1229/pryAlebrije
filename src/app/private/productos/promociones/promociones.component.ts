import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PromocionService, Promocion } from '../../../services/promociones/promociones.service';
import { ProductoService } from '../services/producto.service';

@Component({
  selector: 'app-promociones',
  templateUrl: './promociones.component.html',
  styleUrls: ['./promociones.component.scss']
})
export class PromocionesComponent implements OnInit {
  formPromocion!: FormGroup;
  productos: any[] = [];
  promociones: Promocion[] = [];

  constructor(private promocionService: PromocionService,private fb: FormBuilder, private productoService: ProductoService) {}

  ngOnInit(): void {
  this.promocionService.getTodas().subscribe({
    next: (res) => this.promociones = res,
    error: (err) => console.error('Error al cargar promociones', err)
  });

  this.formPromocion = this.fb.group({
    nombre: ['', Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    tipo: ['', Validators.required],
    descuento: [null, [Validators.required, Validators.min(0)]],
    productos: [[]]
  });

 this.productoService.getAllProductos({
  page: 1,
  pageSize: 20 // suficiente para 9 productos
}).subscribe({
  next: (res) => this.productos = res.productos,
  error: (err) => console.error('Error al cargar productos', err)
});


}

  crearPromocion(): void {
  if (this.formPromocion.invalid) return;

  const inicio = new Date(this.formPromocion.value.fecha_inicio);
  const fin = new Date(this.formPromocion.value.fecha_fin);
  const productosSeleccionados = this.formPromocion.value.productos;

  if (inicio > fin) {
    alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
    return;
  }

  if (!productosSeleccionados || productosSeleccionados.length === 0) {
    alert('Debes seleccionar al menos un producto.');
    return;
  }

  this.promocionService.crear(this.formPromocion.value).subscribe({
    next: () => {
      this.formPromocion.reset();
      this.promocionService.getTodas().subscribe(res => this.promociones = res);
    },
    error: (err) => console.error('Error al crear promoción', err)
  });
}


  eliminar(id: number): void {
    if (confirm('¿Eliminar esta promoción?')) {
      this.promocionService.eliminar(id).subscribe(() => {
        this.promociones = this.promociones.filter(p => p.id !== id);
      });
    }
  }

  // Métodos que necesitas agregar a tu componente TypeScript:

isExpired(promo: any): boolean {
  const today = new Date();
  const endDate = new Date(promo.fecha_fin);
  return endDate < today;
}

getChipColor(tipo: string): string {
  return tipo === 'temporada' ? 'primary' : 'accent';
}

getTypeIcon(tipo: string): string {
  return tipo === 'temporada' ? 'schedule' : 'inventory';
}

getTypeLabel(tipo: string): string {
  return tipo === 'temporada' ? 'Temporada' : 'Producto Específico';
}
}
