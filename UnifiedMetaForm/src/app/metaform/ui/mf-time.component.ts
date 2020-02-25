import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { MetaFormControlBase } from './mf-control-base';
import { MetaFormService } from '../meta-form.service';
import { MFTimeControl } from '../meta-form';


@Component({
    selector: 'app-mf-time',
    templateUrl: './mf-time.component.html',
    styleUrls: ['./mf-time.component.css']
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
