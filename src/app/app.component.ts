import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FileHandle } from './image-drop/image-drop.component';
import { downloadCanvas, getImageData, loadImage, scaleImage, scaleImageHQ } from './image-processing';
import { LutDefinition } from './lut-selector/lut-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lut-previewer';

  /**
   * Full imagedata for preview pane
   */
  imageData?: ImageData;
  /**
   * Imagedata as used by LUT previews
   */
  imageDataSmall?: ImageData;
  imageName?: string;

  lutData?: ImageData;
  lutName?: string;

  luts: LutDefinition[] = [];

  ngOnInit(): void {
    loadImage('assets/lenna2.png').subscribe(image => {
      this.imageName = 'Lenna';
      this.setImage(image);
    });

    const lutNamesUnwrapped = [
      'Unchanged',
      // https://www.on1.com/free/luts/
      'Cinematic 01',
      'Cinematic 02',
      'Cinematic 03',
      'Cinematic 04',
      'Cinematic 05',
      'Cinematic 06',
      'Cinematic 07',
      'Cinematic 08',
      'Cinematic 09',
      'Cinematic 10',
    ];
    const lutNamesHald = [
      // https://obsproject.com/forum/resources/free-lut-filter-pack.594/
      'Infrared',
    ]
    lutNamesUnwrapped.forEach(lutName => this.addLut('assets/luts/32/' + lutName + '.png', lutName, 'unwrapped'));
    lutNamesHald.forEach(lutName => this.addLut('assets/luts/hald/' + lutName + '.png', lutName, 'hald'));
  }

  addLut(url: string, name: string, type: string) {
    loadImage(url).subscribe(lut => {
      const data = getImageData(lut);

      const newLut = { data, name, type };

      const existingIndex = this.luts.findIndex(lut => lut.name === name);
      if (existingIndex === -1) {
        this.luts.push(newLut);
      } else {
        this.luts[existingIndex] = newLut;
      }

      // Set the lut if none has been loaded
      if (!this.lutData) {
        this.lutSelected(newLut);
      }
    });
  }

  imagesDropped(files: FileHandle[]) {
    // TODO: multiple images
    loadImage(files[0].url).subscribe(image => {
      this.imageName = files[0].file.name.replace(/\.[^/.]+$/, "");
      this.setImage(image);
    });
  }

  setImage(image: HTMLImageElement): void {
    this.imageData = getImageData(image);

    const maxSize = 256;
    // Determine the multiplier to get down to the max size
    const w = this.imageData.width;
    const h = this.imageData.height;
    const ratio = Math.min(1, Math.min(maxSize / w, maxSize / h));
    const scaledW = Math.floor(w * ratio);
    const scaledH = Math.floor(h * ratio);

    if (scaledW !== w || scaledH !== h) {
      this.imageDataSmall = scaleImageHQ(image, scaledW, scaledH).getContext('2d')?.getImageData(0, 0, scaledW, scaledH);
    } else {
      this.imageDataSmall = this.imageData;
    }
  }

  lutsDropped(files: FileHandle[]) {
    files.forEach((file, i) => {
      this.addLut(file.url, file.file.name.replace(/\.[^/.]+$/, ""), 'unknown');
    });
  }

  lutSelected(lut: LutDefinition): void {
    this.lutData = lut.data;
    this.lutName = lut.name;
  }

  clearLuts(): void {
    this.luts = this.luts.filter(lut => lut.name === 'Unchanged');
  }
}
