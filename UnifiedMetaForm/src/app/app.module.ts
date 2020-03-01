import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MetaFormModule } from './metaform/metaform.module';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { TestFormComponent } from './test-form.component';
import { FormBuilderComponent } from './form-builder.component';
import { ControlBuilderComponent } from './control-builder.component';

@NgModule({
  declarations: [
    AppComponent,
    TestFormComponent,
    FormBuilderComponent,
    ControlBuilderComponent
  ],
  imports: [
    BrowserModule,
    MetaFormModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
