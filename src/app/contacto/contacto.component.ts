import { Component,AfterViewInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../private/services/company.service.ts.service';
import { CommonModule } from '@angular/common';
import { ContactoService } from '../services/company/contacto.service';
import { LoadingButtonComponent } from '../components/loading-button/loading-button.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    CommonModule,
    LoadingButtonComponent,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.scss'
})
export class ContactoComponent implements AfterViewInit {
  companyInfo: any = { email: '', telefono: '', direccion: '' };  // Inicializado con valores vacíos
  contactoForm: FormGroup;
  enviandoMensaje: boolean = false;
  mostrarVentanaExito: boolean = false;

  @ViewChild('botonEnviar', { static: false }) botonEnviar!: ElementRef;

    constructor(
      private readonly companyService: CompanyService,
      private readonly contactoService: ContactoService,
      private readonly renderer: Renderer2,
      private readonly fb: FormBuilder,
      private readonly dialog: MatDialog
    ) {
      this.contactoForm = this.fb.group({
        nombre: [{ value: '', disabled: false }],
        email: [{ value: '', disabled: false }],
        mensaje: [{ value: '', disabled: false }]
      });
 }

    ngOnInit(): void {
      this.companyService.companyProfile$.subscribe((data: any) => {
        this.companyInfo = data;
      });
    }


    ngAfterViewInit(): void {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.renderer.addClass(entry.target, 'visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.2 }
      );

      if (this.botonEnviar) {
        observer.observe(this.botonEnviar.nativeElement);
      }
    }

    enviarMensaje() {
      if (this.contactoForm.invalid) {
        return;
      }

      const data = this.contactoForm.getRawValue();  // Obtiene los datos incluso si están deshabilitados

      console.log("📤 Enviando mensaje al backend:", data);

      this.enviandoMensaje = true;
      this.contactoForm.disable();  // 🔍 Deshabilita todo el formulario al enviar

      this.contactoService.enviarMensaje(data).subscribe({
        next: () => {
          this.enviandoMensaje = false;
          this.contactoForm.reset();
          this.contactoForm.enable();  // 🔍 Habilita el formulario después del envío
          this.mostrarVentanaExito = true;
        },
        error: (error) => {
          console.error("❌ Error al enviar mensaje:", error);
          this.enviandoMensaje = false;
          this.contactoForm.enable();  // 🔍 Habilita el formulario en caso de error
        }
      });
    }

    cerrarVentanaExito() {
      this.mostrarVentanaExito = false;
    }
}
