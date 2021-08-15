import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { downloadCanvas, mapColors, mapColorsFast } from '../image-processing';

@Component({
  selector: 'app-image-processor',
  templateUrl: './image-processor.component.html',
  styleUrls: ['./image-processor.component.scss']
})
export class ImageProcessorComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  imageData?: ImageData;

  @Input()
  lut?: ImageData;

  @Input()
  highQuality = false;

  /**
   * Require a lut present in order to render anything other than black
   */
  @Input()
  requireLut = false;

  @Input()
  showOriginal = false;

  @ViewChild('canvas')
  canvas?: ElementRef<HTMLCanvasElement>;

  imageWithLutCache?: ImageData;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    if (!this.canvas || !this.imageData) {
      // console.warn('Not loaded yet');
      return;
    }

    this.canvas.nativeElement.width = this.imageData.width;
    this.canvas.nativeElement.height = this.imageData.height;

    const ctx = this.canvas.nativeElement.getContext('2d')!;
    // const map = this.highQuality ? mapColors : mapColorsFast;
    const map = mapColorsFast;
    let out: ImageData;

    if (this.showOriginal) {
      out = this.imageData;
    } else {
      if (this.lut) {
        if (!this.imageWithLutCache) {
          out = ctx.createImageData(this.imageData.width, this.imageData.height);
          map(out, this.imageData, this.lut, 1.0);
          this.imageWithLutCache = out;
        } else {
          out = this.imageWithLutCache;
        }
      } else {
        if (this.requireLut) {
          out = ctx.createImageData(this.imageData.width, this.imageData.height);
          out.data.fill(128);
        } else {
          out = this.imageData;
        }
      }
    }

    ctx.putImageData(out, 0, 0);
  }

  ngOnChanges(_changes: SimpleChanges): void {
    // When anything that goes into rendering changes, clear the cache
    if (_changes.lut || _changes.imageData || _changes.highQuality) {
      this.imageWithLutCache = undefined;
    }

    this.render();
  }

  save(name: string, type: 'png' | 'jpg') {
    if (this.imageData && this.canvas) {
      const mime = type === 'png' ? 'image/png' : 'image/jpeg';
      downloadCanvas(this.canvas.nativeElement, mime, 1, name + '.' + type);
    }
  }
}
