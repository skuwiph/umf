import { Component, OnInit, Input } from '@angular/core';
import { MFControl, MetaForm, MFControlValidityChange } from '../metaform';
import { MetaFormService } from '../metaform.service';

@Component({
    selector: 'lib-mf-error',
    template: `
        <div *ngIf="control.inError" class="errorMessage">{{ control.errorMessage }}</div>
        <div *ngIf="control.inErrorAsync" class="errorMessage">
            {{ control.errorMessagePromise | async }}
        </div>
    `,
    styleUrls: ['./mf.components.css']
})
export class MetaFormErrorComponent implements OnInit {
    @Input() form: MetaForm;
    @Input() control: MFControl;

    constructor(private formService: MetaFormService) {}

    ngOnInit(): void {}
}
