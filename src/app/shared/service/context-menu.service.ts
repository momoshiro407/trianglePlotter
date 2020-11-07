import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { Injectable, TemplateRef, ViewContainerRef } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class ContextMenuService {

  overlayRef: OverlayRef;
  sub: Subscription;
  isEditMenuOpened = false;

  constructor(
    public overlay: Overlay,
  ) { }

  open(event: MouseEvent, template: TemplateRef<any>, viewContainerRef: ViewContainerRef): void {
    this.close();
    this.isEditMenuOpened = true;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(event)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
    });

    this.overlayRef.attach(new TemplatePortal(template, viewContainerRef));

    // メニュー以外の部分をクリックしたらメニューを閉じる
    this.sub = fromEvent<MouseEvent>(document, 'click')
      .pipe(
        filter(event => {
          const clickTarget = event.target as HTMLElement;
          return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
        }),
        take(1)
      )
      .subscribe(() => this.close());
  }

  close(): void {
    this.sub && this.sub.unsubscribe();
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
    this.isEditMenuOpened = false;
  }
}
