import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFLabelControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';

@Component({
    selector: 'app-mf-label',
    templateUrl: './mf-label.component.html',
    styleUrls: ['./mf-label.component.css']
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
