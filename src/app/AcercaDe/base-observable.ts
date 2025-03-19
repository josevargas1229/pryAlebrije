import { Directive, AfterViewInit, ElementRef, Renderer2 } from '@angular/core';

@Directive({
    selector: '[baseObservable]',
})
export abstract class BaseObservable implements AfterViewInit {
    constructor(protected readonly renderer: Renderer2) { }

    ngAfterViewInit(): void {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.renderer.addClass(this.getObservedElement().nativeElement, 'visible');
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2 }
        );

        observer.observe(this.getObservedElement().nativeElement);
    }

    protected abstract getObservedElement(): ElementRef;
}