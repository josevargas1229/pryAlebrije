import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CompanyService } from '../services/company.service.ts.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.scss']
})
export class CompanySettingsComponent implements OnInit {
  companyForm: FormGroup;
  companyProfile: any;

  constructor(
    private fb: FormBuilder,
    private  CompanySettingsComponent: CompanyService
  ) {
    this.companyForm = this.fb.group({
      nombre: ['', Validators.required],
      logo: [null],
      slogan: ['', [Validators.required, Validators.maxLength(100)]],
      direccion: [''],
      telefono: [''],
      email: ['', [Validators.email]],
    });
  }

  ngOnInit(): void {
    this.getCompanyProfile();
  }

  getCompanyProfile() {
    this.CompanySettingsComponent.getCompanyProfile().subscribe((data: any) => {
      this.companyProfile = data;
      this.companyForm.patchValue(data);
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    this.companyForm.patchValue({
      logo: file
    });

    // Previsualizar la imagen seleccionada
    const reader = new FileReader();
    reader.onload = () => {
      this.companyProfile.logo = reader.result; // Actualiza la previsualización del logo
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('nombre', this.companyForm.get('nombre')?.value);
    formData.append('slogan', this.companyForm.get('slogan')?.value);
    formData.append('direccion', this.companyForm.get('direccion')?.value);
    formData.append('telefono', this.companyForm.get('telefono')?.value);
    formData.append('email', this.companyForm.get('email')?.value);

    if (this.companyForm.get('logo')?.value) {
      formData.append('logo', this.companyForm.get('logo')?.value);
    }

    this.CompanySettingsComponent.updateCompanyProfile(formData).subscribe(response => {
      alert('Perfil actualizado con éxito.');
      this.getCompanyProfile();
    }, error => {
      alert('Error al actualizar el perfil: ' + error.message);
    });
  }
}
