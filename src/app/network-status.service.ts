import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private statusSubject = new BehaviorSubject<boolean>(navigator.onLine);
  status$ = this.statusSubject.asObservable();

  constructor(private zone: NgZone) {
    window.addEventListener('online', () => {
      this.zone.run(() => this.statusSubject.next(true));
    });

    window.addEventListener('offline', () => {
      this.zone.run(() => this.statusSubject.next(false));
    });
  }
}
