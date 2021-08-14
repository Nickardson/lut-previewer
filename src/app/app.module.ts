import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImageProcessorComponent } from './image-processor/image-processor.component';
import { ImageDropComponent } from './image-drop/image-drop.component';

@NgModule({
  declarations: [
    AppComponent,
    ImageProcessorComponent,
    ImageDropComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
