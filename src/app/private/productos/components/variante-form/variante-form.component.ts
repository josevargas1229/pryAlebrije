import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DetallesFormComponent } from '../detalles-form/detalles-form.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductoService } from '../../services/producto.service';

interface Color {
  id: number;
  color: string;
  colorHex: string;
}

@Component({
  selector: 'app-variante-form',
  templateUrl: './variante-form.component.html',
  styleUrl: './variante-form.component.scss'
})
export class VarianteFormComponent implements OnInit {
  varianteForm: FormGroup;

  @Input() tallas: { id: number; talla: string }[] = [];
  @Input() colores: Color[] = [];

  constructor(
    private readonly fb: FormBuilder,
    public dialogRef: MatDialogRef<VarianteFormComponent>,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly productoService: ProductoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.varianteForm = this.fb.group({
      talla: [null, Validators.required],
      coloresStock: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.tallas = this.data.tallas;
    this.colores = this.data.colores;
    this.recargarTallasYColores();
  }

  get coloresStock(): FormArray {
    return this.varianteForm.get('coloresStock') as FormArray;
  }

  agregarColor(): void {
    const tallaSeleccionada = this.varianteForm.get('talla')?.value;
    if (!tallaSeleccionada) {
      alert('Por favor, selecciona una talla antes de agregar colores.');
      return;
    }

    this.coloresStock.push(
      this.fb.group({
        talla: [tallaSeleccionada, Validators.required], // Se mantiene el objeto talla
        color: [null, Validators.required], // Color como objeto { id, color, colorHex }
        stock: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }
  openDialog(type: string): void {
    const dialogRef = this.dialog.open(DetallesFormComponent, {
      data: { title: `Añadir ${type}`, type }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let servicioLlamar;
        result.nombre = result.nombre.toLowerCase();
        result.nombre = result.nombre.charAt(0).toUpperCase() + result.nombre.slice(1);
        switch (type) {
          case 'talla':
            servicioLlamar = this.productoService.createTalla(result.nombre);
            break;
          case 'color':
            servicioLlamar = this.productoService.createColor(result.nombre, result.hex);
            break;
        }

        if (servicioLlamar) {
          servicioLlamar.subscribe({
            next: (response) => {
              this.snackBar.open(`${type.charAt(0).toUpperCase() + type.slice(1)} agregada exitosamente`, 'Cerrar', { duration: 3000 });

              this.recargarTallasYColores();
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
  eliminarColor(index: number): void {
    this.coloresStock.removeAt(index);
  }

  guardar(): void {
    if (this.varianteForm.valid) {
      const resultado = {
        talla: this.varianteForm.value.talla, // { id, talla }
        coloresStock: this.coloresStock.value.map((c: any) => {
          return {
            id: c.color?.id ?? null, // Asegurar que `id` esté definido
            color: c.color?.color ?? 'Desconocido', // Evitar valores undefined
            colorHex: c.color?.colorHex ?? '#000000',
            stock: c.stock
          };
        })
      };
      console.table(resultado);
      this.dialogRef.close(resultado);
    }
  }
  get coloresArray(): FormArray {
    return this.varianteForm.get('colores') as FormArray;
  }
  recargarTallasYColores() {
    this.productoService.getAllFilters().subscribe({
      next: (data) => {
        this.tallas = data.tallas;
        this.colores = data.colores;
        
        // Si usas un FormArray para los colores, asegúrate de limpiarlo y volver a llenarlo
        this.coloresArray.clear();
        this.colores.forEach(color => {
          this.coloresArray.push(this.fb.control(color));
        });
      },
      error: (error) => {
        console.error('Error al recargar tallas y colores:', error);
        this.snackBar.open('Error al recargar tallas y colores', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
}
