
import { Component, HostListener, computed, signal, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ImageZoomData {
  src: string;
  alt?: string;
}

@Component({
  selector: 'app-image-zoom-dialog',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './image-zoom-dialog.component.html',
  styleUrl: './image-zoom-dialog.component.css'
})
export class ImageZoomDialogComponent {
  readonly data = inject<ImageZoomData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ImageZoomDialogComponent>);

  private readonly minZoom = 1;
  private readonly maxZoom = 4;
  private readonly zoomStep = 0.25;

  readonly zoom = signal(1);
  readonly translateX = signal(0);
  readonly translateY = signal(0);
  readonly isDragging = signal(false);

  private lastX = 0;
  private lastY = 0;

  readonly transformStyle = computed(
    () => `translate(${this.translateX()}px, ${this.translateY()}px) scale(${this.zoom()})`
  );

  zoomIn(): void {
    this.updateZoom(this.zoom() + this.zoomStep);
  }

  zoomOut(): void {
    this.updateZoom(this.zoom() - this.zoomStep);
  }

  resetView(): void {
    this.zoom.set(1);
    this.translateX.set(0);
    this.translateY.set(0);
  }

  close(): void {
    this.dialogRef.close();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    this.updateZoom(this.zoom() + (event.deltaY < 0 ? this.zoomStep : -this.zoomStep));
  }

  onDragStart(event: MouseEvent): void {
    if (event.button !== 0 || this.zoom() <= 1) {
      return;
    }

    event.preventDefault();
    this.isDragging.set(true);
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onDragMove(event: MouseEvent): void {
    if (!this.isDragging()) {
      return;
    }

    const diffX = event.clientX - this.lastX;
    const diffY = event.clientY - this.lastY;

    this.translateX.set(this.translateX() + diffX);
    this.translateY.set(this.translateY() + diffY);

    this.lastX = event.clientX;
    this.lastY = event.clientY;
  }

  onDragEnd(): void {
    this.isDragging.set(false);
  }

  @HostListener('document:mouseup')
  onDocumentMouseUp(): void {
    this.onDragEnd();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.close();
  }

  private updateZoom(newZoom: number): void {
    const clamped = Math.min(this.maxZoom, Math.max(this.minZoom, Number(newZoom.toFixed(2))));
    this.zoom.set(clamped);

    if (clamped <= 1) {
      this.translateX.set(0);
      this.translateY.set(0);
    }
  }
}

