import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { mapColors, mapColorsFast } from '../image-processing';

@Component({
  selector: 'app-image-processor',
  templateUrl: './image-processor.component.html',
  styleUrls: ['./image-processor.component.scss']
})
export class ImageProcessorComponent implements OnInit, AfterViewInit, OnChanges {

  @Input()
  imageData!: ImageData;

  @Input()
  lut?: ImageData;

  @Input()
  highQuality = false;

  @ViewChild('canvas')
  canvas?: ElementRef<HTMLCanvasElement>;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.render();
  }

  render(): void {
    if (!this.canvas) {
      // console.warn('Not loaded yet');
      return;
    }

    const data: ImageData = this.imageData;
    this.canvas.nativeElement.width = data.width;
    this.canvas.nativeElement.height = data.height;

    const ctx = this.canvas.nativeElement.getContext('2d')!;
    // const map = this.highQuality ? mapColors : mapColorsFast;
    const map = mapColorsFast;
    let out: ImageData;

    if (this.lut) {
      out = ctx.createImageData(data.width, data.height);
      map(out, data, this.lut, 1.0);
    } else {
      out = data;
    }

    ctx.putImageData(out, 0, 0);
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.render();
  }
}
