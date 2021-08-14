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

  luts: LutDefinition[] = [];

  ngOnInit(): void {
    const oImg = loadImage('assets/lenna.png');
    const oLut = loadImage('assets/luts/32/Cinematic 02.png');
    // const oLut = loadImage('assets/luts/instant_consumer-1252696f.png');

    forkJoin([oImg, oLut]).subscribe(([image, lut]) => {
      this.imageData = getImageData(image);
      this.lutData = getImageData(lut);
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
        const name = file.file.name;
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

        if (i === 0) {
          this.lutData = getImageData(image);
        }
      });
    });
  }
}
