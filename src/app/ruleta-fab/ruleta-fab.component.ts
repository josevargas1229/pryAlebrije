import { Component, ElementRef, HostListener, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RuletaModalComponent } from '../ruleta-modal/ruleta-modal.component';

@Component({
  standalone: true,
  selector: 'app-ruleta-fab',
  imports: [CommonModule],
  templateUrl: './ruleta-fab.component.html',
  styleUrls: ['./ruleta-fab.component.scss']
})
export class RuletaFabComponent {
  private dialog = inject(MatDialog);
  private renderer = inject(Renderer2);
  private el = inject(ElementRef);

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialX = 0;
  private initialY = 0;

  private clamp(v: number, min: number, max: number) {
    return Math.max(min, Math.min(max, v));
  }

  private getContainerRect(): DOMRect {
    const host: HTMLElement | null = document.querySelector('.main-content');
    return host ? host.getBoundingClientRect() : document.body.getBoundingClientRect();
  }

  onClick(_: MouseEvent) {
    if (this.isDragging) return;
    this.dialog.open(RuletaModalComponent, {
      panelClass: 'ruleta-dialog-panel',
      backdropClass: 'ruleta-backdrop',
      autoFocus: false
    });
  }

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    event.stopPropagation();

    const touch = (event as TouchEvent).touches?.[0];
    this.startX = touch ? touch.clientX : (event as MouseEvent).clientX;
    this.startY = touch ? touch.clientY : (event as MouseEvent).clientY;

    const fabEl: HTMLElement = this.el.nativeElement.querySelector('.ruleta-fab');
    const rect = fabEl.getBoundingClientRect();

    this.initialX = rect.left;
    this.initialY = rect.top;
    this.isDragging = false;

    const move = (e: MouseEvent | TouchEvent) => {
      const t = (e as TouchEvent).touches?.[0];
      const x = t ? t.clientX : (e as MouseEvent).clientX;
      const y = t ? t.clientY : (e as MouseEvent).clientY;
      const dx = x - this.startX;
      const dy = y - this.startY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) this.isDragging = true;

      const fab: HTMLElement = this.el.nativeElement.querySelector('.ruleta-fab');
      const fabRect = fab.getBoundingClientRect();
      const container = this.getContainerRect();

      let newLeft = this.initialX + dx;
      let newTop = this.initialY + dy;
      const margin = 6;

      const minLeft = container.left + margin;
      const minTop = container.top + margin;
      const maxLeft = container.right - fabRect.width - margin;
      const maxTop = container.bottom - fabRect.height - margin;

      newLeft = this.clamp(newLeft, minLeft, maxLeft);
      newTop = this.clamp(newTop, minTop, maxTop);

      this.renderer.setStyle(fab, 'left', `${newLeft}px`);
      this.renderer.setStyle(fab, 'top', `${newTop}px`);
      this.renderer.setStyle(fab, 'right', 'auto');
      this.renderer.setStyle(fab, 'bottom', 'auto');
    };

    const stop = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', stop);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', stop);
      setTimeout(() => (this.isDragging = false), 100);
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', stop);
  }

  @HostListener('window:resize')
  onResize() {
    const fab: HTMLElement = this.el.nativeElement.querySelector('.ruleta-fab');
    const rect = fab.getBoundingClientRect();
    const container = this.getContainerRect();
    const margin = 6;

    const minLeft = container.left + margin;
    const minTop = container.top + margin;
    const maxLeft = container.right - rect.width - margin;
    const maxTop = container.bottom - rect.height - margin;

    const newLeft = this.clamp(rect.left, minLeft, maxLeft);
    const newTop = this.clamp(rect.top, minTop, maxTop);

    this.renderer.setStyle(fab, 'left', `${newLeft}px`);
    this.renderer.setStyle(fab, 'top', `${newTop}px`);
    this.renderer.setStyle(fab, 'right', 'auto');
    this.renderer.setStyle(fab, 'bottom', 'auto');
  }
}
