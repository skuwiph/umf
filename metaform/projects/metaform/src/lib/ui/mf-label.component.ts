import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl } from '../metaform';
import { MetaFormService } from '../metaform.service';

@Component({
    selector: 'lib-mf-label',
    template: `
        <div class="mf-label">
            <label class="{{ style }}">{{ text }}</label>
        </div>
    `,
    styleUrls: ['./mf.components.css']
})
export class MetaFormLabelComponent implements OnInit {
    @Input() form: MetaForm;
    @Input() control: MFControl;

    name: string;
    text: string;
    style = '';

    constructor(private formService: MetaFormService) {}

    ngOnInit(): void {
        if (this.control) {
            const labelControl = this.control as MFLabelControl;
            this.name = this.control.name;
            this.text = labelControl.text;
            this.style = labelControl.style ?? '';

            console.log(`Style: ${this.style}`);
        }
    }
}
