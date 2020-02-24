import { Component, OnInit, Input, Output } from '@angular/core';
import { MFControl, MetaForm, MFControlValidityChange, MFDateControl, MFTimeControl } from '../meta-form';
import { MetaFormService } from '../meta-form.service';
import { MetaFormDateType } from '../meta-form-enums';

import { FormControl, FormGroup } from '@angular/forms';
import { EventEmitter } from '@angular/core';

@Component({
    selector: 'app-mf-time',
    templateUrl: './mf-time.component.html',
    styleUrls: ['./mf-time.component.css']
})
export class MetaFormTimeComponent implements OnInit {

    @Input() form: MetaForm;
    @Input() control: MFControl;

    @Output() changeValidity: EventEmitter<MFControlValidityChange> = new EventEmitter<MFControlValidityChange>();

    formGroup: FormGroup;
    name: string;

    inError = false;

    hourList: string[];
    minuteList: string[];

    constructor(private mfService: MetaFormService) { }

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

    onFocusLost() {
        // console.log(`Focus lost: ${this.control.name}`);
        this.checkControlStatus();
    }

    private checkControlStatus() {
        this.inError = !this.control.isValid(this.form);
        if (!this.inError) {
            this.control.isValidAsync(this.form).subscribe(
                (valid: boolean) => {
                    // console.log(`async validator finished: ${valid}`);
                    this.inError = !valid;
                    this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
                }
            );
        }
        this.changeValidity.emit(new MFControlValidityChange(this.control.controlId, !this.inError));
    }


}
