import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaFormControlBase } from './mf-control-base';
import { MetaFormService } from '../meta-form.service';
import { MFTimeControl } from '../meta-form';


@Component({
    selector: 'app-mf-time',
    template: `<form [ngClass]="{ 'error': inError }" [formGroup]="formGroup">
    <div class="time">
        <select class="mfc hh" [ngClass]="{ 'error': inError }" formControlName="hh" (blur)="onFocusLost()">
            <option *ngFor="let h of hourList; let i=index" value="{{h}}">{{h}}</option>
        </select>
        <span class="separator">:</span>
        <select class="min" [ngClass]="{ 'error': inError }" formControlName="min" (blur)="onFocusLost()">
            <option *ngFor="let m of minuteList; let i=index" value="{{m}}">{{m}}</option>
        </select>
    </div>
</form>`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormTimeComponent extends MetaFormControlBase implements OnInit {

    formGroup: FormGroup;
    hourList: string[];
    minuteList: string[];

    constructor(private mfService: MetaFormService) { super(); }

    ngOnInit(): void {
        if (this.control) {
            const timeControl = this.control as MFTimeControl;
            this.name = this.control.name;

            this.hourList = timeControl.getHourList();
            this.minuteList = timeControl.getMinuteList();

            this.formGroup = new FormGroup({
                hh: new FormControl(timeControl.getHours(this.form)),
                min: new FormControl(timeControl.getMinutes(this.form))
            });

            this.formGroup.valueChanges.subscribe(obs => {
                if (obs.hh && obs.min) {
                    const time = `${obs.hh}:${obs.min}`;
                    this.form.setValue(this.control.name, time);
                } else {
                    this.form.setValue(this.control.name, '');
                }
                this.checkControlStatus();
            });

        }
    }
}
