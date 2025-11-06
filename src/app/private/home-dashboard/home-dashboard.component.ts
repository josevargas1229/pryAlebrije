import { Component } from '@angular/core';

@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.scss'
})
export class HomeDashboardComponent {
  adminConfigOptions = [
    { icon: 'security', title: 'Términos y Condiciones', description: 'Configura los términos y condiciones.', route: '/admin/legal', queryParams: { tab: 'terminos' } },
    { icon: 'privacy_tip', title: 'Política de Privacidad', description: 'Gestiona las políticas de privacidad.', route: '/admin/legal', queryParams: { tab: 'privacidad' } },
    { icon: 'gavel', title: 'Deslinde Legal', description: 'Actualiza las cláusulas legales.', route: '/admin/legal', queryParams: { tab: 'deslinde' } },
    { icon: 'settings', title: 'Configuraciones del sistema', description: 'Controla la configuración del sistema.', route: '/admin/sistema' },
    { icon: 'business', title: 'Información de la empresa', description: 'Modifica detalles de la empresa.', route: '/admin/empresa' },
    { icon: 'lock', title: 'Gestión de usuarios bloqueados', description: 'Visualiza y gestiona cuentas bloqueadas.', route: '/admin/bloqueos' },
    { icon: 'email', title: 'Gestión de correos', description: 'Crea y personaliza plantillas de correos.', route: '/admin/correos' },
    { icon: 'report', title: 'Incidencias', description: 'Consulta las incidencias registradas.', route: '/admin/incidencias' },
    { icon: 'people', title: 'Gestión de empleados', description: 'Administra asistencias y QR de empleados.', route: '/admin/empleados' },
    { icon: 'casino', title: 'Gestión de ruletas', description: 'Crea, edita y configura las ruletas de descuentos.', route: '/admin/ruletas' }
  ];

}
