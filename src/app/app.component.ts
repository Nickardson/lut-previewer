import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { FileHandle } from './image-drop/image-drop.component';
import { getImageData, loadImage } from './image-processing';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'lut-previewer';

  imageData?: ImageData;
  lutData?: ImageData;

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
    // TODO: multiple images
    loadImage(files[0].url).subscribe(image => {
      this.lutData = getImageData(image);
    });
  }
}
