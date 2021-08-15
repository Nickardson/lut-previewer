import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FileHandle } from './image-drop/image-drop.component';
import { getImageData, loadImage, scaleImage, scaleImageHQ } from './image-processing';
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
  lutData?: ImageData;
  lutName?: string;

  luts: LutDefinition[] = [];

  ngOnInit(): void {
    loadImage('assets/lenna.png').subscribe(image => {
      this.setImage(image);
    });

    const lutNames = [
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
    lutNames.forEach(lutName => this.addLut('assets/luts/32/' + lutName + '.png', lutName));
  }

  addLut(url: string, name: string) {
    loadImage(url).subscribe(lut => {
      const data = getImageData(lut);

      const newLut = { data, name };
      this.luts.push(newLut);

      // Set the lut if none has been loaded
      if (!this.lutData) {
        this.lutSelected(newLut);
      }
    });
  }

  imagesDropped(files: FileHandle[]) {
    // TODO: multiple images
    loadImage(files[0].url).subscribe(image => {
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
    this.imageDataSmall = scaleImageHQ(image, scaledW, scaledH).getContext('2d')?.getImageData(0, 0, scaledW, scaledH);
  }

  lutsDropped(files: FileHandle[]) {
    files.forEach((file, i) => {
      loadImage(file.url).subscribe(image => {
        const name = file.file.name.replace(/\.[^/.]+$/, "");
        const existingIndex = this.luts.findIndex(lut => lut.name === name);
        const newLut = {
          name,
          data: getImageData(image),
        };

        if (existingIndex === -1) {
          this.luts.push(newLut);
        } else {
          this.luts[existingIndex] = newLut;
        }

        // this.luts.sort((a, b) => a.name < b.name ? -1 : 1);

        if (i === 0) {
          this.lutSelected(newLut);
        }
      });
    });
  }

  lutSelected(lut: LutDefinition): void {
    this.lutData = lut.data;
    this.lutName = lut.name;
  }
}
