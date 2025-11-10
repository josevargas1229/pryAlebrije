import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PremioService } from '../premio.service';
import { RuletaPremiosAdminService } from '../ruleta-premios-admin.service';
import { Premio, RuletaDTO, SegmentoRuletaDTO } from '../models';
import { PremioSegmentoDialogComponent, PremioSegmentoDialogData } from '../premio-segmento-dialog.component';

@Component({
  selector: 'app-premios',
  templateUrl: './premios.component.html',
  styleUrls: ['./premios.component.scss']
})
export class PremiosComponent implements OnInit {
  ruletas: RuletaDTO[] = [];
  premios: Premio[] = [];
  segmentos: SegmentoRuletaDTO[] = [];

  selectedRuletaId: number | null = null;

  loadingRuletas = false;
  loadingSegmentos = false;
  loadingPremios = false;
  error = '';

  displayedColumns = ['premio', 'probabilidad', 'activo', 'acciones'];

  constructor(
    private premioSrv: PremioService,
    private ruletaSrv: RuletaPremiosAdminService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPremios();
    this.loadRuletas();
  }

  get totalProbabilidad(): number {
    return this.segmentos
      .filter(s => s.activo)
      .reduce((acc, s) => acc + Number(s.probabilidad_pct || 0), 0);
  }

  loadPremios(): void {
    this.loadingPremios = true;
    this.premioSrv.listPremios().subscribe({
      next: rows => { this.premios = rows; this.loadingPremios = false; },
      error: e => { this.error = e?.error?.message || 'Error al cargar premios.'; this.loadingPremios = false; }
    });
  }

  loadRuletas(): void {
    this.loadingRuletas = true;
    this.ruletaSrv.listRuletas().subscribe({
      next: rows => {
        this.ruletas = rows;
        this.loadingRuletas = false;
        if (rows.length && !this.selectedRuletaId) {
          this.selectedRuletaId = rows[0].id;
          this.onRuletaChange();
        }
      },
      error: e => { this.error = e?.error?.message || 'Error al cargar ruletas.'; this.loadingRuletas = false; }
    });
  }

  onRuletaChange(): void {
    if (!this.selectedRuletaId) { this.segmentos = []; return; }

    this.loadingSegmentos = true;
    this.ruletaSrv.listSegmentos(this.selectedRuletaId).subscribe({
      next: rows => { this.segmentos = rows; this.loadingSegmentos = false; },
      error: e => { this.error = e?.error?.message || 'Error al cargar segmentos.'; this.loadingSegmentos = false; }
    });
  }

  /** --------- RULETA_PREMIOS --------- */

  addSegmento(): void {
    if (!this.selectedRuletaId) return;

    const data: PremioSegmentoDialogData = {
      title: 'Añadir premio a ruleta',
      premios: this.premios.filter(p => p.activo),
      segmentos: this.segmentos,
      ruletaId: this.selectedRuletaId,
      segmento: null
    };

    this.dialog.open(PremioSegmentoDialogComponent, {
      width: '420px',
      data
    }).afterClosed().subscribe(ok => {
      if (ok) this.onRuletaChange();
    });
  }

  editSegmento(seg: SegmentoRuletaDTO): void {
    if (!this.selectedRuletaId) return;

    const data: PremioSegmentoDialogData = {
      title: 'Editar segmento',
      premios: this.premios,
      segmentos: this.segmentos,
      ruletaId: this.selectedRuletaId,
      segmento: seg
    };

    this.dialog.open(PremioSegmentoDialogComponent, {
      width: '420px',
      data
    }).afterClosed().subscribe(ok => {
      if (ok) this.onRuletaChange();
    });
  }

  deleteSegmento(seg: SegmentoRuletaDTO): void {
    if (!this.selectedRuletaId) return;
    if (!confirm(`¿Eliminar el premio "${seg.premio?.nombre ?? ''}" de esta ruleta?`)) return;

    this.ruletaSrv.deleteSegmento(this.selectedRuletaId, seg.id).subscribe({
      next: () => this.onRuletaChange(),
      error: e => { this.error = e?.error?.message || 'Error al eliminar segmento.'; }
    });
  }

  /** --------- CATALOGO PREMIOS --------- */

  goNuevoPremio(): void {
    this.router.navigate(['nuevo'], { relativeTo: this.route });
  }

  editPremio(p: Premio): void {
    this.router.navigate([p.id], { relativeTo: this.route });
  }

  deletePremio(p: Premio): void {
    if (!confirm(`¿Eliminar el premio "${p.nombre}" del catálogo?`)) return;

    this.premioSrv.deletePremio(p.id).subscribe({
      next: () => this.loadPremios(),
      error: e => {
        this.error = e?.error?.message || 'Error al eliminar premio.';
      }
    });
  }
}
