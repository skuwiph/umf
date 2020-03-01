import { Component, OnInit } from '@angular/core';
import { MFToggleControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';

import { FormControl } from '@angular/forms';
import { MetaFormControlBase } from './mf-control-base';

@Component({
    selector: 'app-mf-toggle',
    template: `
    <div class="toggle mf-control-item" [ngClass]="{'error': inError}" >
        <label class="textlabel">{{textLabel}}</label>
        <label class="switch">
            <input type="checkbox" name="{{name}}" [formControl]="formControl">
            <span class="slider round"></span>
        </label>
    </div>`,
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

            this.formControl.setValue(this.form.getValue(this.name));

            this.formControl.valueChanges
                .subscribe(obs => {
                    this.form.setValue(this.control.name, obs);
                    this.checkControlStatus();
                });
        }
    }
}
