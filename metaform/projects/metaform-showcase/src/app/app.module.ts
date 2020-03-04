import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MetaFormModule } from 'projects/metaform/src/public-api';

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
