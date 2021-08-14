import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-lut-selector',
  templateUrl: './lut-selector.component.html',
  styleUrls: ['./lut-selector.component.scss']
})
export class LutSelectorComponent implements OnInit {

  @Input()
  luts: LutDefinition[] = [];

  @Input()
  image?: ImageData;

  @Output()
  lutSelected = new EventEmitter<LutDefinition>();

  constructor() { }

  ngOnInit(): void {
  }

}

export interface LutDefinition {
  name: string;
  data: ImageData;
}