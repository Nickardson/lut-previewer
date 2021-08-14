import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LutSelectorComponent } from './lut-selector.component';

describe('LutSelectorComponent', () => {
  let component: LutSelectorComponent;
  let fixture: ComponentFixture<LutSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LutSelectorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LutSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
