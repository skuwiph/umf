import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaFormService } from '../meta-form.service';
import { MetaFormDateType } from '../meta-form-enums';
import { MetaFormControlBase } from './mf-control-base';
import { MFDateControl } from '../meta-form';

@Component({
    selector: 'app-mf-date',
    templateUrl: './mf-date.component.html',
    styleUrls: ['./mf-date.component.css']
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
                    this.monthList = dateControl.getMonthNames();

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

}
