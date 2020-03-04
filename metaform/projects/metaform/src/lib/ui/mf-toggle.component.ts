import { Component, OnInit } from '@angular/core';
import { MFToggleControl } from '../metaform';
import { MetaFormService } from '../metaform.service';

import { FormControl } from '@angular/forms';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'lib-mf-toggle',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <div class="toggle mf-control-item" [ngClass]="{'error': inError}" >
        <label class="textlabel">{{textLabel}}</label>
        <label class="switch">
            <input type="checkbox" name="{{name}}" [formControl]="formControl">
            <span class="slider round"></span>
        </label>
    </div>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormToggleComponent extends MetaFormControlBase implements OnInit {

    formControl: FormControl;
    textLabel: string;

    constructor(private formService: MetaFormService) { super(); }

    ngOnInit(): void {
        this.formControl = new FormControl('');

        if (this.control) {
            const toggle = this.control as MFToggleControl;
            this.name = this.control.name;
            this.textLabel = toggle.text;

            this.setReadonlyValue();

            this.formControl.setValue(this.form.getValue(this.name));

            this.formControl.valueChanges
                .subscribe(obs => {
                    this.form.setValue(this.control.name, obs);
                    this.checkControlStatus();
                });
        }
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            const c = this.control as MFToggleControl;
            if (this.control.hasValue(this.form)) {
                const value = this.form.getValue(this.name);
                let displayValue = value;

                if (value.toLowerCase() === 'true' || value.toLowerCase() === 'y'
                    || value.toLowerCase() === 'yes' || value.toLowerCase() === 'on') {
                    displayValue = 'Yes';
                } else {
                    displayValue = 'No';
                }

                this.readonlyValue = `${c.text}: ${displayValue}`;
            } else {
                this.readonlyValue = `${c.text}: No`;
            }
        }
    }
}
