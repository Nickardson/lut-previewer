import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDropComponent } from './image-drop.component';

describe('ImageDropComponent', () => {
  let component: ImageDropComponent;
  let fixture: ComponentFixture<ImageDropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImageDropComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageDropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
