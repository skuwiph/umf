import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { MetaFormDisplayComponent } from './ui/metaform-display.component';
import { MetaFormLabelComponent } from './ui/mf-label.component';
import { MetaFormHtmlComponent } from './ui/mf-html-content.component';
import { MetaFormTextComponent } from './ui/mf-text.component';
import { MetaFormDateComponent } from './ui/mf-date.component';
import { MetaFormTimeComponent } from './ui/mf-time.component';
import { MetaFormOptionComponent } from './ui/mf-option.component';
import { MetaFormOptionMultiComponent } from './ui/mf-option-multi.component';
import { MetaFormTelephoneAndIddComponent } from './ui/mf-telephone.component';
import { MetaFormToggleComponent } from './ui/mf-toggle.component';

@NgModule({
    declarations: [
        MetaFormDisplayComponent,
        MetaFormLabelComponent,
        MetaFormHtmlComponent,
        MetaFormTextComponent,
        MetaFormOptionComponent,
        MetaFormOptionMultiComponent,
        MetaFormDateComponent,
        MetaFormTimeComponent,
        MetaFormTelephoneAndIddComponent,
        MetaFormToggleComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        MetaFormDisplayComponent
    ]
})
export class MetaFormModule { }
