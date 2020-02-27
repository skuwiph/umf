import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-mf-label',
    template: `<div class="mf-label"><label>{{text}}</label></div>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormLabelComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;

    name: string;
    text: string;

    constructor(private formService: MetaFormService) { }

    ngOnInit(): void {
        console.log(`LabelControl`);
        if (this.control) {
            const labelControl = this.control as MFLabelControl;
            this.name = this.control.name;
            this.text = labelControl.text;
        }
    }
}
