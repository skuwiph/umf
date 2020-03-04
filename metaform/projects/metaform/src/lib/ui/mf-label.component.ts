import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl } from '../metaform';
import { MetaFormService } from '../metaform.service';

@Component({
    selector: 'lib-mf-label',
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
