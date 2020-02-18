import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MetaFormModule } from './metaform/metaform.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MetaFormModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
