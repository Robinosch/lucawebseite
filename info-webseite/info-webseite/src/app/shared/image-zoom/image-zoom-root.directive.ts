import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ImageZoomDialogComponent } from './image-zoom-dialog.component';

@Directive({
  selector: '[appImageZoomRoot]',
  standalone: true
})
export class ImageZoomRootDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dialog = inject(MatDialog);

  @HostListener('click', ['$event'])
  onHostClick(event: MouseEvent): void {
    const target = event.target as HTMLElement | null;
    const clickedImage = target?.closest('img') as HTMLImageElement | null;

    if (!clickedImage) {
      return;
    }

    if (!this.host.nativeElement.contains(clickedImage)) {
      return;
    }

    if (clickedImage.classList.contains('no-zoom') || clickedImage.dataset['noZoom'] === 'true') {
      return;
    }

    const src = clickedImage.getAttribute('src')?.trim();
    if (!src) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    this.dialog.open(ImageZoomDialogComponent, {
      data: {
        src,
        alt: clickedImage.getAttribute('alt') || 'Bildansicht'
      },
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'image-zoom-dialog-panel',
      backdropClass: 'image-zoom-backdrop',
      maxWidth: '98vw'
    });
  }
}

