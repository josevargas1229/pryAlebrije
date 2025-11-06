import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SwUpdatesService {
  private sw = inject(SwUpdate);
  private asked = false;

  init() {
    if (!this.sw.isEnabled) return;

    // Solo cuando la NUEVA versión ya está lista
    this.sw.versionUpdates
      .pipe(
        filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'),
        take(1) // una sola vez por sesión
      )
      .subscribe(async () => {
        if (this.asked) return;
        this.asked = true;

        const ok = confirm('Hay una nueva versión disponible. ¿Actualizar ahora?');
        if (ok) {
          await this.sw.activateUpdate();
          // Recarga cuando el nuevo SW toma control
          navigator.serviceWorker?.addEventListener('controllerchange', () => {
            location.reload();
          });
        } else {
          this.asked = false; // permite preguntar en la próxima versión
        }
      });

    // Opcional: comprobar manualmente al arrancar
    this.sw.checkForUpdate().catch(() => {});
  }
}
