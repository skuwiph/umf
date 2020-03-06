import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaFormService } from '../metaform.service';
import { MetaFormControlBase } from './mf-control-base';
import { MFDateTimeControl } from '../metaform';

@Component({
    selector: 'lib-mf-date-time',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <form [ngClass]="{ 'error': inError }" [formGroup]="formGroup" class="control-date">
        <div class="row-prefix" *ngIf="labelText">
            <label class="control-prefix">{{labelText}}</label>
        </div>
        <div class="datetime">
            <div class="date">
                <input class="mfc dd" [ngClass]="{ 'error': inError }" formControlName="dd" size="2"
                type="number" name="{{name}}_dd"  placeholder="DD" maxLength="2" (blur)="onFocusLost()">
                <input class="mm" [ngClass]="{ 'error': inError }" formControlName="mm" size="2"
                type="number" name="{{name}}_mm"  placeholder="MM" maxLength="2" (blur)="onFocusLost()">
                <input class="yy" [ngClass]="{ 'error': inError }" formControlName="yyyy" size="4"
                type="number" name="{{name}}_yyyy"  placeholder="YYYY" maxLength="4" (blur)="onFocusLost()">
            </div>
            <label class="datetime-sep">at</label>
            <div class="time">
                <select class="hh" [ngClass]="{ 'error': inError }" formControlName="hh" (blur)="onFocusLost()">
                    <option *ngFor="let h of hourList; let i=index" value="{{h}}">{{h}}</option>
                </select>
                <span class="separator">:</span>
                <select class="min" [ngClass]="{ 'error': inError }" formControlName="min" (blur)="onFocusLost()">
                    <option *ngFor="let m of minuteList; let i=index" value="{{m}}">{{m}}</option>
                </select>
            </div>
        </div>
    </form>
</ng-template>
`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormDateTimeComponent extends MetaFormControlBase implements OnInit {

    formGroup: FormGroup;
    dateType: string;
    monthList: string[];
    hourList: string[];
    minuteList: string[];

    constructor(private mfService: MetaFormService) { super(); }

    ngOnInit(): void {

        if (this.control) {
            const c = this.control as MFDateTimeControl;
            this.name = this.control.name;
            this.monthList = c.getMonthNames();
            this.labelText = this.control.label;
            this.hourList = c.getHourList();
            this.minuteList = c.getMinuteList();

            this.setReadonlyValue();

            this.formGroup = new FormGroup({
                dd: new FormControl(c.getDay(this.form)),
                mm: new FormControl(c.getMonth(this.form)),
                yyyy: new FormControl(c.getYear(this.form)),
                hh: new FormControl(c.getHours(this.form)),
                min: new FormControl(c.getMinutes(this.form))
            });
            this.formGroup.valueChanges.subscribe(obs => {
                if (obs.yyyy && obs.mm && obs.dd && obs.hh && obs.min) {
                    const v = `${obs.yyyy}-${obs.mm}-${obs.dd} ${obs.hh}:${obs.min}`;
                    this.form.setValue(this.control.name, v);
                } else {
                    this.form.setValue(this.control.name, '');
                }
                this.checkControlStatus();
            });

        }
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {

                const c = this.control as MFDateTimeControl;
                const m = parseInt(c.getMonth(this.form), 10);
                const y = c.getYear(this.form);
                const h = c.getHours(this.form);
                const min = c.getMinutes(this.form);

                const monthName = this.monthList[m];

                const d = parseInt(c.getDay(this.form), 10);
                this.readonlyValue = `${d} ${monthName} ${y} at ${h}:${min}`;
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }

}
