import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DetallesFormComponent } from '../detalles-form/detalles-form.component';
import { ProductoService } from '../../services/producto.service';
import { VarianteFormComponent } from '../variante-form/variante-form.component';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-productform',
  templateUrl: './productform.component.html',
  styleUrl: './productform.component.scss'
})
export class ProductformComponent implements OnInit {
  @Input() producto: any = {};
  @Input() titulo: string = 'Formulario de producto';
  @Output() guardar = new EventEmitter<FormData>();
  @Output() cancelarForm = new EventEmitter<void>();
  @Input() isLoading: boolean = false;
  displayedColumns: string[] = ['talla', 'color', 'stock', 'acciones'];
  dataSource = new MatTableDataSource<any>();
  productoForm: FormGroup;
  categorias: any[] = [];
  tipos: any[] = [];
  marcas: any[] = [];
  tallas: any[] = [];
  temporadas: any[] = [];
  colores: any[] = [];
  tallasColoresStock: any[] = [];
  imagenes: File[] = [];
  imagenesVista: string[] = [];
  readonly MAX_FILE_SIZE = 2 * 1024 * 1024;
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar, private dialog: MatDialog, private productoService: ProductoService) {
    this.productoForm = this.fb.group({
      temporada: ['', Validators.required],
      categoria: ['', Validators.required],
      tipo: ['', Validators.required],
      marca: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      estado: [false],
      tallasColoresStock: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // Si hay un producto, cargar sus valores en el formulario
    if (this.producto) {
      this.productoForm.patchValue(this.producto);
      console.log('Producto:', this.producto);
    }

    // Llamar al servicio para obtener los filtros dinámicos
    this.productoService.getAllFilters().subscribe({
      next: (data) => {
        this.temporadas = data.temporadas;
        this.categorias = data.categorias;
        this.tipos = data.tipos;
        this.marcas = data.marcas;
        this.tallas = data.tallas;
        this.colores = data.colores;
        
      },
      error: (error) => {
        console.error('Error al obtener los filtros:', error);
        this.snackBar.open('Error al cargar los filtros', 'Cerrar', { duration: 3000 });
      }
    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['producto'] && changes['producto'].currentValue) {
      console.log('Producto actualizado:', this.producto);
      console.log(this.producto.tallasColoresStock);
      // Parchear los valores extraídos del objeto recibido
      this.productoForm.patchValue({
        temporada: this.producto.temporada.id || '',
        categoria: this.producto.categoria.id || '',
        tipo: this.producto.tipo.id || '',
        marca: this.producto.marca.id || '',
        precio: this.producto.precio || 0,
        stock: this.producto.stock || 0,
        estado: this.producto.estado || false
      });
  
      // Si tienes un array de tallas y colores, actualízalo también
      this.actualizarTallasColores();
    }
  }
  
  actualizarTallasColores() {
    this.tallasColoresStockArray.clear(); // Limpiar array antes de insertar nuevos valores
  
    if (this.producto.tallasColoresStock && this.producto.tallasColoresStock.length) {
      this.producto.tallasColoresStock.forEach(tc => {
        this.tallasColoresStockArray.push(this.fb.group({
          talla: [tc.talla || '', Validators.required],
          coloresStock: this.fb.group({
            id: [tc.coloresStock?.id || '', Validators.required],
            color: [tc.coloresStock?.color || '', Validators.required],
            colorHex: [tc.coloresStock?.colorHex || ''],
            stock: [tc.stock || 0, [Validators.required, Validators.min(0)]]
          })
        }));
      });
  
      this.dataSource.data = this.tallasColoresStockArray.controls.map(control => control.value);
      console.log('Tabla actualizada con:', this.dataSource.data);
    }
  }

  get tallasColoresStockArray(): FormArray {
    return this.productoForm.get('tallasColoresStock') as FormArray;
  }
  
  onFileSelected(event: any) {
    for (let file of event.target.files) {
      this.imagenes.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => this.imagenesVista.push(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  eliminarImagen(index: number) {
    this.imagenes.splice(index, 1);
    this.imagenesVista.splice(index, 1);
  }
  get coloresArray(): FormArray {
    return this.productoForm.get('colores') as FormArray;
  }
  submitForm() {
    if (this.productoForm.valid) {
      const formData = new FormData();
      const formValues = this.productoForm.value;
  
      formData.append('temporada_id', formValues.temporada); // Agregar temporada_id
      formData.append('categoria_id', formValues.categoria);
      formData.append('tipo_id', formValues.tipo);
      formData.append('marca_id', formValues.marca);
      formData.append('precio', formValues.precio.toString());
      formData.append('estado', formValues.estado ? 'true' : 'false');
  
      // Convertir tallasColoresStock en el formato esperado
      const variantes = this.tallasColoresStockArray.value.map((variante: any) => {
        return  ({
          talla_id: variante.talla.id,  // Asegurar que se envía el ID de la talla
          color_id: variante.coloresStock.id, // Asegurar que se envía el ID del color
          stock: variante.coloresStock.stock
        });
      }).flat(); // Aplanar el array ya que `coloresStock` es una lista dentro de cada variante
  
      formData.append('variantes', JSON.stringify(variantes));
  
      // Agregar imágenes
      this.imagenes.forEach((img, index) => {
        formData.append(`imagen${index}`, img);
      });
  
      this.guardar.emit(formData);
    } else {
      console.log('Formulario inválido:', this.productoForm.value);
    }
  }  
  

  openDialog(type: string): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Añadir ${type}`, type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let servicioLlamar;
        result.nombre = result.nombre.toUpperCase();
        switch (type) {
          case 'categoria':
            servicioLlamar = this.productoService.createCategoria(result.nombre);
            break;
          case 'tipo':
            servicioLlamar = this.productoService.createTipoProducto(result.nombre);
            break;
          case 'marca':
            servicioLlamar = this.productoService.createMarca(result.nombre);
            break;
          case 'talla':
            servicioLlamar = this.productoService.createTalla(result.nombre);
            break;
          case 'temporada':
            servicioLlamar = this.productoService.createTemporada(result.nombre);
            break;
          case 'color':
            servicioLlamar = this.productoService.createColor(result.nombre, result.hex);
            break;
        }

        if (servicioLlamar) {
          servicioLlamar.subscribe({
            next: (response) => {
              this.snackBar.open(`${type.charAt(0).toUpperCase() + type.slice(1)} agregada exitosamente`, 'Cerrar', { duration: 3000 });

              // Actualizar la lista correspondiente
              switch (type) {
                case 'categoria':
                  this.categorias.push(result.nombre);
                  break;
                case 'tipo':
                  this.tipos.push(result.nombre);
                  break;
                case 'marca':
                  this.marcas.push(result.nombre);
                  break;
                case 'talla':
                  this.tallas.push(result.nombre);
                  break;
                case 'color':
                  this.colores.push(result);
                  this.coloresArray.push(this.fb.control(result));
                  break;
              }
            },
            error: (error) => {
              console.error(`Error al agregar ${type}:`, error);
              this.snackBar.open(`Error al agregar ${type}`, 'Cerrar', { duration: 3000 });
            }
          });
        }
      }
    });
  }
  openDialogTallasColores(): void {
    const dialogRef = this.dialog.open(VarianteFormComponent, {
      data: { title: 'Añadir variantes de producto', tallas: this.tallas, colores: this.colores }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        result.coloresStock.forEach((variante: any) => {
          this.tallasColoresStockArray.push(this.fb.group({
            talla: [result.talla, Validators.required], // Talla es un objeto { id, talla }
            coloresStock: 
              this.fb.group({
                id: [variante.id],
                color: [variante.color, Validators.required],  // Color es un objeto { id, color, colorHex }
                colorHex: [variante.colorHex, Validators.required],
                stock: [variante.stock, [Validators.required, Validators.min(0)]]
              })
          }));
        });
  
        // Actualizar la tabla con la nueva estructura
        this.dataSource.data = this.tallasColoresStockArray.controls.map(control => control.value);
        console.table(this.dataSource.data);
      }
    });
  }
  
  editTallaColor(element: any, index: number) {
    const dialogRef = this.dialog.open(VarianteFormComponent, {
      data: { title: 'Editar variante', tallas: this.tallas,colores:this.colores, element }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tallasColoresStockArray.setControl(index, this.fb.group({
          talla: [result.talla, Validators.required],
          coloresStock: this.fb.array(result.coloresStock.map((color: any) =>
            this.fb.group({
              color: [color.color, Validators.required],
              colorHex: [color.colorHex, Validators.required],
              stock: [color.stock, [Validators.required, Validators.min(0)]]
            })
          ))
        }));
  
        // Actualizar la tabla
        this.dataSource.data = this.tallasColoresStockArray.controls.map(control => control.value);
      }
    });
  }  
  
  deleteTallaColor(index: number) {
    this.tallasColoresStockArray.removeAt(index);
    this.dataSource.data = this.tallasColoresStockArray.controls.map(control => control.value);
  }

  cancelar() {
    this.cancelarForm.emit();
  }
}
