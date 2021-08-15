import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FileHandle } from './image-drop/image-drop.component';
import { getImageData, loadImage } from './image-processing';
import { LutDefinition } from './lut-selector/lut-selector.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lut-previewer';

  imageData?: ImageData;
  lutData?: ImageData;
  lutName?: string;

  luts: LutDefinition[] = [];

  ngOnInit(): void {
    loadImage('assets/lenna.png').subscribe(image => this.imageData = getImageData(image));

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
      this.imageData = getImageData(image);
    });
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
