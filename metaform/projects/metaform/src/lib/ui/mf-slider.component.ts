import { Component, OnInit } from '@angular/core';
import { MFSliderControl } from '../metaform';
import { MetaFormService } from '../metaform.service';

import { FormControl } from '@angular/forms';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'lib-mf-slider',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <div class="mf-slider mf-control-item" [ngClass]="{'error': inError}">
        <label class="mf-slider-label">{{label}}</label>
        <input class="mf-slider-control" type="range" name="{{name}}" 
        [formControl]="formControl" min="{{min}}" max="{{max}}" step="{{step}}">
        <label class="mf-slider-value">{{value}}</label>
    </div>
</ng-template>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormSliderComponent extends MetaFormControlBase implements OnInit {

    formControl: FormControl;
    label: string;
    value: string;
    min = 0;
    max = 100;
    step = 1;

    constructor(private formService: MetaFormService) { super(); }

    ngOnInit(): void {
        this.formControl = new FormControl('');

        if (this.control) {
            const c = this.control as MFSliderControl;
            this.name = this.control.name;
            this.label = c.text;
            this.min = c.min;
            this.max = c.max;
            this.step = c.step;

            this.setReadonlyValue();

            this.formControl.setValue(this.form.getValue(this.name));

            this.formControl.valueChanges
                .subscribe(obs => {
                    this.value = obs;
                    this.form.setValue(this.control.name, obs);
                    this.checkControlStatus();
                });

            let startValue = this.form.getValue(c.name);
            if (!startValue) {
                startValue = `${Math.round(this.max / 2)}`;
            }

            this.formControl.setValue(startValue);
        }
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            const c = this.control as MFSliderControl;
            if (this.control.hasValue(this.form)) {
                const value = this.form.getValue(this.name);
                const displayValue = value;

                this.readonlyValue = `${c.text}: ${displayValue}`;
            } else {
                this.readonlyValue = `${c.text}: 0`;
            }
        }
    }
}
