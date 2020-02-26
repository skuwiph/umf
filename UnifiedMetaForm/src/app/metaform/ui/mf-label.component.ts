import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';

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

    constructor(private mfService: MetaFormService) { }

    ngOnInit(): void {
        console.log(`LabelControl`);
        if (this.control) {
            const labelControl = this.control as MFLabelControl;
            this.name = this.control.name;
            this.text = labelControl.text;
        }
    }
}
