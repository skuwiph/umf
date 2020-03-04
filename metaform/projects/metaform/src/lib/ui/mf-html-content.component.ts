import { Component, OnInit, Input, SecurityContext } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl, MFHtmlTextControl } from '../metaform';
import { MetaFormService } from '../metaform.service';
import { DomSanitizer } from '@angular/platform-browser';

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
            this.html = this.sanitiser.sanitize(SecurityContext.HTML, htmlControl.html);
        }
    }
}
