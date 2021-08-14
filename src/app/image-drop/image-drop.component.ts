import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-image-drop',
  templateUrl: './image-drop.component.html',
  styleUrls: ['./image-drop.component.scss']
})
export class ImageDropComponent implements OnInit {

  @Output()
  files: EventEmitter<FileHandle[]> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  isDropping = false;

  public onDragOver(evt: Event) {
    evt.stopPropagation();
    evt.preventDefault();
    this.isDropping = true;
  }

  public onDragLeave(evt: Event) {
    this.isDropping = false;
  }

  public onDrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();

    this.isDropping = false;

    if (!evt.dataTransfer) {
      // No files
      return;
    }

    let files: FileHandle[] = [];
    for (let i = 0; i < evt.dataTransfer.files.length; i++) {
      const file = evt.dataTransfer.files[i];
      // const url = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      const url = window.URL.createObjectURL(file);
      files.push({ file, url });
    }
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}

export interface FileHandle {
  file: File;
  url: string;
}
