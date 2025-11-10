import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PremioService} from '../premio.service';
import { Premio } from '../models';

@Component({
  selector: 'app-premio-form',
  templateUrl: './premios-form.component.html',
  styleUrls: ['./premios-form.component.scss']
})
export class PremiosFormComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  error = '';
  premioId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private premioSrv: PremioService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      dias_vigencia: [null],
      vence_el: [null],
      cantidad_a_descontar: [0, [Validators.required, Validators.min(0)]],
      cantidad_minima: [0, [Validators.required, Validators.min(0)]],
      requiere_cupon: [true],
      activo: [true]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.premioId = +id;
      this.loadPremio(this.premioId);
    }
  }

  loadPremio(id: number): void {
    this.loading = true;
    this.premioSrv.getPremio(id).subscribe({
      next: (p: Premio) => { this.form.patchValue(p); this.loading = false; },
      error: e => { this.error = e?.error?.message || 'Error al cargar premio.'; this.loading = false; }
    });
  }

  save(): void {
    if (this.form.invalid) return;
    this.loading = true;

    const body = this.form.value;

    const obs = this.premioId
      ? this.premioSrv.updatePremio(this.premioId, body)
      : this.premioSrv.createPremio(body);

    obs.subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/premios']);
      },
      error: e => {
        this.error = e?.error?.message || 'Error al guardar premio.';
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/premios']);
  }
}
