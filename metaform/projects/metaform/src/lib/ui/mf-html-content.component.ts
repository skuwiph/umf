import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

import { MFControl, MetaForm, MFHtmlTextControl } from '../metaform';
import { MetaFormService } from '../metaform.service';
import { MFValueChange } from '../metaform-data';

@Component({
    selector: 'lib-mf-html',
    template: `<div class="mf-html-content"><div [innerHtml]="html"></div></div>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormHtmlComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;

    name: string;
    html: string;

    constructor(private formService: MetaFormService, private sanitiser: DomSanitizer) { }

    ngOnInit(): void {
        if (this.control) {
            const htmlControl = this.control as MFHtmlTextControl;
            this.name = this.control.name;
            const f = MetaForm.isFieldReference(htmlControl.html);
            if (f.isField) {
                // Content derived from a field; subscribe for changes
                this.form.change$.pipe(
                    filter(
                        (c: MFValueChange) => c.name === f.fieldName)
                ).subscribe(
                    (c: MFValueChange) => {
                        this.loadContent(c.value);
                    });
            } else {
                // Static content
                this.loadContent(htmlControl.html);
            }
        }
    }

    loadContent(value: string) {

        this.html = this.sanitiser.sanitize(SecurityContext.HTML, value);

    }
}
