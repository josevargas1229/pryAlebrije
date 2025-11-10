export interface Premio {
  id: number;
  nombre: string;
  descripcion?: string | null;
  dias_vigencia?: number | null;
  vence_el?: string | null;
  cantidad_a_descontar: number;
  cantidad_minima: number;
  requiere_cupon: boolean;
  activo: boolean;
  usos?: number;
}

export interface SegmentoRuletaDTO {
  id: number;
  ruleta_id: number;
  premio_id: number;
  probabilidad_pct: number;
  activo: boolean;
  premio?: { id: number; nombre: string };
}

export interface RuletaDTO {
  id: number;
  nombre: string;
  imagen_ruleta?: string | null;
  imagen_background?: string | null;
  activo: boolean;
}
