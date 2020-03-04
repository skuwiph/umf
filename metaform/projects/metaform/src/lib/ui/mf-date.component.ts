import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaFormService } from '../metaform.service';
import { MetaFormDateType } from '../metaform-enums';
import { MetaFormControlBase } from './mf-control-base';
import { MFDateControl } from '../metaform';

@Component({
    selector: 'lib-mf-date',
    template: `
<div *ngIf="ro; else edit" class="mf-readonly">
    {{readonlyValue}}
</div>
<ng-template #edit>
    <form [ngClass]="{ 'error': inError }" [formGroup]="formGroup" class="control-date">
        <ng-container [ngSwitch]="dateType">
            <div class="row-prefix" *ngIf="labelText">
                <label class="control-prefix">{{labelText}}</label>
            </div>
            <div class="date" *ngSwitchCase="'full'">
                <input class="mfc dd" [ngClass]="{ 'error': inError }" formControlName="dd" size="2"
                type="number" name="{{name}}_dd"  placeholder="DD" maxLength="2" (blur)="onFocusLost()">
                <input class="mm" [ngClass]="{ 'error': inError }" formControlName="mm" size="2"
                type="number" name="{{name}}_mm"  placeholder="MM" maxLength="2" (blur)="onFocusLost()">
                <input class="yy" [ngClass]="{ 'error': inError }" formControlName="yyyy" size="4"
                type="number" name="{{name}}_yyyy"  placeholder="YYYY" maxLength="4" (blur)="onFocusLost()">
            </div>
            <div class="shortdate" *ngSwitchCase="'short'">
                <select class="mfc month" [ngClass]="{ 'error': inError }" formControlName="month" (blur)="onFocusLost()">
                    <option *ngFor="let m of monthList; let i=index" value="{{i}}">{{m}}</option>
                </select>
                <input class="yy" [ngClass]="{ 'error': inError }" formControlName="yyyy" size="4"
                type="number" name="{{name}}_yyyy" placeholder="YYYY" maxLength="4" (blur)="onFocusLost()">
            </div>
        </ng-container>
    </form>
</ng-template>
`,
    styleUrls: ['./mf.components.css']
})
export class MetaFormDateComponent extends MetaFormControlBase implements OnInit {

    formGroup: FormGroup;
    dateType: string;
    monthList: string[];

    constructor(private mfService: MetaFormService) { super(); }

    ngOnInit(): void {

        if (this.control) {
            const dateControl = this.control as MFDateControl;
            this.name = this.control.name;
            this.monthList = dateControl.getMonthNames();
            this.labelText = this.control.label;

            this.setReadonlyValue();

            switch (dateControl.dateType) {
                case MetaFormDateType.Full:
                    this.dateType = 'full';
                    this.formGroup = new FormGroup({
                        dd: new FormControl(dateControl.getDay(this.form)),
                        mm: new FormControl(dateControl.getMonth(this.form)),
                        yyyy: new FormControl(dateControl.getYear(this.form))
                    });
                    this.formGroup.valueChanges.subscribe(obs => {
                        if (obs.yyyy && obs.mm && obs.dd) {
                            const date = `${obs.yyyy}-${obs.mm}-${obs.dd}`;
                            this.form.setValue(this.control.name, date);
                        } else {
                            this.form.setValue(this.control.name, '');
                        }
                        this.checkControlStatus();
                    });
                    break;
                case MetaFormDateType.MonthYear:
                    this.dateType = 'short';

                    let month = dateControl.getMonth(this.form);
                    if (!month || month.length === 0) {
                        month = '0';
                    }

                    this.formGroup = new FormGroup({
                        month: new FormControl(month),
                        yyyy: new FormControl(dateControl.getYear(this.form))
                    });

                    this.formGroup.valueChanges.subscribe(obs => {
                        if (obs.yyyy && obs.month && +obs.month > 0) {
                            const date = `${obs.yyyy}-${obs.month}`;
                            this.form.setValue(this.control.name, date);
                        } else {
                            this.form.setValue(this.control.name, '');
                        }
                        this.checkControlStatus();
                    });
                    break;
                default:
                    this.dateType = 'full';
                    break;
            }

        }
    }

    protected setReadonlyValue(): void {
        if (this.readonly || this.control.readonly) {
            this.ro = true;
            if (this.control.hasValue(this.form)) {

                const dateControl = this.control as MFDateControl;
                const m = parseInt(dateControl.getMonth(this.form), 10);
                const y = dateControl.getYear(this.form);

                const monthName = this.monthList[m];

                switch (dateControl.dateType) {
                    case MetaFormDateType.Full:
                        const d = parseInt(dateControl.getDay(this.form), 10);
                        this.readonlyValue = `${d} ${monthName} ${y}`;
                        break;
                    case MetaFormDateType.MonthYear:
                        this.readonlyValue = `${monthName} ${y}`;
                        break;
                }
            } else {
                this.readonlyValue = 'N/A';
            }
        }
    }

}
