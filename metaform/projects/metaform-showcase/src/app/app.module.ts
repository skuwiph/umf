import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MetaFormModule } from 'projects/metaform/src/public-api';
import { AppRoutingModule } from './app-routing.module';
import { SimpleFormComponent } from './simple-form.component';
import { SimpleCodedFormComponent } from './simple-coded-form.component';
import { CodedAsyncFormComponent } from './coded-async-form.component';

@NgModule({
    declarations: [AppComponent, SimpleFormComponent, SimpleCodedFormComponent, CodedAsyncFormComponent],
    imports: [BrowserModule, MetaFormModule, AppRoutingModule],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}
