import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FileHandle } from './image-drop/image-drop.component';
import { downloadCanvas, getImageData, getLutType, loadImage, scaleImage, scaleImageHQ } from './image-processing';
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

  showOriginal = false;

  identityLutName = 'Reshade Identity 32';

  ngOnInit(): void {
    loadImage('assets/lenna2.png').subscribe(image => {
      this.imageName = 'Lenna';
      this.setImage(image);
    });

    this.addLut('assets/luts/32/' + this.identityLutName + '.png', this.identityLutName, 'unwrapped');
    this.addLut('assets/luts/hald/Hald Identity 8 level 8 bit.png', 'Hald Identity 8 level 8 bit', 'hald');
    this.addLut('assets/luts/hald/Hald Identity 8 level 16 bit.png', 'Hald Identity 8 level 16 bit', 'hald');

    const lutNamesUnwrapped = [
      // https://www.on1.com/free/luts/
      'Cinematic 01',
      'Cinematic 02',
      'Cinematic 03',
      'Portrait 01',
      'Portrait 02',
      'Portrait 03',
    ];
    const lutNamesHald = [
      // https://gmic.eu/color_presets/
      'Polaroid 669',
      'Polaroid 669 +',
      'Polaroid 690',
      'Polaroid 690 +',
      // https://blog.sowerby.me/fuji-film-simulation-profiles/
      'Fuji XTrans III - Pro Neg Std',
      'Fuji XTrans III - Sepia',
      'Fuji XTrans III - Acros',
      'Fuji XTrans III - Acros+R',
      'Fuji XTrans III - Acros+G',
      'Fuji XTrans III - Acros+Ye',
      // https://obsproject.com/forum/resources/free-lut-filter-pack.594/
      'Infrared',
    ]
    lutNamesUnwrapped.forEach(lutName => this.addLut('assets/luts/32/' + lutName + '.png', lutName, 'unwrapped'));
    lutNamesHald.forEach(lutName => this.addLut('assets/luts/hald/' + lutName + '.png', lutName, 'hald'));
  }

  addLut(url: string, name: string, type: string) {
    const existingIndex = this.luts.findIndex(lut => lut.name === name);
    // Add a placeholder
    if (existingIndex === -1) {
      this.luts.push({
        name, type, data: undefined
      });
    }

    loadImage(url).subscribe(lut => {
      const data = getImageData(lut);
      const type = getLutType(data);

      const newLut = { data, name, type };

      // Recalculate as the index may have changed
      const existingIndex = this.luts.findIndex(lut => lut.name === name);
      if (existingIndex === -1) {
        // In case it got cleared out
        this.luts.push(newLut);
      } else {
        this.luts[existingIndex] = newLut;
      }

      // // Set the lut if none has been loaded
      // if (!this.lutData) {
      //   this.lutSelected(newLut);
      // }
    }, (err) => {
      const existingIndex = this.luts.findIndex(lut => lut.name === name);
      this.luts.splice(existingIndex, 1);
      console.error(err);
    });
  }

  imagesSelected(files: FileList) {
    const filesHandles: FileHandle[] = this.filesListToFileHandles(files);
    this.imagesDropped(filesHandles);
  }

  lutsSelected(files: FileList) {
    const filesHandles: FileHandle[] = this.filesListToFileHandles(files);
    this.lutsDropped(filesHandles);
  }

  private filesListToFileHandles(files: FileList) {
    const filesHandles: FileHandle[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i)!;
      filesHandles.push({
        url: window.URL.createObjectURL(file),
        file: file,
      });
    }
    return filesHandles;
  }

  imagesDropped(files: FileHandle[]) {
    // TODO: multiple images?
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
    files.sort((a, b) => a.file.name < b.file.name ? -1 : 1);
    files.forEach((file, i) => {
      this.addLut(file.url, file.file.name.replace(/\.[^/.]+$/, ""), 'unknown');
    });
  }

  lutSelected(lut: LutDefinition): void {
    this.lutData = lut.data;
    this.lutName = lut.name;
  }

  clearLuts(): void {
    // this.luts = this.luts.filter(lut => lut.name === this.identityLutName);
    this.luts = this.luts.slice(0, 3);
  }

  getLutMaxWidth(): string | undefined {
    if (this.imageData?.width) {
      if (this.lutData && this.lutData.height === this.lutData.width) {
        return '128px';
      } else {
        return this.imageData!.width + 'px';
      }
    } else {
      return undefined;
    }
  }
}
